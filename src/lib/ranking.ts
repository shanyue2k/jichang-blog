// 机场推荐榜：按站长设定的推广顺序（affiliate-links.json 的 order）排序，只列已整理资料的机场
import affiliate from '../data/affiliate-links.json';
import { lowestMonthly, lowestMonthlyPlan, perGB, profilePath, profiles, type AffItem, type Plan, type Profile } from './profiles';

/** 首页和推荐页主推的家数 */
export const FEATURED_COUNT = 10;

export type RankedItem = {
  rank: number;
  aff: AffItem;
  profile: Profile;
  path: string;
  /** 折合每月最低价（含年付等长周期） */
  lowest: number | null;
  lowestPlanName?: string;
  /** 最便宜的月付套餐 */
  monthlyFrom: number | null;
  monthlyFromGB?: number;
  /** 周期套餐里最低的每 GB 单价 */
  bestPerGB: number | null;
  nodeTotal: number | null;
  regionCount: number;
  hasOnetime: boolean;
};

export function getRanking(): RankedItem[] {
  const affs = (affiliate.airports as AffItem[]).slice().sort((a, b) => a.order - b.order);
  const list: RankedItem[] = [];
  for (const aff of affs) {
    const profile = profiles.find((p) => p.id === aff.id);
    if (!profile) continue;
    const low = lowestMonthly(profile);
    const m = lowestMonthlyPlan(profile);
    const per = profile.plans
      .filter((p) => !p.custom && p.type !== 'onetime' && p.trafficGB > 0)
      .map(perGB)
      .filter((v) => Number.isFinite(v));
    const n = profile.nodeCount?.match(/\d+/);
    list.push({
      rank: list.length + 1,
      aff,
      profile,
      path: profilePath(aff.id),
      lowest: low ? low.value : null,
      lowestPlanName: low?.plan.name,
      monthlyFrom: m ? m.price : null,
      monthlyFromGB: m?.trafficGB,
      bestPerGB: per.length ? Math.min(...per) : null,
      nodeTotal: n ? Number(n[0]) : null,
      regionCount: profile.regions?.length ?? 0,
      hasOnetime: profile.plans.some((p) => p.type === 'onetime' && !p.custom),
    });
  }
  return list;
}

export function rankingUpdated(list: RankedItem[]): Date {
  const t = Math.max(...list.map((i) => new Date(i.profile.collectedAt).getTime()));
  return new Date(Number.isFinite(t) ? t : Date.now());
}

/** 「2026年11月」 */
export function monthLabel(d: Date): string {
  const f = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: 'numeric' }).formatToParts(d);
  return `${f.find((p) => p.type === 'year')?.value}年${f.find((p) => p.type === 'month')?.value}月`;
}

export const isDedicated = (i: RankedItem) => /IPLC|IEPL/.test(i.profile.lineType ?? '');
export const isNoRefund = (i: RankedItem) => /不接受|不提供/.test(i.profile.refund ?? '');

// ---------- 专题页用的价格计算 ----------

const MONTHS_OF: Record<string, number> = { monthly: 1, quarterly: 3, semiannual: 6, yearly: 12, onetime: 0 };

export type PlanPick = { item: RankedItem; plan: Plan; perMonth: number; months: number };

/** 每家机场里，每月流量 ≥ need 的周期套餐中折合月价最低的一个；按价格排序 */
export function cheapestForUsage(list: RankedItem[], need: number): PlanPick[] {
  const out: PlanPick[] = [];
  for (const item of list) {
    let best: PlanPick | null = null;
    for (const plan of item.profile.plans) {
      const m = MONTHS_OF[plan.type];
      if (plan.custom || !m || plan.trafficGB < need) continue;
      const pm = plan.price / m;
      if (!best || pm < best.perMonth) best = { item, plan, perMonth: pm, months: m };
    }
    if (best) out.push(best);
  }
  return out.sort((a, b) => a.perMonth - b.perMonth || a.item.rank - b.item.rank);
}

/** 每家机场每 GB 最便宜的周期套餐 */
export function bestPerGBPlan(list: RankedItem[]): (PlanPick & { perGB: number })[] {
  const out: (PlanPick & { perGB: number })[] = [];
  for (const item of list) {
    let best: (PlanPick & { perGB: number }) | null = null;
    for (const plan of item.profile.plans) {
      const m = MONTHS_OF[plan.type];
      if (plan.custom || !m || !plan.trafficGB) continue;
      const g = plan.price / (plan.trafficGB * m);
      if (!best || g < best.perGB) best = { item, plan, perMonth: plan.price / m, months: m, perGB: g };
    }
    if (best) out.push(best);
  }
  return out.sort((a, b) => a.perGB - b.perGB);
}

export function lowestPick(item: RankedItem): PlanPick | null {
  const r = cheapestForUsage([item], 0);
  return r[0] ?? null;
}

// ---------- 不限时流量包 ----------
export type Pack = { item: RankedItem; plan: Plan; perGB: number; deviceNote: string; limited: boolean };

export function onetimePacks(list: RankedItem[]): Pack[] {
  const out: Pack[] = [];
  for (const item of list) {
    for (const plan of item.profile.plans) {
      if (plan.custom || plan.type !== 'onetime' || !plan.trafficGB) continue;
      const note = plan.note ?? '';
      const dev = note.split('；').find((s) => s.includes('台设备')) ?? '';
      out.push({ item, plan, perGB: plan.price / plan.trafficGB, deviceNote: dev, limited: note.includes('仅限前') });
    }
  }
  return out;
}

export const mentionsResetDiscount = (p: Pack) => (p.plan.note ?? '').includes('9 折');
