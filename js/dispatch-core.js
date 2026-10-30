/* OKASTO dispatch demo — rules and localStorage state.
   Example data only. No network. Drivers never receive the customer price. */
(function (root, factory) {
  var api = factory();
  if (root) root.OKASTO_DISPATCH_CORE = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : null, function () {
  var VER = 1;
  var KEY = "okasto.dispatch.v1";
  var OPEN = { assigned: 1, enroute: 1, arrived: 1, picked: 1 };
  var NEXT = { assigned: "enroute", enroute: "arrived", arrived: "picked", picked: "done" };

  function create(storage, catalog) {
    function clone(o) { return JSON.parse(JSON.stringify(o)); }
    function byId(list, id) {
      if (!list) return null;
      for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
      return null;
    }
    function fail(code) { return { ok: false, code: code }; }
    function nowIso() { return new Date().toISOString(); }
    function nid() { return "N" + Date.now().toString(36) + Math.floor(Math.random() * 1000); }

    function bkkParts(iso) {
      var parts = {};
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        weekday: "short"
      }).formatToParts(new Date(iso)).forEach(function (p) {
        if (p.type !== "literal") parts[p.type] = p.value;
      });
      return parts;
    }
    function monthKey(iso) {
      var p = bkkParts(iso);
      return p.year + "-" + p.month;
    }
    function hoursUntil(job, at) {
      return (new Date(job.pickupAt).getTime() - (at || Date.now())) / 36e5;
    }
    function customerPrice(state, job) {
      var base = state.customerRates[job.vehicle][job.zone];
      return base + Math.max(0, (job.pax || 2) - 2) * 50;
    }
    function quote(state, driver, job) {
      var base = state.rates[driver.type][job.vehicle][job.zone];
      var bonus = job.bonus || 0;
      return { base: base, bonus: bonus, total: base + bonus };
    }
    function payFor(state, driver, job) {
      if (driver && job.assigneeId === driver.id && job.payoutTotal != null) {
        return { base: job.payoutBase, bonus: job.payoutBonus || 0, total: job.payoutTotal, locked: true };
      }
      return quote(state, driver, job);
    }
    function lockPay(state, job, driver) {
      var pay = quote(state, driver, job);
      job.payoutBase = pay.base;
      job.payoutBonus = pay.bonus;
      job.payoutTotal = pay.total;
      job.claimedByType = driver.type;
    }
    function openCount(state, driverId) {
      var n = 0;
      state.jobs.forEach(function (j) {
        if (j.assigneeId === driverId && OPEN[j.status]) n++;
      });
      return n;
    }
    function isUrgent(state, job) {
      if (!job || job.assigneeId || job.status !== "open" || job.tier === "cancelled") return false;
      return hoursUntil(job) <= state.settings.urgentHours;
    }
    function log(state, th, en) {
      if (!state.audit) state.audit = [];
      state.audit.unshift({ at: nowIso(), th: th, en: en });
      if (state.audit.length > 14) state.audit.length = 14;
    }
    function pushNotice(state, driverId, titleTh, titleEn, bodyTh, bodyEn, jobId) {
      state.notices.unshift({
        id: nid(),
        driverId: driverId,
        at: nowIso(),
        read: false,
        jobId: jobId || null,
        titleTh: titleTh,
        titleEn: titleEn,
        bodyTh: bodyTh,
        bodyEn: bodyEn
      });
    }
    function notifyPool(state, job) {
      var audience = job.tier === "regular" ? "regular" : job.tier === "freelance" ? "freelance" : job.tier === "all" ? "all" : null;
      if (!audience) return;
      var titleTh = audience === "regular" ? "งานใหม่ในรอบทีมประจำ" : audience === "freelance" ? "มีงานเปิดให้ฟรีแลนซ์" : "งานด่วน เปิดให้ทุกคน";
      var titleEn = audience === "regular" ? "New job in the regular window" : audience === "freelance" ? "Job open to freelancers" : "Urgent job open to everyone";
      var bonus = job.bonus ? " · โบนัส ฿" + job.bonus : "";
      state.drivers.forEach(function (d) {
        if (d.status !== "active") return;
        if (d.zone !== job.zone || d.vehicle !== job.vehicle) return;
        if (audience === "regular" && d.type !== "regular") return;
        if (audience === "freelance" && d.type !== "freelance") return;
        pushNotice(state, d.id, titleTh, titleEn,
          job.id + " " + job.pickupTh + " → " + job.dropTh + bonus + " · คนแรกที่กดรับได้งาน",
          job.id + " " + job.pickupEn + " → " + job.dropEn + (job.bonus ? " · bonus ฿" + job.bonus : "") + " · first Accept wins",
          job.id);
      });
    }
    function blockReason(state, driver, job) {
      if (!driver || !job) return "missing";
      if (driver.status === "pending") return "pending";
      if (driver.status === "suspended") return "suspended";
      if (driver.status !== "active") return "blocked";
      if (job.status === "cancelled" || job.tier === "cancelled") return "cancelled";
      if (job.assigneeId) return job.assigneeId === driver.id ? "mine" : "taken";
      if (job.status !== "open") return "closed";
      if (job.tier === "hold") return "hold";
      if (job.vehicle !== driver.vehicle) return "vehicle";
      if (job.zone !== driver.zone) return "zone";
      if (job.tier === "regular") {
        if (driver.type !== "regular") return "regular-only";
        if (!job.windowEndsAt || Date.now() >= new Date(job.windowEndsAt).getTime()) return "window-ended";
      } else if (job.tier === "freelance") {
        if (driver.type !== "freelance") return "freelance-only";
      } else if (job.tier !== "all") return "closed";
      if (driver.type === "freelance" && openCount(state, driver.id) >= state.settings.maxOpenJobs) return "cap";
      return null;
    }
    function applyExpiry(state) {
      var changed = false;
      var now = Date.now();
      state.jobs.forEach(function (job) {
        if (job.tier === "regular" && !job.assigneeId && job.status === "open" && job.windowEndsAt && now >= new Date(job.windowEndsAt).getTime()) {
          job.tier = "freelance";
          job.poolTier = "freelance";
          job.openedAt = new Date(now).toISOString();
          notifyPool(state, job);
          log(state, "รอบทีมประจำของ " + job.id + " หมดเวลา เปิดให้ฟรีแลนซ์ที่รถและโซนตรงกัน", "Regular window for " + job.id + " ended. Open to matching freelancers.");
          changed = true;
        }
      });
      return changed;
    }
    function seed() {
      var now = Date.now();
      var state = {
        v: VER,
        example: true,
        settings: clone(catalog.settings),
        rates: clone(catalog.rates),
        customerRates: clone(catalog.customerRates),
        drivers: clone(catalog.drivers),
        jobs: [],
        notices: [],
        audit: [],
        nextSignup: 1
      };
      catalog.jobs.forEach(function (t) {
        var job = clone(t);
        job.pickupAt = new Date(now + t.pickupInHours * 3600000).toISOString();
        job.customerPrice = customerPrice(state, job);
        if (t.tier === "regular") {
          job.poolTier = "regular";
          job.windowEndsAt = new Date(now + t.windowMinLeft * 60000).toISOString();
          job.releasedAt = new Date(now - 8 * 60000).toISOString();
        } else if (t.tier === "freelance") {
          job.poolTier = "freelance";
          job.openedAt = new Date(now - 20 * 60000).toISOString();
        } else if (t.tier === "all") {
          job.poolTier = "all";
          job.wasOpenAll = true;
          job.openedAt = new Date(now - 10 * 60000).toISOString();
        } else if (t.tier === "hold") {
          job.poolTier = "hold";
        } else if (t.poolTier) {
          job.poolTier = t.poolTier;
        }
        if (t.tier === "all") job.wasOpenAll = true;
        var active = job.assigneeId && (job.status === "assigned" || job.status === "enroute" || job.status === "arrived" || job.status === "picked" || job.status === "done");
        if (active) {
          var d = byId(state.drivers, job.assigneeId);
          job.tier = "assigned";
          lockPay(state, job, d);
          job.claimedAt = new Date(new Date(job.pickupAt).getTime() - 3600000).toISOString();
          if (job.status === "done") job.finishedAt = new Date(new Date(job.pickupAt).getTime() + 90 * 60000).toISOString();
        }
        delete job.pickupInHours;
        delete job.windowMinLeft;
        state.jobs.push(job);
      });
      (catalog.notices || []).forEach(function (n) {
        var copy = clone(n);
        copy.at = new Date(now - n.minutesAgo * 60000).toISOString();
        delete copy.minutesAgo;
        state.notices.push(copy);
      });
      log(state, "โหลดข้อมูลตัวอย่างแล้ว ยังไม่เชื่อมระบบจริง", "Example data loaded. Nothing is connected to a real system.");
      return state;
    }
    function readRaw() {
      var raw = storage.getItem(KEY);
      if (!raw) return null;
      try { return JSON.parse(raw); } catch (e) { return null; }
    }
    function write(state) { storage.setItem(KEY, JSON.stringify(state)); }
    function get() {
      var state = readRaw();
      if (!state || state.v !== VER || !state.example) {
        state = seed();
        write(state);
        return state;
      }
      if (applyExpiry(state)) write(state);
      return state;
    }
    function reset() {
      storage.removeItem(KEY);
      storage.removeItem(KEY + ".lock");
      return get();
    }
    function update(fn) {
      var state = get();
      var result = fn(state) || { ok: true };
      if (result.ok !== false) write(state);
      return result;
    }
    function withLock(fn) {
      var lockKey = KEY + ".lock";
      var token = Date.now() + ":" + Math.random();
      var existing = storage.getItem(lockKey);
      if (existing && Date.now() - Number(String(existing).split(":")[0]) < 1500) return fail("busy");
      storage.setItem(lockKey, token);
      if (storage.getItem(lockKey) !== token) return fail("busy");
      try {
        return fn(function () { return storage.getItem(lockKey) === token; });
      } finally {
        if (storage.getItem(lockKey) === token) storage.removeItem(lockKey);
      }
    }

    function accept(jobId, driverId, attempt) {
      var result = withLock(function (still) {
        var raw = storage.getItem(KEY);
        var state = JSON.parse(raw);
        var expired = applyExpiry(state);
        var job = byId(state.jobs, jobId);
        var driver = byId(state.drivers, driverId);
        var reason = blockReason(state, driver, job);
        if (reason) {
          if (expired) write(state);
          return fail(reason);
        }
        job.assigneeId = driver.id;
        job.status = "assigned";
        job.tier = "assigned";
        job.claimedAt = nowIso();
        lockPay(state, job, driver);
        pushNotice(state, driver.id, "คุณรับงานแล้ว", "You accepted a job",
          job.id + " ถูกล็อกให้คุณคนเดียว", job.id + " is locked to you.", job.id);
        log(state, driver.firstTh + " รับงาน " + job.id + " (ล็อกแล้ว)", driver.firstEn + " accepted " + job.id + " (locked).");
        if (!still() || storage.getItem(KEY) !== raw) return fail("retry");
        write(state);
        var saved = byId(JSON.parse(storage.getItem(KEY)).jobs, jobId);
        if (!saved || saved.assigneeId !== driverId) return fail("taken");
        return { ok: true };
      });
      if (result && result.code === "retry" && (attempt || 0) < 2) return accept(jobId, driverId, (attempt || 0) + 1);
      return result;
    }

    function advance(jobId, driverId) {
      return update(function (state) {
        var job = byId(state.jobs, jobId);
        var driver = byId(state.drivers, driverId);
        if (!job || !driver || job.assigneeId !== driverId) return fail("not-mine");
        var n = NEXT[job.status];
        if (!n) return fail("closed");
        job.status = n;
        if (n === "done") job.finishedAt = nowIso();
        log(state, driver.firstTh + " อัปเดต " + job.id + " → " + n, driver.firstEn + " updated " + job.id + " → " + n);
        return { ok: true, status: n };
      });
    }

    function returnToPool(job) {
      var pool = job.poolTier;
      job.assigneeId = null;
      job.claimedAt = null;
      job.claimedByType = null;
      job.payoutBase = null;
      job.payoutBonus = null;
      job.payoutTotal = null;
      job.finishedAt = null;
      job.status = "open";
      if (pool === "regular" && job.windowEndsAt && Date.now() < new Date(job.windowEndsAt).getTime()) {
        job.tier = "regular";
      } else if (pool === "all" || job.wasOpenAll) {
        job.tier = "all";
        job.poolTier = "all";
      } else if (pool === "hold" || !pool) {
        job.tier = "hold";
        job.poolTier = "hold";
      } else {
        job.tier = "freelance";
        job.poolTier = "freelance";
      }
    }

    function driverCancel(jobId, driverId) {
      return update(function (state) {
        var job = byId(state.jobs, jobId);
        var driver = byId(state.drivers, driverId);
        if (!job || !driver || job.assigneeId !== driverId) return fail("not-mine");
        if (job.status !== "assigned" && job.status !== "enroute" && job.status !== "arrived") return fail("too-late");
        driver.cancellations = (driver.cancellations || 0) + 1;
        var suspended = false;
        if (driver.type === "freelance" && driver.cancellations >= state.settings.cancelSuspendAt && driver.status === "active") {
          driver.status = "suspended";
          driver.suspendReason = "auto";
          suspended = true;
        }
        returnToPool(job);
        if (job.tier === "regular" || job.tier === "freelance" || job.tier === "all") notifyPool(state, job);
        log(state, driver.firstTh + " ยกเลิก " + job.id + (suspended ? " และถูกระงับอัตโนมัติ" : ""), driver.firstEn + " cancelled " + job.id + (suspended ? " and was auto-suspended" : ""));
        if (suspended) {
          pushNotice(state, driver.id, "บัญชีถูกระงับชั่วคราว", "Account suspended",
            "ยกเลิกครบ " + state.settings.cancelSuspendAt + " ครั้ง ระบบระงับการรับงานใหม่ (ตัวอย่าง)",
            "Cancelling " + state.settings.cancelSuspendAt + " times suspends new jobs (example).", null);
        }
        return { ok: true, suspended: suspended, cancellations: driver.cancellations };
      });
    }

    function assign(jobId, driverId) {
      return update(function (state) {
        var job = byId(state.jobs, jobId);
        var driver = byId(state.drivers, driverId);
        if (!job || !driver) return fail("missing");
        if (job.assigneeId || job.status === "done" || job.status === "cancelled") return fail("closed");
        if (driver.type !== "regular") return fail("regular-only");
        if (driver.status !== "active") return fail("blocked");
        if (driver.vehicle !== job.vehicle || driver.zone !== job.zone) return fail("mismatch");
        if (!job.poolTier) job.poolTier = job.tier === "hold" ? "hold" : job.tier;
        job.assigneeId = driver.id;
        job.status = "assigned";
        job.tier = "assigned";
        job.claimedAt = nowIso();
        lockPay(state, job, driver);
        pushNotice(state, driver.id, "แอดมินมอบหมายงานให้คุณ", "Dispatch assigned you a job",
          job.id + " " + job.pickupTh + " → " + job.dropTh, job.id + " " + job.pickupEn + " → " + job.dropEn, job.id);
        log(state, "มอบหมาย " + job.id + " ให้ " + driver.firstTh, "Assigned " + job.id + " to " + driver.firstEn);
        return { ok: true };
      });
    }

    function release(jobId) {
      return update(function (state) {
        var job = byId(state.jobs, jobId);
        if (!job || job.assigneeId || job.status === "done" || job.status === "cancelled") return fail("closed");
        if (job.tier === "regular" && job.windowEndsAt && Date.now() < new Date(job.windowEndsAt).getTime()) return fail("already-window");
        var mins = state.settings.priorityWindowMin;
        job.status = "open";
        job.tier = "regular";
        job.poolTier = "regular";
        job.releasedAt = nowIso();
        job.windowEndsAt = new Date(Date.now() + mins * 60000).toISOString();
        notifyPool(state, job);
        log(state, "ปล่อย " + job.id + " ให้ทีมประจำ " + mins + " นาที", "Released " + job.id + " to the regular team for " + mins + " min.");
        return { ok: true };
      });
    }

    function openAll(jobId) {
      return update(function (state) {
        var job = byId(state.jobs, jobId);
        if (!job || job.assigneeId || job.status === "cancelled" || job.status === "done") return fail("closed");
        if (!isUrgent(state, job)) return fail("not-urgent");
        if (job.tier === "all") return fail("already-open");
        job.status = "open";
        job.tier = "all";
        job.poolTier = "all";
        job.wasOpenAll = true;
        job.openedAt = nowIso();
        notifyPool(state, job);
        log(state, "เปิด " + job.id + " ให้ทุกคน (ด่วน)", "Opened " + job.id + " to everyone (urgent).");
        return { ok: true };
      });
    }

    function addBonus(jobId, amount) {
      return update(function (state) {
        var job = byId(state.jobs, jobId);
        var extra = Math.round(Number(amount));
        if (!job || job.assigneeId || job.status !== "open") return fail("closed");
        if (!isUrgent(state, job)) return fail("not-urgent");
        if (!extra || extra < 50 || extra > 2000) return fail("bad-bonus");
        job.bonus = (job.bonus || 0) + extra;
        notifyPool(state, job);
        log(state, "เพิ่มโบนัส " + job.id + " +" + extra + " รวม " + job.bonus, "Bonus on " + job.id + " +" + extra + ", total " + job.bonus);
        return { ok: true, bonus: job.bonus };
      });
    }

    function adminCancel(jobId) {
      return update(function (state) {
        var job = byId(state.jobs, jobId);
        if (!job || job.status === "done" || job.status === "cancelled") return fail("closed");
        var prev = job.assigneeId ? byId(state.drivers, job.assigneeId) : null;
        job.status = "cancelled";
        job.tier = "cancelled";
        job.assigneeId = null;
        job.payoutBase = null;
        job.payoutBonus = null;
        job.payoutTotal = null;
        if (prev) {
          pushNotice(state, prev.id, "งานถูกยกเลิกโดยแอดมิน", "Dispatch cancelled a job",
            job.id + " ถูกยกเลิก ไม่นับเป็นการยกเลิกของคุณ", job.id + " was cancelled. This does not count as your cancellation.", job.id);
        }
        log(state, "ยกเลิกงาน " + job.id, "Cancelled job " + job.id);
        return { ok: true };
      });
    }

    function reassign(jobId, driverId) {
      return update(function (state) {
        var job = byId(state.jobs, jobId);
        var driver = byId(state.drivers, driverId);
        if (!job || !driver) return fail("missing");
        if (!job.assigneeId || job.status === "done" || job.status === "cancelled") return fail("closed");
        if (driver.type !== "regular" || driver.status !== "active") return fail("regular-only");
        if (driver.vehicle !== job.vehicle || driver.zone !== job.zone) return fail("mismatch");
        if (driver.id === job.assigneeId) return fail("same");
        var prev = byId(state.drivers, job.assigneeId);
        job.assigneeId = driver.id;
        job.status = "assigned";
        job.tier = "assigned";
        job.claimedAt = nowIso();
        job.claimedByType = "regular";
        lockPay(state, job, driver);
        if (prev) pushNotice(state, prev.id, "งานถูกย้ายให้คนขับคนอื่น", "Job reassigned", job.id + " ไม่ได้อยู่กับคุณแล้ว", job.id + " is no longer yours.", job.id);
        pushNotice(state, driver.id, "แอดมินย้ายงานมาให้คุณ", "Dispatch reassigned a job to you", job.id + " " + job.pickupTh, job.id + " " + job.pickupEn, job.id);
        log(state, "ย้าย " + job.id + " ให้ " + driver.firstTh, "Reassigned " + job.id + " to " + driver.firstEn);
        return { ok: true };
      });
    }

    function docsOk(driver) {
      var d = driver.docs || {};
      return d.license && d.license.ok && d.registration && d.registration.ok && d.carPhoto && d.carPhoto.ok;
    }
    function approve(driverId) {
      return update(function (state) {
        var driver = byId(state.drivers, driverId);
        if (!driver || driver.status !== "pending") return fail("not-pending");
        if (!docsOk(driver)) return fail("docs");
        driver.status = "active";
        pushNotice(state, driver.id, "บัญชีได้รับการอนุมัติ", "Account approved",
          "คุณเห็นงานที่รถและโซนตรงกันแล้ว", "You can see jobs that match your vehicle and zone.", null);
        log(state, "อนุมัติฟรีแลนซ์ " + driver.firstTh, "Approved freelancer " + driver.firstEn);
        return { ok: true };
      });
    }
    function suspend(driverId) {
      return update(function (state) {
        var driver = byId(state.drivers, driverId);
        if (!driver || driver.status === "suspended") return fail("closed");
        driver.status = "suspended";
        driver.suspendReason = "manual";
        pushNotice(state, driver.id, "บัญชีถูกระงับ", "Account suspended",
          "แอดมินระงับการรับงานใหม่ งานที่รับไว้แล้วยังทำให้จบได้", "Dispatch paused new jobs. Jobs already accepted can still be finished.", null);
        log(state, "ระงับ " + driver.firstTh, "Suspended " + driver.firstEn);
        return { ok: true };
      });
    }
    function reinstate(driverId) {
      return update(function (state) {
        var driver = byId(state.drivers, driverId);
        if (!driver || driver.status !== "suspended") return fail("not-suspended");
        driver.status = "active";
        driver.suspendReason = null;
        pushNotice(state, driver.id, "บัญชีเปิดใช้แล้ว", "Account active again",
          "คุณรับงานใหม่ได้แล้ว", "You can accept new jobs again.", null);
        log(state, "เปิดใช้ " + driver.firstTh + " อีกครั้ง", "Reinstated " + driver.firstEn);
        return { ok: true };
      });
    }
    function forceWindowEnd(jobId) {
      return update(function (state) {
        var job = byId(state.jobs, jobId);
        if (!job || job.tier !== "regular" || job.assigneeId) return fail("closed");
        job.windowEndsAt = new Date(Date.now() - 1000).toISOString();
        applyExpiry(state);
        return { ok: true };
      });
    }
    function signup(payload) {
      return update(function (state) {
        var need = ["firstTh", "lastTh", "phone", "lineName", "zone", "vehicle", "plate"];
        for (var i = 0; i < need.length; i++) if (!payload[need[i]] || !String(payload[need[i]]).trim()) return fail("incomplete");
        if (ZONES.indexOf(payload.zone) < 0 || VEHICLES.indexOf(payload.vehicle) < 0) return fail("incomplete");
        var docs = payload.docs || {};
        if (!docs.license || !docs.license.ok || !docs.registration || !docs.registration.ok || !docs.carPhoto || !docs.carPhoto.ok) return fail("docs");
        var id = "S" + (state.nextSignup < 10 ? "0" : "") + state.nextSignup;
        state.nextSignup += 1;
        state.drivers.push({
          id: id,
          firstTh: String(payload.firstTh).trim(),
          lastTh: String(payload.lastTh).trim(),
          firstEn: String(payload.firstEn || payload.firstTh).trim(),
          lastEn: String(payload.lastEn || "Example").trim(),
          type: "freelance",
          zone: payload.zone,
          vehicle: payload.vehicle,
          rating: null,
          cancellations: 0,
          status: "pending",
          suspendReason: null,
          plate: String(payload.plate).trim(),
          phone: String(payload.phone).trim(),
          lineName: String(payload.lineName).trim(),
          docs: {
            license: { ok: true, name: docs.license.name, example: false, preview: docs.license.preview || null },
            registration: { ok: true, name: docs.registration.name, example: false, preview: docs.registration.preview || null },
            carPhoto: { ok: true, name: docs.carPhoto.name, example: false, preview: docs.carPhoto.preview || null }
          }
        });
        log(state, "ฟรีแลนซ์ใหม่รออนุมัติ " + payload.firstTh + " (" + id + ")", "New freelancer awaiting approval " + id);
        return { ok: true, id: id };
      });
    }
    function markRead(driverId) {
      return update(function (state) {
        state.notices.forEach(function (n) { if (n.driverId === driverId) n.read = true; });
        return { ok: true };
      });
    }

    function driverDTO(state, driver, job) {
      return {
        id: job.id,
        pickupAt: job.pickupAt,
        windowEndsAt: job.windowEndsAt || null,
        zone: job.zone,
        vehicle: job.vehicle,
        pickupTh: job.pickupTh,
        pickupEn: job.pickupEn,
        dropTh: job.dropTh,
        dropEn: job.dropEn,
        flight: job.flight,
        pax: job.pax,
        bags: job.bags,
        paxTh: job.paxTh,
        paxEn: job.paxEn,
        noteTh: job.noteTh,
        noteEn: job.noteEn,
        tier: job.tier,
        poolTier: job.poolTier || null,
        status: job.status,
        bonus: job.bonus || 0,
        assigneeId: job.assigneeId || null,
        pay: payFor(state, driver, job),
        urgent: isUrgent(state, job) || job.tier === "all"
      };
    }
    function visibleJobs(state, driver) {
      return state.jobs.filter(function (j) { return blockReason(state, driver, j) == null; }).sort(function (a, b) {
        var ua = isUrgent(state, a) ? 0 : 1;
        var ub = isUrgent(state, b) ? 0 : 1;
        if (ua !== ub) return ua - ub;
        return new Date(a.pickupAt) - new Date(b.pickupAt);
      });
    }
    function myJobs(state, driverId) {
      return state.jobs.filter(function (j) { return j.assigneeId === driverId && j.status !== "cancelled"; })
        .sort(function (a, b) { return new Date(a.pickupAt) - new Date(b.pickupAt); });
    }
    function earnings(state, driverId, ym) {
      var driver = byId(state.drivers, driverId);
      var rows = [];
      var base = 0;
      var bonus = 0;
      state.jobs.forEach(function (j) {
        if (j.assigneeId !== driverId || j.status !== "done") return;
        if (monthKey(j.pickupAt) !== ym) return;
        var pay = payFor(state, driver, j);
        base += pay.base;
        bonus += pay.bonus;
        rows.push(driverDTO(state, driver, j));
      });
      rows.sort(function (a, b) { return new Date(b.pickupAt) - new Date(a.pickupAt); });
      return { rows: rows, base: base, bonus: bonus, total: base + bonus, count: rows.length };
    }
    function payoutSummary(state, ym) {
      var map = {};
      state.jobs.forEach(function (j) {
        if (j.status !== "done" || !j.assigneeId || monthKey(j.pickupAt) !== ym) return;
        var d = byId(state.drivers, j.assigneeId);
        if (!d) return;
        if (!map[d.id]) map[d.id] = { driver: d, count: 0, base: 0, bonus: 0, customer: 0 };
        var row = map[d.id];
        row.count++;
        row.base += j.payoutBase || 0;
        row.bonus += j.payoutBonus || 0;
        row.customer += j.customerPrice || 0;
      });
      var rows = Object.keys(map).map(function (k) { return map[k]; });
      rows.sort(function (a, b) { return (b.base + b.bonus) - (a.base + a.bonus); });
      return rows;
    }
    function unread(state, driverId) {
      var n = 0;
      state.notices.forEach(function (x) { if (x.driverId === driverId && !x.read) n++; });
      return n;
    }

    return {
      get: get,
      reset: reset,
      accept: accept,
      advance: advance,
      driverCancel: driverCancel,
      assign: assign,
      release: release,
      openAll: openAll,
      addBonus: addBonus,
      adminCancel: adminCancel,
      reassign: reassign,
      approve: approve,
      suspend: suspend,
      reinstate: reinstate,
      forceWindowEnd: forceWindowEnd,
      signup: signup,
      markRead: markRead,
      blockReason: blockReason,
      isUrgent: isUrgent,
      openCount: openCount,
      quote: quote,
      payFor: payFor,
      driverDTO: driverDTO,
      visibleJobs: visibleJobs,
      myJobs: myJobs,
      earnings: earnings,
      payoutSummary: payoutSummary,
      monthKey: monthKey,
      bkkParts: bkkParts,
      hoursUntil: hoursUntil,
      unread: unread,
      byId: byId,
      docsOk: docsOk,
      customerPrice: customerPrice
    };
  }

  var ZONES = ["Bangkok", "Pattaya", "Phuket"];
  var VEHICLES = ["Sedan", "SUV", "Van"];
  return { create: create, VER: VER, KEY: KEY, ZONES: ZONES, VEHICLES: VEHICLES };
});
