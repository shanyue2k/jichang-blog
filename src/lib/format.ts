/** 2026-10-26 这种格式，固定按北京时间显示，避免构建机时区导致差一天 */
export function formatDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function isoDate(date: Date): string {
  return date.toISOString();
}

export function formatPrice(n: number): string {
  return Number.isInteger(n) ? `¥${n}` : `¥${n.toFixed(1)}`;
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
