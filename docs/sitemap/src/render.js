// Usage: node render.js diagram <out.png> | node render.js pdf <out.pdf>
const path = require('path');
const { chromium } = require('/workspace/pwtool/node_modules/playwright-core');
(async () => {
  const [mode, out] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  if (mode === 'diagram') {
    const p = await b.newPage({ viewport: { width: 3840, height: 1200 }, deviceScaleFactor: 2 });
    await p.goto('file://' + path.join(__dirname, 'diagram.html'));
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
    await p.evaluate(() => wires());
    const ov = await p.evaluate(() => [...document.querySelectorAll('.card,.gh,.js')].filter(e => e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1).map(e => e.id || e.textContent.slice(0, 30)));
    console.log('overflow:', JSON.stringify(ov), 'size', await p.evaluate(() => [document.body.scrollWidth, document.body.scrollHeight]));
    const boxes = await p.evaluate(() => Object.fromEntries(['core','book','seo','sup','trust','b2b','back'].map(g => { const r = document.getElementById('col-' + g).getBoundingClientRect(); return [g, [r.left, r.top + scrollY, r.right, r.bottom + scrollY]]; })));
    require('fs').writeFileSync(path.join(__dirname, 'boxes.json'), JSON.stringify(boxes));
    await p.screenshot({ path: out, fullPage: true });
  } else {
    const p = await b.newPage();
    await p.goto('file://' + path.join(__dirname, 'doc.html'));
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
    await p.pdf({ path: out, preferCSSPageSize: true, printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>',
      footerTemplate: '<div style="width:100%;font-size:7px;color:#4F6280;padding:0 13mm;display:flex;justify-content:space-between;font-family:sans-serif"><span>OKASTO · Website Sitemap v2 · proposal for CEO review</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>' });
  }
  await b.close();
})();
