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
    // リンク
    const anchor = await element.$('a');
    const link = (await (await anchor!.getProperty('href')).jsonValue()) + '';
    console.log(link);

    // タイトル
    const detail1 = await element.$(
      '.card-body > div:nth-child(3) > div:nth-child(1)'
    );
    const fish =
      (await (await detail1!.getProperty('innerText')).jsonValue()) + '';
    console.dir(fish.trim());

    const detail2 = await element.$('.card-body > div:nth-child(4)');
    const area =
      (await (await detail2!.getProperty('innerText')).jsonValue()) + '';
    console.dir(area.trim());
  }

  await browser.close();
})().catch(error => {
  console.error(error);
  throw error;
});
