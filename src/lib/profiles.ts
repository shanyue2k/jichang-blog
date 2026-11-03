// 机场资料页（官网资料整理，非实测）
import affiliate from '../data/affiliate-links.json';

export type Plan = {
  name: string;
  type: 'monthly' | 'quarterly' | 'yearly' | 'onetime';
  price: number;
  trafficGB: number;
  /** month = 每月重置的流量；total = 一次性总流量 */
  trafficPer: 'month' | 'total';
  note?: string;
};

export type Profile = {
  id: string;
  collectedAt: string;
  source: string;
  lineType?: string;
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
};

export type AffItem = {
  id: string;
  order: number;
  name: string;
  url: string;
  tested: boolean;
  coupon?: string;
};

const files = import.meta.glob<{ default: Profile }>('../data/profiles/*.json', { eager: true });
export const profiles: Profile[] = Object.values(files).map((m) => m.default);

export function getProfile(id: string): Profile | undefined {
  return profiles.find((p) => p.id === id);
}

export function getAff(id: string): AffItem | undefined {
  return (affiliate.airports as AffItem[]).find((a) => a.id === id);
}

export function profilePath(id: string): string {
  return `/jichang/${id}/`;
}

const MONTHS: Record<Plan['type'], number> = { monthly: 1, quarterly: 3, yearly: 12, onetime: 0 };

export const PLAN_TYPE_LABEL: Record<Plan['type'], string> = {
  monthly: '月付',
  quarterly: '季付',
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
  if (p.trafficPer === 'total') return p.price / p.trafficGB;
  const m = MONTHS[p.type] || 1;
  return p.price / (p.trafficGB * m);
}

/** 最低折合月价（不含不限时套餐） */
export function lowestMonthly(pr: Profile): { plan: Plan; value: number } | null {
  let best: { plan: Plan; value: number } | null = null;
  for (const p of pr.plans) {
    const v = perMonth(p);
    if (v !== null && (!best || v < best.value)) best = { plan: p, value: v };
  }
  return best;
}

export function lowestMonthlyPlan(pr: Profile): Plan | undefined {
  return pr.plans.filter((p) => p.type === 'monthly').sort((a, b) => a.price - b.price)[0];
}

/** 流量显示：1000GB 以上换成 TB */
export function gb(n: number): string {
  return n >= 1000 ? `${Number((n / 1000).toFixed(2))}TB` : `${n}GB`;
}

export function yuan(n: number, digits = 2): string {
  const r = Number(n.toFixed(digits));
  return `¥${r}`;
}
