import * as puppeteer from 'puppeteer';
import axios from 'axios';

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

    // タイトルとタグ
    const detail1 = await element.$(
      '.card-body > div:nth-child(3) > div:nth-child(1)'
    );
    let fish =
      (await (await detail1!.getProperty('innerText')).jsonValue()) + '';
    fish = fish.trim();

    const detail2 = await element.$('.card-body > div:nth-child(4)');
    let area =
      (await (await detail2!.getProperty('innerText')).jsonValue()) + '';
    area = area.trim();

    const title = area + ' - ' + fish;
    const tags = ['釣果情報', '兵庫県', area, fish];

    // 画像blob
    const image = await element.screenshot({
      encoding: 'base64',
      type: 'jpeg',
      quality: 60,
    });

    await postToVimagemore({
      id: link,
      title: title,
      tags: tags,
      link: link,
      image: image,
    });
  }

  await browser.close();
})().catch(error => {
  console.error(error);
  throw error;
});

interface Params {
  id: string;
  title: string;
  tags: string[];
  link: string;
  image: string;
}
async function postToVimagemore(params: Params) {
  console.dir({
    id: params.id,
    title: params.title,
    tags: params.tags,
    link: params.link,
  });

  // 情報をまとめてアップロードする
  return axios
    .post(process.env.VIMAGEMORE_UPLOADER_URL ?? '', params)
    .then(ret => {
      console.log(ret.status);
    })
    .catch(error => {
      // 重複したidを指定しているとエラーが返ってくるのでガンガンエラーが流れてくるはず
      console.error(error.message);
    });
}
