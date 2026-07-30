const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    await page.goto('http://localhost:8082', { waitUntil: 'networkidle0', timeout: 15000 });
    
    const layout = await page.evaluate(() => {
      return {
        bodyHeight: document.body.clientHeight,
        rootHeight: document.getElementById('root') ? document.getElementById('root').clientHeight : -1,
        rootChildren: document.getElementById('root') ? document.getElementById('root').children.length : -1,
        bodyHtml: document.body.innerHTML.substring(0, 500)
      };
    });
    console.log("LAYOUT DUMP:", layout);
    
    await browser.close();
  } catch(e) {
    console.error("Puppeteer Script Error:", e.message);
  }
})();
