import * as puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 0,
  });
  const page = await browser.newPage();
  await page.goto('https://anglers.jp/');
})().catch(error => {
  console.error(error);
  throw error;
});
