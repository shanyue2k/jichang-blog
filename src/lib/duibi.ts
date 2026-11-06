// 机场对比页：配对和站长结论在 src/data/duibi.json，其余数据从资料文件计算
import data from '../data/duibi.json';
import { getRanking, type RankedItem } from './ranking';
import { couponExcluded } from './ranking';
import type { Plan } from './profiles';

export type PairDef = {
  a: string;
  b: string;
  updated: string;
  intro: string;
  pickA: string[];
  pickB: string[];
  note?: string;
};

export type Pair = PairDef & { slug: string; A: RankedItem; B: RankedItem };

export const pairSlug = (a: string, b: string) => a + '-vs-' + b;
export const pairPath = (a: string, b: string) => '/duibi/' + pairSlug(a, b) + '/';

export function getPairs(): Pair[] {
  const all = getRanking();
  const out: Pair[] = [];
  for (const d of data.pairs as PairDef[]) {
    const A = all.find((i) => i.aff.id === d.a);
    const B = all.find((i) => i.aff.id === d.b);
    if (A && B) out.push({ ...d, slug: pairSlug(d.a, d.b), A, B });
  }
  return out;
}

/** 某家机场参与的对比页 */
export function pairsOf(id: string): Pair[] {
  return getPairs().filter((p) => p.a === id || p.b === id);
}

const MONTHS: Record<string, number> = { monthly: 1, quarterly: 3, semiannual: 6, yearly: 12, onetime: 0 };
const PERIOD: Record<string, string> = { monthly: '月付', quarterly: '季付', semiannual: '半年付', yearly: '年付' };

const usable = (p: Plan) => !p.custom && !p.name.includes('定制') && p.trafficGB > 0;

export type TierCell = {
  monthly?: Plan;
  monthlyCoupon?: number;
  best?: { plan: Plan; perMonth: number; period: string };
};

/** 每月流量至少 need GB 时：最便宜的月付套餐，以及摊到每月最便宜的周期套餐 */
export function tierCell(item: RankedItem, need: number): TierCell {
  const plans = item.profile.plans.filter(usable);
  const monthly = plans
    .filter((p) => p.type === 'monthly' && p.trafficGB >= need)
    .sort((x, y) => x.price - y.price)[0];
  let best: TierCell['best'];
  for (const p of plans) {
    const m = MONTHS[p.type];
    if (!m || p.trafficGB < need) continue;
    const pm = p.price / m;
    if (!best || pm < best.perMonth) best = { plan: p, perMonth: pm, period: PERIOD[p.type] };
  }
  const off = item.aff.couponOff;
  const monthlyCoupon = monthly && off && item.aff.coupon && !couponExcluded(monthly) ? (monthly.price * (100 - off)) / 100 : undefined;
  return { monthly, monthlyCoupon, best };
}

export function onetimeOf(item: RankedItem): Plan[] {
  return item.profile.plans.filter((p) => usable(p) && p.type === 'onetime').sort((x, y) => x.price - y.price);
}

export const TIERS = [50, 150, 300, 600, 1000];
