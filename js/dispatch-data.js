/* OKASTO dispatch demo — example catalog.
   Edit this file, then refresh data/dispatch.json:
   node -e "require('fs').writeFileSync('data/dispatch.json', JSON.stringify(require('./js/dispatch-data.js'), null, 2) + '\n')"
   All names, plates, phones, flights and prices are example data. */
(function (root, factory) {
  var data = factory();
  if (root) root.OKASTO_DISPATCH = data;
  if (typeof module !== "undefined" && module.exports) module.exports = data;
})(typeof window !== "undefined" ? window : null, function () {
  var Z = ["Bangkok", "Pattaya", "Phuket"];
  var V = ["Sedan", "SUV", "Van"];
  var FIRST = [
    ["มานี", "Manee"], ["ประเสริฐ", "Prasert"], ["สุภาพ", "Suphap"], ["นภา", "Napa"],
    ["ชัยวัฒน์", "Chaiwat"], ["กมลชนก", "Kamonchanok"], ["พิมพ์", "Pim"], ["ธนา", "Thana"],
    ["อรุณ", "Arun"], ["วรรณา", "Wanna"], ["เจริญ", "Charoen"], ["สุชาติ", "Suchat"],
    ["มาลี", "Malee"], ["ปิยะ", "Piya"], ["ณัฐวุฒิ", "Nattawut"], ["สุดา", "Suda"],
    ["วิชัย", "Wichai"], ["อรทัย", "Orathai"], ["สมศักดิ์", "Somsak"], ["กาญจนา", "Kanjana"],
    ["บุญมี", "Boonmee"], ["ลัดดา", "Ladda"], ["อนุชา", "Anucha"], ["จิราภรณ์", "Jiraporn"],
    ["สมบูรณ์", "Somboon"], ["นันทนา", "Nanthana"], ["สุรีย์", "Suree"], ["อดิศร", "Adisorn"],
    ["ชนิดา", "Chanida"], ["ภาวิณี", "Pawinee"], ["เอกชัย", "Ekachai"], ["รัตนา", "Rattana"],
    ["สมหมาย", "Sommai"], ["ดวงใจ", "Duangjai"], ["ไพบูลย์", "Paiboon"], ["ศศิธร", "Sasithorn"],
    ["วรพล", "Woraphon"], ["ปราณี", "Pranee"], ["สมบูรณ์ชัย", "Somboonchai"], ["นารี", "Naree"]
  ];
  var LAST = [
    ["วงศ์ไทย", "Wongthai"], ["รุ่งเรือง", "Rungruang"], ["แสงทอง", "Saengthong"], ["มั่นคง", "Mankhong"],
    ["พูลสุข", "Poonsuk"], ["เจริญผล", "Charoenphon"], ["สายชล", "Saichon"], ["บุญมา", "Boonma"],
    ["ทองดี", "Thongdee"], ["ศรีสุข", "Srisuk"], ["อินทร", "In"], ["นวลจันทร์", "Nuanjan"],
    ["ตั้งตรง", "Tangtrong"], ["แก้วมณี", "Kaewmani"], ["สุขสันต์", "Suksant"], ["ใจเย็น", "Jaiyen"]
  ];
  var ROUTES = {
    Bangkok: [
      ["สนามบินสุวรรณภูมิ (BKK) ประตู 4", "Suvarnabhumi (BKK) Gate 4", "โรงแรมตัวอย่าง สยาม", "Example Hotel, Siam"],
      ["สนามบินดอนเมือง (DMK)", "Don Mueang (DMK)", "โรงแรมตัวอย่าง สุขุมวิท", "Example Hotel, Sukhumvit"],
      ["โรงแรมตัวอย่าง สีลม", "Example Hotel, Silom", "สนามบินสุวรรณภูมิ (BKK)", "Suvarnabhumi (BKK)"]
    ],
    Pattaya: [
      ["สนามบินสุวรรณภูมิ (BKK)", "Suvarnabhumi (BKK)", "โรงแรมตัวอย่าง พัทยาเหนือ", "Example Hotel, North Pattaya"],
      ["โรงแรมตัวอย่าง พัทยาจอมเทียน", "Example Hotel, Jomtien", "สนามบินอู่ตะเภา (UTP)", "U-Tapao (UTP)"]
    ],
    Phuket: [
      ["สนามบินภูเก็ต (HKT)", "Phuket Airport (HKT)", "ป่าตอง (ตัวอย่าง)", "Patong (example)"],
      ["สนามบินภูเก็ต (HKT)", "Phuket Airport (HKT)", "กะตะ / กะรน (ตัวอย่าง)", "Kata / Karon (example)"]
    ]
  };

  var drivers = [];
  function docs(carOk) {
    function file(name, ok) {
      return { ok: ok, name: ok ? name : "", example: true, preview: null };
    }
    return {
      license: file("license-example.jpg", true),
      registration: file("registration-example.jpg", true),
      carPhoto: file("car-example.jpg", carOk !== false)
    };
  }
  function add(d) {
    var n = drivers.length + 1;
    drivers.push({
      id: d.id,
      firstTh: d.firstTh,
      lastTh: d.lastTh,
      firstEn: d.firstEn,
      lastEn: d.lastEn,
      type: d.type,
      zone: d.zone,
      vehicle: d.vehicle,
      rating: d.rating,
      cancellations: d.cancellations || 0,
      status: d.status || "active",
      suspendReason: d.suspendReason || null,
      plate: "ตย " + String(1000 + n),
      phone: "080-000-" + String(1000 + n),
      lineName: d.firstEn.toLowerCase() + "." + d.id.toLowerCase(),
      docs: d.docs || docs(true)
    });
  }

  add({ id: "R01", firstTh: "สมชาย", lastTh: "ใจดี", firstEn: "Somchai", lastEn: "Jaidee", type: "regular", zone: "Bangkok", vehicle: "Sedan", rating: 4.9 });
  add({ id: "R02", firstTh: "วิไล", lastTh: "สุขใจ", firstEn: "Wilai", lastEn: "Sukjai", type: "regular", zone: "Pattaya", vehicle: "Van", rating: 4.8 });
  add({ id: "R03", firstTh: "อานนท์", lastTh: "ทะเล", firstEn: "Anon", lastEn: "Thale", type: "regular", zone: "Phuket", vehicle: "SUV", rating: 4.7, cancellations: 1 });
  var ni = 0;
  var n;
  for (n = 4; n <= 30; n++) {
    var fn = FIRST[ni++];
    var ln = LAST[(n - 4) % LAST.length];
    add({
      id: "R" + (n < 10 ? "0" : "") + n,
      firstTh: fn[0], lastTh: ln[0], firstEn: fn[1], lastEn: ln[1],
      type: "regular",
      zone: Z[n % 3],
      vehicle: V[Math.floor(n / 3) % 3],
      rating: Math.round((4.5 + ((n * 3) % 5) * 0.1) * 10) / 10,
      cancellations: n % 17 === 0 ? 1 : 0
    });
  }

  add({ id: "F01", firstTh: "มานะ", lastTh: "รักงาน", firstEn: "Mana", lastEn: "Rakngan", type: "freelance", zone: "Bangkok", vehicle: "Sedan", rating: 4.9, cancellations: 1 });
  add({ id: "F02", firstTh: "ศิริพร", lastTh: "วงศ์ดี", firstEn: "Siriporn", lastEn: "Wongdee", type: "freelance", zone: "Pattaya", vehicle: "Van", rating: 4.7 });
  add({ id: "F03", firstTh: "วรพล", lastTh: "ทะเล", firstEn: "Woraphon", lastEn: "Thale", type: "freelance", zone: "Phuket", vehicle: "SUV", rating: 4.6 });
  add({ id: "F04", firstTh: "วิทยา", lastTh: "ทดลอง", firstEn: "Witthaya", lastEn: "Thotlong", type: "freelance", zone: "Bangkok", vehicle: "Sedan", rating: 4.4, cancellations: 2 });
  add({ id: "F05", firstTh: "มานี", lastTh: "วงศ์ไทย", firstEn: "Manee", lastEn: "Wongthai", type: "freelance", zone: "Bangkok", vehicle: "Sedan", rating: 4.8 });

  for (n = 6; n <= 40; n++) {
    if (n === 29) continue;
    fn = FIRST[ni % FIRST.length];
    ln = LAST[ni % LAST.length];
    ni++;
    add({
      id: "F" + (n < 10 ? "0" : "") + n,
      firstTh: fn[0], lastTh: ln[0], firstEn: fn[1], lastEn: ln[1],
      type: "freelance",
      zone: Z[n % 3],
      vehicle: V[(n + 1) % 3],
      rating: Math.round((4.4 + ((n * 2) % 6) * 0.1) * 10) / 10,
      cancellations: n % 13 === 0 ? 1 : 0
    });
  }
  add({ id: "F29", firstTh: "กิตติ", lastTh: "ยกเลิก", firstEn: "Kitti", lastEn: "Yokloek", type: "freelance", zone: "Phuket", vehicle: "SUV", rating: 3.8, cancellations: 4, status: "suspended", suspendReason: "auto" });
  add({ id: "F41", firstTh: "ชนิดา", lastTh: "รอตรวจ", firstEn: "Chanida", lastEn: "Rortruat", type: "freelance", zone: "Bangkok", vehicle: "Van", rating: null, status: "pending" });
  add({ id: "F42", firstTh: "อดิศร", lastTh: "ขาดรูป", firstEn: "Adisorn", lastEn: "Khatrup", type: "freelance", zone: "Pattaya", vehicle: "Sedan", rating: null, status: "pending", docs: docs(false) });
  add({ id: "F43", firstTh: "รัตนา", lastTh: "สมัครใหม่", firstEn: "Rattana", lastEn: "Samakmai", type: "freelance", zone: "Phuket", vehicle: "SUV", rating: null, status: "pending" });
  add({ id: "F44", firstTh: "สมหมาย", lastTh: "รอตรวจ", firstEn: "Sommai", lastEn: "Rortruat", type: "freelance", zone: "Bangkok", vehicle: "Sedan", rating: null, status: "pending" });
  add({ id: "F46", firstTh: "สุรีย์", lastTh: "ระงับ", firstEn: "Suree", lastEn: "Rangap", type: "freelance", zone: "Bangkok", vehicle: "Sedan", rating: 4.1, cancellations: 3, status: "suspended", suspendReason: "auto" });
  add({ id: "F47", firstTh: "ภาวิณี", lastTh: "ระงับ", firstEn: "Pawinee", lastEn: "Rangap", type: "freelance", zone: "Pattaya", vehicle: "Van", rating: 3.9, cancellations: 5, status: "suspended", suspendReason: "manual" });
  add({ id: "F48", firstTh: "ไพบูลย์", lastTh: "ระงับ", firstEn: "Paiboon", lastEn: "Rangap", type: "freelance", zone: "Phuket", vehicle: "Sedan", rating: 4.0, cancellations: 3, status: "suspended", suspendReason: "auto" });

  function byId(id) {
    for (var i = 0; i < drivers.length; i++) if (drivers[i].id === id) return drivers[i];
    return null;
  }

  var jobs = [];
  var guestN = 0;
  var GUESTS = ["เอ", "บี", "ซี", "ดี", "อี", "เอฟ", "จี", "เอช", "ไอ", "เจ", "เค", "แอล", "เอ็ม", "เอ็น", "โอ", "พี", "คิว", "อาร์", "เอส", "ที", "ยู"];
  var GUESTS_EN = ["Alex", "Bailey", "Casey", "Dana", "Ellis", "Fran", "Gray", "Harper", "Indigo", "Jules", "Kelly", "Lee", "Morgan", "Noel", "Olive", "Parker", "Quinn", "Riley", "Sam", "Taylor", "Uma"];
  function J(o) {
    var zone = o.zone;
    var vehicle = o.vehicle;
    if (o.who && (!zone || !vehicle)) {
      var d = byId(o.who);
      zone = d.zone;
      vehicle = d.vehicle;
    }
    var rt = ROUTES[zone][o.route || 0];
    var g = guestN++ % GUESTS.length;
    jobs.push({
      id: o.id,
      tier: o.tier,
      status: o.status || "open",
      pickupInHours: o.h,
      windowMinLeft: o.win || 0,
      zone: zone,
      vehicle: vehicle,
      pickupTh: rt[0],
      pickupEn: rt[1],
      dropTh: rt[2],
      dropEn: rt[3],
      flight: o.flight,
      pax: o.pax == null ? 2 : o.pax,
      bags: o.bags == null ? 2 : o.bags,
      paxTh: o.paxTh || ("คุณ" + GUESTS[g] + " (ตัวอย่าง)"),
      paxEn: o.paxEn || (GUESTS_EN[g] + " Example"),
      bonus: o.bonus || 0,
      assigneeId: o.who || null,
      noteTh: o.noteTh || "ป้ายชื่อ OKASTO · ข้อมูลตัวอย่าง",
      noteEn: o.noteEn || "OKASTO name sign · example data",
      poolTier: o.pool || null
    });
  }

  J({ id: "OK-EX-1042", tier: "hold", h: 26, zone: "Bangkok", vehicle: "Sedan", route: 0, flight: "TG410", pax: 2, bags: 2 });
  J({ id: "OK-EX-1136", tier: "hold", h: 14, zone: "Phuket", vehicle: "SUV", route: 0, flight: "VZ104", pax: 3, bags: 3 });
  J({ id: "OK-EX-1155", tier: "hold", h: 20, zone: "Pattaya", vehicle: "Sedan", route: 0, flight: "PG280", pax: 2, bags: 2 });
  J({ id: "OK-EX-1170", tier: "hold", h: 18, zone: "Bangkok", vehicle: "Van", route: 1, flight: "SL500", pax: 7, bags: 7, paxTh: "กรุ๊ปตัวอย่าง", paxEn: "Example group" });

  J({ id: "OK-EX-1048", tier: "regular", h: 6.5, win: 22, zone: "Bangkok", vehicle: "Sedan", route: 1, flight: "TG661", pax: 2, bags: 3 });
  J({ id: "OK-EX-1051", tier: "regular", h: 9, win: 38, zone: "Bangkok", vehicle: "SUV", route: 0, flight: "FD3011", pax: 3, bags: 3 });
  J({ id: "OK-EX-1055", tier: "regular", h: 5, win: 17, zone: "Pattaya", vehicle: "Van", route: 0, flight: "PG271", pax: 6, bags: 6, paxTh: "กรุ๊ปตัวอย่าง พัทยา", paxEn: "Example group Pattaya" });
  J({ id: "OK-EX-1144", tier: "regular", h: 2.6, win: 11, zone: "Bangkok", vehicle: "Sedan", route: 0, flight: "WE201", pax: 1, bags: 1 });

  J({ id: "OK-EX-1061", tier: "freelance", h: 4.5, zone: "Bangkok", vehicle: "Sedan", route: 2, flight: "TG202", pax: 1, bags: 2 });
  J({ id: "OK-EX-1066", tier: "freelance", h: 8, zone: "Phuket", vehicle: "SUV", route: 1, flight: "FD550", pax: 4, bags: 4 });
  J({ id: "OK-EX-1077", tier: "freelance", h: 7, zone: "Pattaya", vehicle: "Van", route: 1, flight: "SL396", pax: 5, bags: 5 });
  J({ id: "OK-EX-1150", tier: "freelance", h: 10, zone: "Bangkok", vehicle: "SUV", route: 1, flight: "TG777", pax: 3, bags: 2 });
  J({ id: "OK-EX-1158", tier: "freelance", h: 9, zone: "Phuket", vehicle: "Van", route: 0, flight: "VZ220", pax: 8, bags: 8, paxTh: "กรุ๊ปตัวอย่าง ภูเก็ต", paxEn: "Example group Phuket" });
  J({ id: "OK-EX-1162", tier: "freelance", h: 6, zone: "Pattaya", vehicle: "Sedan", route: 0, flight: "PG300", pax: 2, bags: 2 });
  J({ id: "OK-EX-1180", tier: "freelance", h: 8, zone: "Bangkok", vehicle: "Van", route: 1, flight: "SL610", pax: 6, bags: 6 });

  J({ id: "OK-EX-1070", tier: "all", h: 2.2, zone: "Bangkok", vehicle: "Sedan", route: 0, flight: "TG888", pax: 2, bags: 2, bonus: 200 });
  J({ id: "OK-EX-1074", tier: "all", h: 1.5, zone: "Pattaya", vehicle: "Van", route: 0, flight: "FD900", pax: 6, bags: 5, bonus: 300 });

  J({ id: "OK-EX-1080", tier: "assigned", status: "assigned", h: 3.8, who: "R01", pool: "hold", route: 1, flight: "TG100", pax: 2, bags: 2 });
  J({ id: "OK-EX-1088", tier: "assigned", status: "arrived", h: 0.8, who: "R01", pool: "regular", route: 0, flight: "TG320", pax: 2, bags: 3 });
  J({ id: "OK-EX-1092", tier: "assigned", status: "enroute", h: 1.1, who: "R02", pool: "regular", route: 0, flight: "PG111", pax: 4, bags: 4 });
  J({ id: "OK-EX-1099", tier: "assigned", status: "picked", h: 0.4, who: "F01", pool: "freelance", route: 2, flight: "TG150", pax: 1, bags: 1 });
  J({ id: "OK-EX-1104", tier: "assigned", status: "assigned", h: 4, who: "F02", pool: "freelance", route: 1, flight: "SL210", pax: 5, bags: 5 });
  J({ id: "OK-EX-1108", tier: "assigned", status: "enroute", h: 1.6, who: "F02", pool: "all", bonus: 150, route: 0, flight: "PG404", pax: 6, bags: 6 });
  J({ id: "OK-EX-1160", tier: "assigned", status: "assigned", h: 5.5, who: "F04", pool: "freelance", route: 0, flight: "WE330", pax: 2, bags: 2 });

  function done(id, who, hoursAgo, bonus, flight) {
    J({ id: id, tier: "assigned", status: "done", h: -hoursAgo, who: who, bonus: bonus || 0, pool: "freelance", flight: flight, pax: 2, bags: 2, route: hoursAgo % 2 });
  }
  done("OK-EX-2001", "R01", 30, 0, "TG611");
  done("OK-EX-2002", "R01", 90, 0, "TG612");
  done("OK-EX-2003", "R01", 200, 100, "TG613");
  done("OK-EX-2004", "R02", 40, 0, "PG201");
  done("OK-EX-2005", "R02", 160, 0, "PG202");
  done("OK-EX-2006", "R03", 55, 0, "VZ301");
  done("OK-EX-2007", "R03", 220, 0, "VZ302");
  done("OK-EX-2008", "F01", 20, 200, "TG701");
  done("OK-EX-2009", "F01", 100, 0, "TG702");
  done("OK-EX-2010", "F01", 300, 0, "TG703");
  done("OK-EX-2011", "F02", 70, 0, "SL701");
  done("OK-EX-2012", "F02", 180, 150, "SL702");
  done("OK-EX-2013", "F03", 48, 0, "FD801");
  done("OK-EX-2014", "F03", 260, 0, "FD802");
  done("OK-EX-2015", "R06", 110, 0, "TG801");
  done("OK-EX-2016", "F06", 130, 0, "PG801");
  done("OK-EX-2017", "R10", 75, 0, "VZ801");
  done("OK-EX-2018", "F10", 95, 0, "SL801");
  done("OK-EX-2090", "R01", 840, 0, "TG901");
  done("OK-EX-2091", "F01", 900, 0, "TG902");

  J({
    id: "OK-EX-1130", tier: "cancelled", status: "cancelled", h: 3,
    zone: "Bangkok", vehicle: "Sedan", route: 0, flight: "TG999", pax: 2, bags: 1,
    noteTh: "แอดมินยกเลิกงานนี้ (ตัวอย่าง)", noteEn: "Cancelled by admin (example)"
  });

  return {
    example: true,
    labelTh: "ข้อมูลตัวอย่าง",
    labelEn: "Example data",
    settings: {
      priorityWindowMin: 30,
      urgentHours: 3,
      maxOpenJobs: 3,
      cancelSuspendAt: 3,
      regularFleet: 30,
      freelanceFleetAbout: 200,
      fleetNoteTh: "ในเดโมนี้มีคนขับประจำ 30 คน และฟรีแลนซ์ตัวอย่างบางส่วน บริษัทมีฟรีแลนซ์ประมาณ 200 คน",
      fleetNoteEn: "This demo includes 30 regular drivers and a sample of freelancers. The company has about 200 freelancers."
    },
    rates: {
      regular: {
        Sedan: { Bangkok: 700, Pattaya: 1100, Phuket: 650 },
        SUV: { Bangkok: 900, Pattaya: 1400, Phuket: 850 },
        Van: { Bangkok: 1200, Pattaya: 1800, Phuket: 1100 }
      },
      freelance: {
        Sedan: { Bangkok: 880, Pattaya: 1350, Phuket: 800 },
        SUV: { Bangkok: 1120, Pattaya: 1680, Phuket: 1050 },
        Van: { Bangkok: 1480, Pattaya: 2150, Phuket: 1350 }
      }
    },
    customerRates: {
      Sedan: { Bangkok: 1490, Pattaya: 2090, Phuket: 1290 },
      SUV: { Bangkok: 1890, Pattaya: 2590, Phuket: 1690 },
      Van: { Bangkok: 2490, Pattaya: 3290, Phuket: 2190 }
    },
    featured: ["R01", "R02", "R03", "F01", "F02", "F04", "F05", "F29", "F41", "F42"],
    drivers: drivers,
    jobs: jobs,
    notices: [
      { id: "N1", driverId: "R01", minutesAgo: 35, read: false, jobId: "OK-EX-1048", titleTh: "งานใหม่ในรอบทีมประจำ", titleEn: "New job in the regular window", bodyTh: "OK-EX-1048 เปิดให้ทีมประจำรับก่อน คนแรกที่กดรับจะได้งาน", bodyEn: "OK-EX-1048 is open to the regular team first. The first Accept wins." },
      { id: "N2", driverId: "R01", minutesAgo: 12, read: false, jobId: "OK-EX-1070", titleTh: "งานด่วน มีโบนัส", titleEn: "Urgent job with a bonus", bodyTh: "OK-EX-1070 เปิดให้ทุกคนแล้ว โบนัสตัวอย่าง ฿200", bodyEn: "OK-EX-1070 is open to everyone. Example bonus ฿200." },
      { id: "N3", driverId: "F01", minutesAgo: 25, read: false, jobId: "OK-EX-1061", titleTh: "มีงานตรงกับรถและโซนของคุณ", titleEn: "A job matches your vehicle and zone", bodyTh: "OK-EX-1061 เปิดให้ฟรีแลนซ์ กดรับได้คนเดียว", bodyEn: "OK-EX-1061 is open to freelancers. Only one driver can accept it." },
      { id: "N4", driverId: "F02", minutesAgo: 50, read: true, jobId: "OK-EX-1077", titleTh: "งานรถตู้พัทยา", titleEn: "Pattaya van job", bodyTh: "OK-EX-1077 เปิดอยู่ คุณรับงานค้างได้อีก 1 งาน (สูงสุด 3)", bodyEn: "OK-EX-1077 is open. You can hold 1 more job (maximum 3)." }
    ]
  };
});
