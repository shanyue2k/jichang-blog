// 机场资料页（官网资料整理，非实测）
import affiliate from '../data/affiliate-links.json';

export type Plan = {
  name: string;
  type: 'monthly' | 'quarterly' | 'semiannual' | 'yearly' | 'onetime';
  price: number;
  trafficGB: number;
  /** month = 每月重置的流量；total = 一次性总流量 */
  trafficPer: 'month' | 'total';
  note?: string;
  /** 定制 / 企业套餐：单独展示，不参与最低价和单价对比 */
  custom?: boolean;
};

export type Profile = {
  id: string;
  collectedAt: string;
  source: string;
  lineType?: string;
  /** 节点列表里看到的实际线路情况，和官网说法不一致时写在这里 */
  lineNote?: string;
  devices?: string;
  rate?: string;
  claims: string[];
  unlock?: string[];
  plans: Plan[];
  discounts?: string;
  trial?: string;
  refund?: string;
  regions?: string[];
  nodeCount?: string;
  nodeNote?: string;
  groups?: string[];
  protocols?: string[];
  pending?: string[];
  /** 专线范围：all=全部套餐标注 IPLC/IEPL；partial=只有部分套餐；exit=BGP 调度 + 专线出口 */
  lineScope?: 'all' | 'partial' | 'exit';
  /** 标注的专线类型 */
  lineKind?: 'IPLC' | 'IEPL' | 'both' | 'unknown';
  /** lineScope=partial 时，标注专线的套餐名称关键词 */
  dedicatedPlans?: string[];
  /** 站长实测记录（最新的放第一个） */
  tests?: TestRun[];
};

export type TestRun = {
  date: string;
  time?: string;
  tester: string;
  tool: string;
  env: string;
  regions: { name: string; nodes: number; avgMBps: number; minMBps: number; maxMBps: number; medianRttMs: number; failed: number }[];
  unlock?: Record<string, string>;
  unlockNote?: string;
  images?: { src: string; alt: string; caption?: string }[];
  notes?: string[];
};

export type AffItem = {
  id: string;
  order: number;
  name: string;
  url: string;
  tested: boolean;
  coupon?: string;
  /** 优惠码立减百分比，例如 20 表示立减 20%（8 折） */
  couponOff?: number;
  couponStatus?: 'valid' | 'renewal' | 'expired' | 'invalid';
  couponNote?: string;
  renewalCoupon?: string;
};

/** 立减 20% → 「8 折」；立减 15% → 「85 折」 */
export function zhe(off: number): string {
  const v = 100 - off;
  return (v % 10 === 0 ? String(v / 10) : String(v)) + ' 折';
}

/** 站长确认：29 家机场都没有免费试用，退款都需要提交工单（2026-11-04）。某家不同时，在它的资料文件里单独写即可覆盖 */
const DEFAULTS: Partial<Profile> = {
  trial: '没有免费试用',
  refund: '需要提交工单联系客服申请，能否退款以客服答复为准',
};

const files = import.meta.glob<{ default: Profile }>('../data/profiles/*.json', { eager: true });
export const profiles: Profile[] = Object.values(files)
  .filter((m) => !(m.default as Profile & { draft?: boolean }).draft)
  .map((m) => {
  const p = { ...DEFAULTS, ...m.default } as Profile;
  p.pending = (p.pending ?? []).filter((x) => x !== '免费试用' && x !== '退款政策');
  return p;
});

export function getProfile(id: string): Profile | undefined {
  return profiles.find((p) => p.id === id);
}

export function getAff(id: string): AffItem | undefined {
  return (affiliate.airports as AffItem[]).find((a) => a.id === id);
}

export function profilePath(id: string): string {
  return `/jichang/${id}/`;
}

const MONTHS: Record<Plan['type'], number> = { monthly: 1, quarterly: 3, semiannual: 6, yearly: 12, onetime: 0 };

export const PLAN_TYPE_LABEL: Record<Plan['type'], string> = {
  monthly: '月付',
  quarterly: '季付',
  semiannual: '半年付',
  yearly: '年付',
  onetime: '不限时',
};

/** 折合每月价格；不限时套餐返回 null */
export function perMonth(p: Plan): number | null {
  const m = MONTHS[p.type];
  return m ? p.price / m : null;
}

/** 每 GB 单价 */
export function perGB(p: Plan): number {
  if (!p.trafficGB) return NaN;
  if (p.trafficPer === 'total') return p.price / p.trafficGB;
  const m = MONTHS[p.type] || 1;
  return p.price / (p.trafficGB * m);
}

/** 最低折合月价（不含不限时套餐） */
export function lowestMonthly(pr: Profile): { plan: Plan; value: number } | null {
  let best: { plan: Plan; value: number } | null = null;
  for (const p of pr.plans) {
    if (p.custom) continue;
    const v = perMonth(p);
    if (v !== null && (!best || v < best.value)) best = { plan: p, value: v };
  }
  return best;
}

export function lowestMonthlyPlan(pr: Profile): Plan | undefined {
  return pr.plans.filter((p) => p.type === 'monthly' && !p.custom).sort((a, b) => a.price - b.price)[0];
}

/** 流量显示：1000GB 以上换成 TB */
export function gb(n: number): string {
  return n >= 1000 ? `${Number((n / 1000).toFixed(2))}TB` : `${n}GB`;
}

export function yuan(n: number, digits = 2): string {
  const r = Number(n.toFixed(digits));
  return `¥${r}`;
}
