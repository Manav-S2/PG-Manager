const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));
    
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle0', timeout: 15000 });
    await browser.close();
  } catch(e) {
    console.error("Puppeteer Script Error:", e.message);
  }
})();
