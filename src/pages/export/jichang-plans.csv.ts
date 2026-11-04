// 一套餐一行：方便在 Excel 里排序、比价
import type { APIRoute } from 'astro';
import { buildExport, toCsv } from '../../lib/export';

export const GET: APIRoute = () => {
  const rows = buildExport().flatMap((a) => a.套餐.map((p) => ({ 机场: a.机场, 代号: a.代号, ...p, 推广链接: a.推广链接 })));
  return new Response(toCsv(rows), { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
};
