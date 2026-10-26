import type { APIRoute } from 'astro';
import { IS_PLACEHOLDER_DOMAIN } from '../site.config';
import { absoluteUrl } from '../lib/content';

export const GET: APIRoute = () => {
  // 还没换正式域名时整站禁止抓取；改好 src/site.config.ts 的 url 后自动放开
  const body = IS_PLACEHOLDER_DOMAIN
    ? `User-agent: *
Disallow: /
`
    : `User-agent: *
Allow: /

Sitemap: ${absoluteUrl('/sitemap.xml')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
