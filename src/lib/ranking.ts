// 机场推荐榜：按站长设定的推广顺序（affiliate-links.json 的 order）排序，只列已整理资料的机场
import affiliate from '../data/affiliate-links.json';
import { lowestMonthly, lowestMonthlyPlan, perGB, profilePath, profiles, type AffItem, type Profile } from './profiles';

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
