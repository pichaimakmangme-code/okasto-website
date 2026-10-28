#!/usr/bin/env python3
"""Generate diagram.html and doc.html for the OKASTO sitemap v2 from data.py."""
import html, os, collections
from data import P, G, GROUPS, FACTS, PARTNERS, JOURNEYS, BENCH
E = html.escape
HERE = os.path.dirname(os.path.abspath(__file__))
BYID = {p["id"]: p for p in P}
ST = {"built": ("Built", "บน build แล้ว"), "launch": ("Launch", "ทำก่อนเปิด"), "p2": ("Phase 2", "เฟส 2")}

CSS = r"""
:root{--bg1:#F5FAFF;--bg2:#EAF4FE;--line:#E3EEF9;--line2:#D6EAFC;--btn:#8CC8F5;--btnink:#062A57;--blue:#1668B8;--navy:#04306D;--text:#10274A;--muted:#4F6280;
--green:#0A7A2F;--green50:#E6F9EC;--yel:#8A5A00;--yel50:#FFF4DC;--red:#C2141B;--red50:#FDECEC}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Nunito,Kanit,"DejaVu Sans",sans-serif;color:var(--text);-webkit-font-smoothing:antialiased}
.th{font-family:Kanit,Nunito,sans-serif;font-weight:400;color:var(--muted)}
.mono{font-family:"DejaVu Sans Mono",monospace;font-size:.86em;color:var(--blue)}
.chip{display:inline-flex;align-items:center;gap:6px;border-radius:999px;font-weight:800;font-size:15px;padding:3px 11px;white-space:nowrap;line-height:1.35}
.s-built{background:var(--green50);color:var(--green);border:1.5px solid #9EDDB2}
.s-launch{background:#E0F0FF;color:var(--blue);border:1.5px solid #8CC8F5}
.s-p2{background:#F1F3F6;color:#5D6B80;border:1.5px dashed #9AA7B8}
.t-draft{background:var(--yel50);color:var(--yel);border:1.5px solid #EBC777}
.t-noidx{background:#fff;color:var(--muted);border:1.5px solid var(--line2)}
.lv{background:var(--navy);color:#fff;border:0}
.dot{width:9px;height:9px;border-radius:50%;background:currentColor;display:inline-block}
"""

def chip_status(s, small=False):
    return f'<span class="chip s-{s}">{"" if s=="p2" else "<i class=dot></i>"}{ST[s][0]}</span>'

def chips(p):
    out = [f'<span class="chip lv">L{p["level"]}</span>', chip_status(p["status"])]
    if "draft" in p["tags"]: out.append('<span class="chip t-draft">Draft</span>')
    if p["index"].startswith("noindex"): out.append('<span class="chip t-noidx">noindex</span>')
    return "".join(out)

# ---------------------------------------------------------------- diagram
def card(p, extra_cls=""):
    g = G[p["group"]]
    today = f'<div class="today">Today: {E(p["today"])}</div>' if p["today"] and p["status"]=="built" and p["today"] not in ("about.html","contact.html","terms.html","privacy.html","admin.html") else ""
    return f'''<div class="card st-{p["status"]} lvl{p["level"]} {extra_cls}" id="c-{p["id"]}" style="--ink:{g[3]};--tint:{g[4]};--gl:{g[5]}">
 <div class="ch"><div class="nm">{E(p["name"])}<div class="th">{E(p["th"])}</div></div></div>
 <div class="url mono">{E(p["url"])}</div>
 <div class="chips">{chips(p)}</div>
 <div class="key">{E(p["key"])}</div>{today}
</div>'''

def column(gid, inner, w):
    g = G[gid]
    n = sum(1 for p in P if p["group"]==gid)
    return f'''<div class="col" id="col-{gid}" style="width:{w}px;--ink:{g[3]};--tint:{g[4]};--gl:{g[5]}">
<div class="gh"><div class="gname">{E(g[1])} <span class="gn">{n}</span></div><div class="th">{E(g[2])}</div></div>
{inner}</div>'''

def stack(ids, arrows=False):
    parts = []
    for i, pid in enumerate(ids):
        if i and arrows: parts.append('<div class="arr">↓</div>')
        parts.append(card(BYID[pid]))
    return "\n".join(parts)

def diagram():
    cnt = collections.Counter(p["status"] for p in P)
    byg = collections.OrderedDict((g[0], collections.Counter()) for g in GROUPS)
    for p in P: byg[p["group"]][p["status"]] += 1
    # columns
    core = card(BYID["routes"]) + '<div class="sub">' + card(BYID["fleet"]) + card(BYID["luggage"]) + '</div>' + card(BYID["charter"]) + card(BYID["services"])
    core = card(BYID["routes"]) + card(BYID["fleet"]) + '<div class="kid">' + card(BYID["luggage"]) + '</div>' + card(BYID["charter"]) + card(BYID["services"])
    book = stack(["b1","b2","b3","b4","b5"], arrows=True) + '<div class="branch">↳ if payment fails at step 4 · ชำระไม่ผ่าน</div>' + card(BYID["b6"])
    air = "".join(card(p) for p in P if p.get("sub")=="air")
    city = "".join(card(p) for p in P if p.get("sub")=="city")
    seo = (card(BYID["hub"]) +
           f'<div class="split"><div><div class="subh">Airports · สนามบิน</div><div class="kid">{air}</div></div>'
           f'<div><div class="subh">Cities · เมือง</div><div class="kid">{city}</div></div></div>'
           '<div class="kid kid3">' + card(BYID["route"], "wide") +
           '<div class="routes">' + "".join(f'<span>{r}</span>' for r in ["BKK → Bangkok","BKK → Pattaya","DMK → Bangkok","DMK → Pattaya","HKT → Patong","HKT → Kata / Karon"]) + '</div></div>')
    sup = card(BYID["help"]) + '<div class="kid">' + card(BYID["meet"]) + '</div>' + card(BYID["manage"]) + card(BYID["contact"])
    trust = card(BYID["about"]) + '<div class="kid">' + card(BYID["standards"]) + '</div>' + "".join(card(BYID[i]) for i in ["reviews","policy","terms","privacy","cookies","404"])
    trust = card(BYID["about"]) + '<div class="kid">' + card(BYID["standards"]) + card(BYID["reviews"]) + '</div>' + "".join(card(BYID[i]) for i in ["policy","terms","privacy","cookies","404"])
    paynote = ('<div class="pnote"><b>2 payment options</b> · ตัวเลือกการชำระบนฟอร์มจอง (not separate URLs)<br>'
               '1. Book now, settle at month end (credit) — only if creditEnabled; optional credit limit. Due now ฿0; contract price on the monthly invoice.<br>'
               '2. Pay now via OKASTO payment (Beam), kickback at month end — pay the public price; commission = public − contract. Placeholder only, no cash.</div>')
    b2b = (card(BYID["partners"]) + '<div class="kid">' + card(BYID["corporate"]) + card(BYID["hotels"]) + '</div>' + card(BYID["drive"]) +
           f'<div class="pnote"><b>Also available on</b> (grey text, no logos)<br>{E(PARTNERS)}</div>' +
           '<div class="subh">Partner booking (Agency / Hotel)<div class="th" style="font-size:16px;font-weight:700;margin-top:2px">ลิงก์จองพาร์ทเนอร์</div></div>' +
           card(BYID["pbk"]) + '<div class="kid">' + card(BYID["psent"]) + card(BYID["pstm"]) + '</div>' +
           paynote)
    back = '<div class="lock">Login required · not linked from the public site · ต้องล็อกอิน</div>' + "".join(card(BYID[i]) for i in ["admin","bookings","dispatch","inbox"])
    W = {"core":440,"book":440,"seo":900,"sup":440,"trust":440,"b2b":440,"back":400}
    cols = "".join(column(g, inner, W[g]) for g, inner in [("core",core),("book",book),("seo",seo),("sup",sup),("trust",trust),("b2b",b2b),("back",back)])

    # journeys
    jr = []
    for code, name, th, steps, note in JOURNEYS:
        st = '<span class="ja">→</span>'.join(
            f'<span class="js" style="--ink:{G[BYID[pid]["group"]][3]};--tint:{G[BYID[pid]["group"]][4]};--gl:{G[BYID[pid]["group"]][5]}">{E(lbl)}</span>' for pid, lbl in steps)
        jr.append(f'<div class="jrow"><div class="jn"><b>{code}</b> {E(name)}<div class="th">{E(th)}</div></div><div class="jsteps">{st}<div class="jnote">{E(note)}</div></div></div>')
    rows = "".join(f'<tr><td><i class="sw" style="background:{G[g][3]}"></i>{E(G[g][1])}</td><td>{c["built"]}</td><td>{c["launch"]}</td><td>{c["p2"]}</td><td><b>{sum(c.values())}</b></td></tr>' for g, c in byg.items())
    glance = f'''<div class="glance"><h3>At a glance <span class="th">สรุปจำนวนหน้า</span></h3>
<table><tr><th>Group</th><th>Built</th><th>Launch</th><th>Ph. 2</th><th>Total</th></tr>{rows}
<tr class="tot"><td>All pages</td><td>{cnt["built"]}</td><td>{cnt["launch"]}</td><td>{cnt["p2"]}</td><td>{len(P)}</td></tr></table>
<p>Route-page template counted once (6 routes at launch). Funnel steps count as pages.</p>
<div class="scope"><b>{cnt["built"]+cnt["launch"]}</b> pages for go-live (Built + Launch)<span class="th">หน้าที่ต้องพร้อมวันเปิดเว็บ</span></div>
<h4>New in v2 · สิ่งที่เพิ่มจาก v1</h4><ul class="new"><li>Full booking funnel incl. failed-payment recovery</li><li>Manage booking + meeting points + help centre</li><li>SEO pages per airport, city and route</li><li>Partner / corporate / driver doors (Phase 2)</li><li>Partner booking demo: private /p/&lt;partnerId&gt; link, statement, credit or Beam kickback (noindex)</li><li>Build status on every page + journeys</li></ul></div>'''

    legend = "".join(f'<span class="lg"><i class="sw" style="background:{g[3]}"></i>{E(g[1])}</span>' for g in GROUPS)
    globals_ = ["Header nav: Routes & Prices · Fleet · Charter · Service info · Help · <b>Book & Pay</b>",
                "Footer: About · Contact · Booking policy · Terms · Privacy · Partners",
                "Language switch TH / EN / 中文 + hreflang",
                "Floating LINE · WhatsApp — questions only",
                "Mobile sticky “Book & Pay” button",
                "Payment: online via Beam only · no cash"]
    gl = "".join(f'<span class="gel">{x}</span>' for x in globals_)
    home = BYID["home"]
    return f'''<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="fonts.css"><style>{CSS}
body{{width:3840px;background:var(--bg1);padding:70px 80px 80px}}
.top{{display:flex;justify-content:space-between;align-items:flex-end;gap:40px;padding-bottom:30px;border-bottom:2px solid var(--line2)}}
.brand{{display:flex;align-items:center;gap:34px}} .brand img{{height:78px}}
.brand h1{{font-size:54px;font-weight:800;color:var(--navy);letter-spacing:-.5px;line-height:1.05}} .brand h1 small{{font-size:26px;font-weight:600;color:var(--muted);margin-left:14px}}
.brand p{{font-size:22px;color:var(--muted);margin-top:8px;font-weight:600}}
.legend{{display:flex;flex-direction:column;gap:12px;align-items:flex-end}} .legend .row{{display:flex;gap:18px;align-items:center;font-size:18px;font-weight:700}}
.lg{{display:inline-flex;align-items:center;gap:8px}} .sw{{width:16px;height:16px;border-radius:5px;display:inline-block;margin-right:6px;vertical-align:-2px}}
.legend .lbl{{color:var(--muted);font-weight:800;font-size:15px;letter-spacing:1px;text-transform:uppercase}}
.gbar{{margin:28px 0 0;background:#fff;border:1.5px solid var(--line2);border-radius:20px;padding:16px 22px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}}
.gbar .lbl{{font-weight:800;color:var(--navy);font-size:19px;margin-right:6px}} .gel{{background:var(--bg2);border-radius:12px;padding:8px 14px;font-size:17px;font-weight:600}}
.homewrap{{display:flex;justify-content:center;margin-top:46px}}
.home{{width:1100px;background:#fff;border:3px solid var(--navy);border-radius:26px;padding:26px 34px;box-shadow:0 14px 40px rgba(4,48,109,.10);position:relative}}
.home .nm{{font-size:34px;font-weight:800;color:var(--navy);display:flex;align-items:baseline;gap:14px}} .home .nm .th{{font-size:22px}}
.home .key{{font-size:19px;line-height:1.5;margin-top:10px}} .home .chips{{margin-top:10px}}
.cols{{display:flex;gap:36px;margin-top:110px;align-items:flex-start}}
.col{{display:flex;flex-direction:column;gap:14px}}
.gh{{background:var(--ink);color:#fff;border-radius:18px;padding:14px 18px;}} .gh .th{{color:rgba(255,255,255,.85);font-size:17px}}
.gname{{font-size:24px;font-weight:800;display:flex;justify-content:space-between;align-items:center}} .gn{{background:rgba(255,255,255,.22);border-radius:999px;padding:1px 12px;font-size:18px}}
.card{{background:#fff;border:2px solid var(--gl);border-left:7px solid var(--ink);border-radius:16px;padding:13px 15px 14px;box-shadow:0 4px 14px rgba(4,48,109,.05)}}
.card.st-p2{{border-style:dashed;border-left-style:solid;background:#FBFCFE;border-left-color:#AEB9C8}}
.card.st-p2 .nm{{color:#3C4B63}}
.card .nm{{font-size:21px;font-weight:800;color:var(--ink);line-height:1.2}} .card .nm .th{{font-size:16px;margin-top:2px}}
.card .url{{font-size:15px;margin-top:5px;word-break:break-all}}
.card .chips{{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}} .card .chip{{font-size:13px;padding:2px 9px}}
.card .key{{font-size:15.5px;line-height:1.42;margin-top:8px;color:var(--text)}}
.today{{margin-top:7px;font-size:13.5px;font-weight:700;color:var(--muted);background:var(--bg2);border-radius:8px;padding:3px 9px;display:inline-block}}
.kid{{margin-left:34px;display:flex;flex-direction:column;gap:14px;position:relative}}
.kid:before{{content:"";position:absolute;left:-20px;top:-14px;bottom:30px;border-left:2.5px solid var(--gl)}}
.kid>.card{{position:relative}} .kid>.card:before{{content:"";position:absolute;left:-22px;top:30px;width:15px;border-top:2.5px solid var(--gl)}}
.arr{{text-align:center;color:var(--ink);font-size:26px;font-weight:800;line-height:.7;margin:-4px 0}}
.branch{{font-size:15px;font-weight:800;color:var(--red);background:var(--red50);border-radius:10px;padding:6px 12px;margin-top:6px}}
.split{{display:grid;grid-template-columns:1fr 1fr;gap:20px}} .split .kid{{margin-left:30px}}
.subh{{font-weight:800;color:var(--ink);font-size:18px;margin:2px 0 10px;padding-left:4px}}
.kid3{{margin-left:34px}}
.routes{{display:flex;flex-wrap:wrap;gap:8px;margin-top:-4px}} .routes span{{background:var(--tint);color:var(--ink);font-weight:800;font-size:15px;border-radius:10px;padding:5px 12px;border:1.5px solid var(--gl)}}
.pnote{{font-size:15px;color:#7B8798;line-height:1.5;background:#fff;border:1.5px dashed var(--line2);border-radius:14px;padding:10px 14px}} .pnote b{{color:var(--muted)}}
.lock{{font-size:15px;font-weight:800;color:var(--muted);background:#fff;border:1.5px solid var(--line2);border-radius:12px;padding:8px 12px}}
#wires{{position:absolute;left:0;top:0;pointer-events:none;overflow:visible}}
.bottom{{display:grid;grid-template-columns:1fr 760px;gap:36px;margin-top:64px}}
.jbox,.glance{{background:#fff;border:1.5px solid var(--line2);border-radius:24px;padding:24px 28px}}
.jbox h3,.glance h3{{font-size:28px;color:var(--navy);font-weight:800;margin-bottom:14px}} .jbox h3 .th,.glance h3 .th{{font-size:19px;margin-left:8px}}
.jrow{{display:grid;grid-template-columns:330px 1fr;gap:18px;padding:12px 0;border-top:1.5px solid var(--line)}}
.jn{{font-size:20px;font-weight:700}} .jn b{{background:var(--navy);color:#fff;border-radius:8px;padding:1px 9px;margin-right:6px}} .jn .th{{font-size:16px;margin-top:3px}}
.jsteps{{display:flex;flex-wrap:wrap;align-items:center;gap:8px}}
.js{{background:var(--tint);color:var(--ink);border:1.5px solid var(--gl);border-radius:12px;padding:7px 13px;font-weight:800;font-size:17px}}
.ja{{color:var(--blue);font-weight:800;font-size:22px}}
.jnote{{flex-basis:100%;font-size:15.5px;color:var(--muted);font-weight:600;margin-top:2px}}
.glance table{{width:100%;border-collapse:collapse;font-size:19px}} .glance th{{text-align:right;color:var(--muted);font-size:15px;padding:6px 8px;text-transform:uppercase;letter-spacing:.5px}}
.glance th:first-child,.glance td:first-child{{text-align:left}} .glance td{{text-align:right;padding:6px 8px;border-top:1.5px solid var(--line);font-weight:700}}
.glance .tot td{{font-weight:800;color:var(--navy);border-top:2.5px solid var(--navy)}}
.glance p{{font-size:15px;color:var(--muted);margin-top:12px}} .scope{{margin-top:12px;background:var(--bg2);border-radius:14px;padding:8px 16px;font-size:19px;font-weight:700;color:var(--navy)}} .scope b{{font-size:30px;margin-right:8px}} .scope .th{{display:block;font-size:15px}} .glance h4{{font-size:19px;color:var(--navy);margin:16px 0 6px}} .new{{padding-left:22px;font-size:16px;line-height:1.5}}
.foot{{margin-top:30px;display:flex;justify-content:space-between;font-size:16px;color:var(--muted);font-weight:600}}
</style></head><body>
<div class="top"><div class="brand"><img src="assets/logo-horizontal.png"><div><h1>Website Sitemap v2 <small>แผนผังเว็บไซต์ · for CEO review</small></h1>
<p>{E(FACTS)}</p></div></div>
<div class="legend">
 <div class="row"><span class="lbl">Groups</span>{legend}</div>
 <div class="row"><span class="lbl">Status</span>{chip_status("built")}<span class="th">มีใน build</span>{chip_status("launch")}<span class="th">ทำก่อนเปิดเว็บ</span>{chip_status("p2")}<span class="th">เฟส 2</span>
  <span class="chip t-draft">Draft</span><span class="chip t-noidx">noindex</span></div>
 <div class="row"><span class="lbl">Levels</span><span class="chip lv">L0</span> Home <span class="chip lv">L1</span> section <span class="chip lv">L2</span> sub-page <span class="chip lv">L3</span> template · <span class="today" style="margin:0">Today: …</span> = currently a section of the one-page build</div>
</div></div>
<div class="gbar"><span class="lbl">On every page · ทุกหน้า</span>{gl}</div>
<div class="homewrap"><div class="home" id="c-home"><div class="nm">{E(home["name"])} <span class="mono" style="font-size:20px">/</span><span class="th">{E(home["th"])}</span></div>
<div class="chips">{chips(home)} <span class="today">Today: index.html (one-page build)</span></div><div class="key">{E(home["key"])}</div></div></div>
<div class="cols" id="cols">{cols}</div>
<div class="bottom"><div class="jbox"><h3>Main user journeys <span class="th">เส้นทางผู้ใช้หลัก</span></h3>{"".join(jr)}</div>{glance}</div>
<div class="foot"><span>OKASTO · Sitemap v2 · prepared 26 Oct 2026 · proposal for CEO review — URLs and Phase 2 items to be confirmed</span><span>Partners shown as text only · no contact numbers or bank details in this document</span></div>
<svg id="wires"></svg>
<script>
function wires(){{
 const s=document.getElementById('wires');s.setAttribute('width',document.body.scrollWidth);s.setAttribute('height',document.body.scrollHeight);
 const h=document.getElementById('c-home').getBoundingClientRect();
 const heads=[...document.querySelectorAll('.col .gh')].map(e=>e.getBoundingClientRect());
 const busY=heads[0].top-55+scrollY, hx=h.left+h.width/2, hy=h.bottom+scrollY;
 let d=`M${{hx}} ${{hy}} V${{busY}} M${{heads[0].left+heads[0].width/2}} ${{busY}} H${{heads[heads.length-1].left+heads[heads.length-1].width/2}}`;
 heads.forEach(r=>{{d+=` M${{r.left+r.width/2}} ${{busY}} V${{r.top+scrollY}}`}});
 s.innerHTML=`<path d="${{d}}" fill="none" stroke="#7DBCF2" stroke-width="3.5" stroke-linecap="round"/>`+heads.map(r=>`<circle cx="${{r.left+r.width/2}}" cy="${{busY}}" r="7" fill="#1668B8"/>`).join('')+`<circle cx="${{hx}}" cy="${{hy}}" r="7" fill="#04306D"/>`;
}}
document.fonts.ready.then(wires);
</script></body></html>'''

# ---------------------------------------------------------------- document
def doc():
    cnt = collections.Counter(p["status"] for p in P)
    byg = collections.OrderedDict((g[0], collections.Counter()) for g in GROUPS)
    for p in P: byg[p["group"]][p["status"]] += 1
    lv = collections.Counter(p["level"] for p in P)
    def pg(inner, cls=""): return f'<section class="pg {cls}">{inner}</section>'
    def h(title, th, kicker=""): return f'<div class="ph"><div><div class="kick">{E(kicker)}</div><h2>{E(title)} <span class="th">{E(th)}</span></h2></div><img src="assets/logo-horizontal.png"></div>'
    out = []
    # cover
    out.append(pg(f'''<div class="cover"><img class="clogo" src="assets/logo-horizontal.png">
<div class="ck">Website information architecture · proposal for CEO review</div>
<h1>Website Sitemap v2</h1><div class="cth th">แผนผังเว็บไซต์ฉบับที่ 2 — โครงสร้างหน้า เส้นทางผู้ใช้ และแผนการเปิดตัว</div>
<div class="tiles">
<div class="tile"><b>19 Jan 2024</b><span>Founded</span></div>
<div class="tile"><b>200+</b><span>Vehicles</span></div>
<div class="tile"><b>3 areas</b><span>Bangkok · Pattaya · Phuket</span></div>
<div class="tile"><b>{len(P)}</b><span>Pages in this sitemap</span></div>
<div class="tile"><b>{cnt["built"]} · {cnt["launch"]} · {cnt["p2"]}</b><span>Built · Launch · Phase 2</span></div></div>
<div class="contents"><b>Contents</b><ol><li>Sitemap overview + zoomed views</li><li>Structure summary (groups, levels, global elements, URLs)</li><li>Page-by-page content spec</li><li>User journeys</li><li>Benchmark: what we borrowed from which site</li><li>Roadmap by phase · assumptions</li></ol></div>
<div class="cfoot">Prepared 26 Oct 2026 · Partners: {E(PARTNERS)} (text only) · Payment online via Beam only, no cash · LINE / WhatsApp for questions only</div></div>''', "cv"))
    # overview
    out.append(pg(h("Sitemap overview","ภาพรวมทั้งหมด","1 · Overview") + '<div class="full"><img src="crops/full.png"></div>'))
    for i,(f,t,th) in enumerate([("crop-a.png","Zoom: Core & booking funnel","ขยาย: หน้าหลักและขั้นตอนจอง"),("crop-b.png","Zoom: SEO landing & support","ขยาย: หน้า SEO และหน้าช่วยเหลือ"),("crop-c.png","Zoom: Trust, partners & back office","ขยาย: ความน่าเชื่อถือ พาร์ทเนอร์ หลังบ้าน")]):
        out.append(pg(h(t,th,"1 · Overview") + f'<div class="full"><img src="crops/{f}"></div>'))
    # summary
    rows = "".join(f'<tr><td><i class="sw" style="background:{G[g][3]}"></i><b>{E(G[g][1])}</b> <span class="th">{E(G[g][2])}</span></td><td>{c["built"]}</td><td>{c["launch"]}</td><td>{c["p2"]}</td><td><b>{sum(c.values())}</b></td></tr>' for g,c in byg.items())
    out.append(pg(h("Structure summary","สรุปโครงสร้าง","2 · Structure") + f'''<div class="g2">
<div><h3>Pages by group and status</h3><table class="t"><tr><th>Group</th><th>Built</th><th>Launch</th><th>Phase 2</th><th>Total</th></tr>{rows}
<tr class="tot"><td>All pages</td><td>{cnt["built"]}</td><td>{cnt["launch"]}</td><td>{cnt["p2"]}</td><td>{len(P)}</td></tr></table>
<p class="note">Levels: L0 {lv[0]} · L1 {lv[1]} · L2 {lv[2]} · L3 {lv[3]} (route template, 6 routes at launch). “Built” = exists in the current build, many as sections of the one-page Home; the plan gives them their own URLs.</p>
<h3>Status meaning</h3><ul><li>{chip_status("built")} exists in the current build (some need their own URL)</li><li>{chip_status("launch")} must be ready before go-live</li><li>{chip_status("p2")} after launch, when data / partners / backend are ready</li></ul></div>
<div><h3>On every page</h3><ul><li>Header: Routes & Prices · Fleet · Charter · Service info · Help · <b>Book & Pay</b> button</li><li>Footer: About · Contact · Booking policy · Terms · Privacy · Partners · “Also available on” partner names (grey text)</li><li>Language switch TH / EN / 中文</li><li>Floating LINE / WhatsApp for questions only — never for booking or payment</li><li>Mobile: sticky “Book & Pay” bar</li></ul>
<h3>URL and SEO rules</h3><ul><li>One URL per language: <span class="mono">/en/…</span> · <span class="mono">/th/…</span> · <span class="mono">/zh/…</span> with hreflang + x-default</li><li>Short English slugs, e.g. <span class="mono">/en/transfer/bkk-to-pattaya</span></li><li>Booking, manage, draft legal and admin pages: <b>noindex</b></li><li>Partner booking links (<span class="mono">/p/&lt;partnerId&gt;</span>, booking-sent, monthly statement) are private: <b>noindex</b>, and must not be listed per partner in sitemap.xml</li><li>Schema: Organization, FAQPage on FAQ/landing pages; XML sitemap + robots.txt</li><li>Every landing page has its own prefilled booking widget</li></ul>
<h3>Payment</h3><ul><li>Online only via Beam (card · PromptPay · mobile banking · e-wallet as enabled). No cash, no manual transfer.</li></ul></div></div>'''))
    # spec
    for gid, gname, gth, ink, tint, gl in GROUPS:
        rows = []
        seen = {}
        for p in [x for x in P if x["group"]==gid]:
            key = tuple(p["content"])
            if key in seen: li = f'<li><i>Same template as {E(seen[key])} (own copy, prices, FAQ)</i></li>'
            else:
                seen[key] = p["name"]; li = "".join(f"<li>{E(c)}</li>" for c in p["content"])
            today = f'<span class="tdy">Today: {E(p["today"])}</span>' if p["today"] else ""
            rows.append(f'''<tr class="r-{p["status"]}"><td><b>{E(p["name"])}</b> <span class="th">· {E(p["th"])}</span><div class="mono">{E(p["url"])}</div><div class="cc">{chips(p)}{today}</div></td>
<td><div class="pur">{E(p["purpose"])}</div><ul>{li}</ul></td><td>{E(p["cta"])}</td><td>{E(p["index"])}</td></tr>''')
        out.append(f'''<section class="pg flow">{h(gname, gth, "3 · Page-by-page spec")}<table class="t spec" style="--ink:{ink};--tint:{tint}"><thead><tr><th style="width:29%">Page</th><th>Purpose · key content</th><th style="width:12%">Main CTA</th><th style="width:10%">Index</th></tr></thead><tbody>{"".join(rows)}</tbody></table></section>''')
    # journeys
    jr = []
    for code, name, th, steps, note in JOURNEYS:
        st = '<span class="ja">→</span>'.join(f'<span class="js" style="--ink:{G[BYID[pid]["group"]][3]};--tint:{G[BYID[pid]["group"]][4]};--gl:{G[BYID[pid]["group"]][5]}">{E(l)}</span>' for pid,l in steps)
        jr.append(f'<div class="jr"><div class="jn"><b>{code}</b> {E(name)}<div class="th">{E(th)}</div></div><div><div class="jst">{st}</div><div class="jnote">{E(note)}</div></div></div>')
    out.append(pg(h("User journeys","เส้นทางผู้ใช้หลัก","4 · Journeys") + "".join(jr) +
      '<p class="note">Funnel target: price on the first screen, payment in 4 steps (search → vehicle → details → pay). Free cancellation ≥24 h shown at vehicle choice and review.</p>'))
    # benchmark
    br = "".join(f'<tr><td><b>{E(n)}</b><div class="mono">{E(u)}</div></td><td>{E(s)}</td><td>{E(b)}</td><td>{E(w)}</td></tr>' for n,u,s,b,w in BENCH)
    out.append(f'''<section class="pg flow">{h("Benchmark: what we borrowed","เรียนรู้จากเว็บชั้นนำ","5 · Benchmark")}
<table class="t bench"><thead><tr><th style="width:13%">Site</th><th>What they do well</th><th>What OKASTO takes</th><th style="width:16%">Where in our sitemap</th></tr></thead><tbody>{br}</tbody></table>
<div class="g2 nc"><div><h3>Deliberately not copied <span class="th">สิ่งที่ไม่นำมาใช้</span></h3><ul>
<li>Driver bidding / marketplace pricing (GetTransfer) — OKASTO keeps instant fixed prices</li><li>Pay the driver in cash (some Kiwitaxi regions) — OKASTO is online via Beam only</li><li>Award badges, ratings and big numbers we cannot prove — only confirmed facts</li><li>Mobile app, push notifications, loyalty points — not needed at this size</li><li>Partner logos — names as grey text only until logo permission is given</li></ul></div>
<div><h3>Common patterns we follow <span class="th">รูปแบบที่ทุกเว็บมี</span></h3><ul><li>Price before details; booking finished in a few steps</li><li>One landing page per airport, city and popular route</li><li>Manage booking without calling support</li><li>Clear meeting point and waiting-time information</li><li>Separate doors for business customers and for drivers / fleet partners</li></ul></div></div>
<p class="note">Sources reviewed Oct 2026: public pages of klook.com, welcomepickups.com, blacklane.com, gettransfer.com, kiwitaxi.com, mozio.com.</p></section>''')
    # roadmap
    def plist(s): return "".join(f'<li><i class="sw" style="background:{G[p["group"]][3]}"></i>{E(p["name"])}</li>' for p in P if p["status"]==s)
    out.append(pg(h("Roadmap by phase","แผนงานตามเฟส","6 · Roadmap") + f'''<div class="g3">
<div class="ph0"><h3>Phase 0 · Built <span class="th">มีแล้ว</span> <span class="n">{cnt["built"]}</span></h3><p>In the current build. Split Home sections into their own URLs; legal pages wait for lawyer review.</p><ul class="pl">{plist("built")}</ul></div>
<div class="ph1"><h3>Phase 1 · Launch <span class="th">ก่อนเปิดเว็บ</span> <span class="n">{cnt["launch"]}</span></h3><p>Needed to go live and rank: SEO landing pages, manage-booking lite, meeting points, failed-payment and 404.</p><ul class="pl">{plist("launch")}</ul></div>
<div class="ph2"><h3>Phase 2 · Growth <span class="th">เฟส 2</span> <span class="n">{cnt["p2"]}</span></h3><p>After launch, when reviews, partner terms, a booking backend and more route data exist.</p><ul class="pl">{plist("p2")}</ul></div></div>'''))
    out.append(pg(h("Assumptions and open questions","สมมติฐานและเรื่องที่ต้องยืนยัน","6 · Roadmap") + '''<div class="g2"><div><h3>Assumptions</h3><ol class="as">
<li>Home sections (Routes & Prices, Fleet, Luggage, Charter, Service info, FAQ) are proposed as their own URLs for SEO; the one-page Home keeps short teasers.</li>
<li>U-Tapao (UTP) and Hua Hin landing pages are Phase 2; prices already exist for UTP.</li>
<li>Manage booking is “lite” at launch (lookup + change/cancel request by email) because there is no booking backend yet.</li>
<li>Route pages are generated from prices.json; travel times and distances are TBC and must not be guessed.</li>
<li>Partner / B2B and driver-recruitment pages are proposals; commission, net rates and API need CEO decision. A demo private booking link (/p/&lt;partnerId&gt;) is in the build for Agency and Hotel (example data, noindex, not listed per partner in sitemap.xml). Backend, email sending and Beam are still TODO.</li>
<li>Corporate customers also pay online via Beam; tax-invoice process TBC.</li>
<li>Reviews and safety pages appear only with real, verifiable content.</li>
<li>Domain and final URL language prefix are TBC.</li></ol></div>
<div><h3>Decisions needed from the CEO</h3><ol class="as"><li>Approve launch scope (Phase 0 + Phase 1).</li><li>Confirm the top 6 launch routes.</li><li>Go / no-go for Partners, Corporate, Hotels and Drive-with-us pages.</li><li>Permission to show partner logos (until then: grey text).</li><li>Refund timing via Beam to state on the policy page.</li><li>Lawyer review date for Terms & Privacy.</li></ol>
<h3>Always true on the site</h3><ul><li>Payment online via Beam only — no cash, no bank-transfer details.</li><li>LINE / WhatsApp for questions only; booking through Book & Pay.</li><li>Only confirmed facts: founded 19 Jan 2024 · 200+ vehicles · partner list.</li><li>No secret keys in front-end code.</li></ul></div></div>'''))

    return f'''<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="fonts.css"><style>{CSS}
@page{{size:A4 landscape;margin:10mm 13mm 13mm}}
body{{font-size:10.5pt;background:#fff}}
.pg{{page-break-after:always;break-after:page;position:relative}} .pg:last-child{{page-break-after:auto}}
.pg:not(.flow){{height:185mm;overflow:hidden}}
.ph{{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1.5px solid var(--line2);padding-bottom:2mm;margin-bottom:3mm}} .ph img{{height:9mm}}
.kick{{font-size:8.5pt;font-weight:800;color:var(--blue);letter-spacing:.8px;text-transform:uppercase}}
h2{{font-size:20pt;font-weight:800;color:var(--navy)}} h2 .th{{font-size:12pt;margin-left:2mm}}
h3{{font-size:12pt;color:var(--navy);font-weight:800;margin:3mm 0 2mm}} h3 .th{{font-size:9.5pt}}
ul,ol{{padding-left:5mm}} li{{margin:1mm 0;line-height:1.4}}
.chip{{font-size:7.5pt;padding:.4mm 2mm;gap:3px}} .dot{{width:5px;height:5px}}
.sw{{width:9px;height:9px;border-radius:3px;display:inline-block;margin-right:5px;vertical-align:-1px}}
.cv{{background:linear-gradient(160deg,#F5FAFF,#E0F0FF)}}
.cover{{height:100%;padding:12mm 16mm;display:flex;flex-direction:column}}
.clogo{{height:16mm;align-self:flex-start}} .ck{{margin-top:10mm;font-weight:800;color:var(--blue);letter-spacing:1px;text-transform:uppercase;font-size:10pt}}
.cover h1{{font-size:44pt;color:var(--navy);font-weight:800;letter-spacing:-1px;margin-top:2mm}} .cth{{font-size:14pt;margin-top:1mm}}
.tiles{{display:flex;gap:4mm;margin-top:8mm}} .tile{{flex:1;background:#fff;border:1.5px solid var(--line2);border-radius:5mm;padding:4mm 5mm}}
.tile b{{display:block;font-size:16pt;white-space:nowrap;color:var(--navy);font-weight:800}} .tile span{{color:var(--muted);font-weight:700;font-size:9.5pt}}
.contents{{margin-top:8mm;background:#fff;border-radius:5mm;border:1.5px solid var(--line2);padding:4mm 6mm;width:85%}} .contents ol{{columns:2;column-gap:10mm;margin-top:1mm}}
.cfoot{{margin-top:auto;font-size:8.5pt;color:var(--muted)}}
.full{{height:160mm;display:flex;align-items:center;justify-content:center}} .full img{{max-width:100%;max-height:160mm;border:1px solid var(--line2);border-radius:3mm}}
.g2{{display:grid;grid-template-columns:1fr 1fr;gap:9mm}} .g3{{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5mm}}
table.t{{width:100%;border-collapse:collapse}} .t th{{background:var(--bg2);color:var(--navy);text-align:left;font-size:8.5pt;padding:2mm;text-transform:uppercase;letter-spacing:.4px}}
.t td{{padding:2mm;border-bottom:1px solid var(--line);vertical-align:top}}
.t tr.tot td{{font-weight:800;color:var(--navy);border-top:2px solid var(--navy)}}
.g2 .t td:not(:first-child),.g2 .t th:not(:first-child){{text-align:right}}
.note{{font-size:8.5pt;color:var(--muted);margin-top:3mm;line-height:1.45}}
.spec thead th{{background:var(--ink);color:#fff}} .spec td{{font-size:8.4pt;padding:1.2mm 2mm;line-height:1.26}} .spec .th{{font-size:8.5pt}} .spec .mono{{font-size:8pt;margin-top:.6mm}}
.spec .cc{{display:flex;flex-wrap:wrap;gap:1mm;margin-top:1mm}} .tdy{{font-size:7.5pt;color:var(--muted);font-weight:700;align-self:center}}
.spec ul{{margin-top:1mm}} .spec li{{margin:0}} .spec ul{{padding-left:4mm}} .pur{{font-weight:700;color:var(--ink)}}
.spec tr{{break-inside:avoid}} .spec tr.r-p2 td{{background:#FBFCFE}}
.jr{{display:grid;grid-template-columns:62mm 1fr;gap:4mm;padding:3mm 0;border-top:1px solid var(--line)}}
.jn{{font-weight:700;font-size:11pt}} .jn b{{background:var(--navy);color:#fff;border-radius:2mm;padding:0 2mm;margin-right:1mm}}
.jst{{display:flex;flex-wrap:wrap;gap:2mm;align-items:center}} .js{{background:var(--tint);color:var(--ink);border:1.2px solid var(--gl);border-radius:2.5mm;padding:1.2mm 2.6mm;font-weight:800;font-size:9.5pt}}
.ja{{color:var(--blue);font-weight:800}} .jnote{{font-size:8.5pt;color:var(--muted);margin-top:1.2mm}}
.bench td{{font-size:8.5pt;line-height:1.32;padding:1.5mm 2mm}} .bench tr{{break-inside:avoid}} .nc{{margin-top:2mm}} .nc li{{font-size:9pt;margin:.5mm 0}} .nc h3{{margin-top:2mm}}
.g3>div{{border-radius:4mm;padding:3mm 4mm;border:1.5px solid var(--line2)}} .g3 p{{font-size:8.5pt;color:var(--muted);margin-bottom:2mm}}
.ph0{{background:var(--green50)}} .ph1{{background:#E0F0FF}} .ph2{{background:#F1F3F6;border-style:dashed!important}}
.g3 h3{{margin-top:0;display:flex;align-items:center;gap:2mm}} .g3 .n{{margin-left:auto;background:#fff;border-radius:99px;padding:0 3mm}}
.pl{{list-style:none;padding:0;columns:1}} .pl li{{font-size:8.6pt;margin:.5mm 0}}
.as li{{font-size:9.5pt;margin:1.5mm 0}}
</style></head><body>{"".join(out)}</body></html>'''

if __name__ == "__main__":
    open(os.path.join(HERE, "diagram.html"), "w").write(diagram())
    open(os.path.join(HERE, "doc.html"), "w").write(doc())
    print("ok", len(P), collections.Counter(p["status"] for p in P))
