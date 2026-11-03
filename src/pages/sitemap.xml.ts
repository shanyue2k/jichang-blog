// 自己生成 sitemap，带准确的 lastmod；示例数据页面和草稿不会出现
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { PILLAR, SECTION_KEYS } from '../site.config';
import {
  absoluteUrl,
  getAllPosts,
  getPostAirports,
  getPosts,
  getRankedAirports,
  hasSample,
  lastModified,
  postPath,
} from '../lib/content';
import { escapeXml } from '../lib/format';
import affiliate from '../data/affiliate-links.json';
import { profilePath, profiles } from '../lib/profiles';

export const GET: APIRoute = async () => {
  const urls: { loc: string; lastmod?: Date }[] = [];
  const posts = await getAllPosts();
  const newest = posts[0] ? lastModified(posts[0]) : undefined;

  urls.push({ loc: '/', lastmod: newest });

  const ranked = await getRankedAirports();
  if (ranked.length && !hasSample(ranked)) {
    const tested = new Date(Math.max(...ranked.map((a) => a.data.testedAt.getTime())));
    urls.push({ loc: PILLAR.path, lastmod: tested });
  }

  for (const section of SECTION_KEYS) {
    const list = [];
    for (const p of await getPosts(section)) if (!hasSample(await getPostAirports(p))) list.push(p);
    if (list.length) urls.push({ loc: `/${section}/`, lastmod: lastModified(list[0]) });
  }

  for (const post of posts) {
    if (hasSample(await getPostAirports(post))) continue;
    urls.push({ loc: postPath(post), lastmod: lastModified(post) });
  }

  // 导航页至少有一家实测过才进站点地图
  if (affiliate.airports.some((a) => a.tested) || profiles.length >= 5) urls.push({ loc: '/jichang-daohang/' });
  for (const pr of profiles) urls.push({ loc: profilePath(pr.id), lastmod: new Date(pr.collectedAt) });

  urls.push({ loc: '/ceping-fangfa/' }, { loc: '/about/' });

  // 保证 airports 集合被读取，数据变化时重新生成
  await getCollection('airports');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${escapeXml(absoluteUrl(u.loc))}</loc>${u.lastmod ? `<lastmod>${u.lastmod.toISOString()}</lastmod>` : ''}</url>`,
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
