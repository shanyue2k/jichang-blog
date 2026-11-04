// 一机场一行：推广链接 + 资料汇总
import type { APIRoute } from 'astro';
import { buildExport, toCsv } from '../../lib/export';

export const GET: APIRoute = () => {
  const rows = buildExport().map(({ 套餐, ...rest }) => ({ ...rest, 套餐数量: 套餐.length }));
  return new Response(toCsv(rows), { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
};
