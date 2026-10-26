// IndexNow 验证文件：https://你的域名/<密钥>.txt
import type { APIRoute } from 'astro';
import { SITE } from '../site.config';

export function getStaticPaths() {
  return [{ params: { key: SITE.indexNowKey } }];
}

export const GET: APIRoute = () =>
  new Response(SITE.indexNowKey, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
