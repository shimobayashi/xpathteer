import * as puppeteer from 'puppeteer-core';
import axios from 'axios';
import {scrollPageToBottom} from 'puppeteer-autoscroll-down';
import {executablePath} from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    slowMo: 0,
    executablePath: process.env['PUPPETEER_EXECUTABLE_PATH'] || executablePath(),
  });
  const page = await browser.newPage();
  page.on('response', response => {
    console.debug(response.status(), response.url());
  });
  await page.setDefaultNavigationTimeout(60000);

  const targets = [
    {
      prefecture: '神奈川県',
      url: 'https://anglers.jp/prefectures/14/catches',
    },
  ];
  for (const target of targets) {
    console.debug(target.url);

    await page.goto(target.url);

    console.debug(await page.content());

    await page.waitForSelector('div.col-6');
    await scrollPageToBottom(page, {
      size: 600,
      delay: 1000,
      stepsLimit: 5,
    });
    const elements = await page.$$('div.col-6');
    for (const element of elements) {
      // リンク
      const anchor = await element.$('a');
      const link = (await (await anchor!.getProperty('href')).jsonValue()) + '';

      // タイトルとタグ
      const detail1 = await element.$(
        '.card-body > div:nth-child(1) > div:nth-child(1)'
      );
      let fish =
        (await (await detail1!.getProperty('innerText')).jsonValue()) + '';
      fish = fish.trim();

      const detail2 = await element.$('.card-body > div:nth-child(2)');
      let area =
        (await (await detail2!.getProperty('innerText')).jsonValue()) + '';
      area = area.trim();

      const title = area + ' - ' + fish;
      const tags = ['釣果情報', target.prefecture, area, fish];

      // 画像blob
      const imageBuffer = await element.screenshot({
        encoding: 'base64',
        type: 'jpeg',
        quality: 60,
      });
      let image:string;
      if (imageBuffer instanceof Buffer) {
        image = imageBuffer.toString();
      } else {
        image = imageBuffer;
      }

      await postToVimagemore({
        id: link,
        title: title,
        tags: tags,
        link: link,
        image: image,
      });
    }
  }

  await browser.close();
})().catch(error => {
  console.error(error.message);
  // --unhandled-rejections=strict ってやつを使えば throw error; でもうまくいきそうだけど、面倒なので雑にprocess.exit(1); する
  // eslint-disable-next-line no-process-exit
  process.exit(1);
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
