import type { APIRoute } from 'astro';
import { SITE } from '../site.config';
import { absoluteUrl, getAllPosts, getPostAirports, hasSample, lastModified, postPath } from '../lib/content';
import { escapeXml } from '../lib/format';

export const GET: APIRoute = async () => {
  const all = await getAllPosts();
  const posts = [];
  for (const p of all) {
    if (!hasSample(await getPostAirports(p))) posts.push(p);
  }

  const items = posts
    .slice(0, 30)
    .map((p) => {
      const url = absoluteUrl(postPath(p));
      return `    <item>
      <title>${escapeXml(p.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(p.data.description)}</description>
      <pubDate>${lastModified(p).toUTCString()}</pubDate>
    </item>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${absoluteUrl('/')}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>zh-cn</language>
${items}
  </channel>
</rss>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
