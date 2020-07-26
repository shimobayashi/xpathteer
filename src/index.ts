import * as puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 0,
  });
  const page = await browser.newPage();

  await page.goto('https://anglers.jp/prefectures/28/catches');
  await page.waitForSelector('div.col-6');
  const elements = await page.$$('div.col-6');
  for (const element of elements) {
    const anchor = await element.$('a');
    if (!anchor) continue;

    const url = (await (await anchor.getProperty('href')).jsonValue()) + '';
    console.log(url);
  }

  await browser.close();
})().catch(error => {
  console.error(error);
  throw error;
});
