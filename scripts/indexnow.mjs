// 把站点地图里的所有网址提交给 IndexNow（Bing、Yandex 等会即时收到）
// 用法：部署完成后运行  npm run indexnow
//       只提交部分网址：npm run indexnow -- https://xxx.com/pingce/abc/ https://xxx.com/jichang-tuijian/
import { readFile } from 'node:fs/promises';

const config = await readFile(new URL('../src/site.config.ts', import.meta.url), 'utf8');
const site = config.match(/url:\s*'([^']+)'/)?.[1];
const key = config.match(/indexNowKey:\s*'([^']+)'/)?.[1];

if (!site || !key) {
  console.error('没在 src/site.config.ts 里找到 url 或 indexNowKey');
  process.exit(1);
}
if (site.includes('xxx.com')) {
  console.error('站点域名还是占位的 xxx.com，先在 src/site.config.ts 里改成正式域名并部署。');
  process.exit(1);
}

let urls = process.argv.slice(2);
if (urls.length === 0) {
  const res = await fetch(`${site}/sitemap.xml`);
  if (!res.ok) {
    console.error(`读取 ${site}/sitemap.xml 失败：HTTP ${res.status}`);
    process.exit(1);
  }
  const xml = await res.text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const host = new URL(site).host;
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `${site}/${key}.txt`, urlList: urls }),
});

console.log(`提交 ${urls.length} 个网址，IndexNow 返回 HTTP ${res.status}`);
if (res.status >= 300) {
  console.log(await res.text());
  process.exit(1);
}
