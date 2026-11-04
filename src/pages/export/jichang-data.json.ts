// 完整资料（JSON），以后写文章、做表格都可以从这里取
import type { APIRoute } from 'astro';
import { buildExport } from '../../lib/export';

export const GET: APIRoute = () =>
  new Response(JSON.stringify({ exportedAt: new Date().toISOString(), airports: buildExport() }, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
