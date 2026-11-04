// 导出全部机场资料（推广链接 + 已整理的资料），给站长自己用
import affiliate from '../data/affiliate-links.json';
import { PLAN_TYPE_LABEL, getProfile, lowestMonthly, lowestMonthlyPlan, perGB, perMonth, profilePath, type AffItem } from './profiles';
import { SITE } from '../site.config';

const r2 = (n: number, d = 2) => Number(n.toFixed(d));

export function buildExport() {
  const items = (affiliate.airports as (AffItem & { altUrls?: string[]; note?: string })[]).slice().sort((a, b) => a.order - b.order);
  return items.map((a) => {
    const p = getProfile(a.id);
    const low = p ? lowestMonthly(p) : null;
    const lowM = p ? lowestMonthlyPlan(p) : undefined;
    return {
      序号: a.order,
      机场: a.name,
      代号: a.id,
      推广链接: a.url,
      备用链接: (a.altUrls ?? []).join(' '),
      优惠码: a.coupon ?? '',
      资料状态: p ? '已整理' : '未整理',
      资料页: p ? new URL(profilePath(a.id), SITE.url).href : '',
      整理日期: p?.collectedAt ?? '',
      官方标注线路: p?.lineType ?? '',
      线路说明: p?.lineNote ?? '',
      节点地区: (p?.regions ?? []).join('、'),
      节点数量: p?.nodeCount ?? '',
      节点说明: p?.nodeNote ?? '',
      协议: (p?.protocols ?? []).join(' / '),
      设备数: p?.devices ?? '',
      流量倍率: p?.rate ?? '',
      免费试用: p?.trial ?? '',
      退款政策: p?.refund ?? '',
      月付起价: lowM ? lowM.price : '',
      最低折合月价: low ? r2(low.value) : '',
      最低价套餐: low ? low.plan.name : '',
      长期折扣: p?.discounts ?? '',
      官方介绍: (p?.claims ?? []).join('；'),
      备注: a.note ?? '',
      套餐: (p?.plans ?? []).map((pl) => ({
        套餐名称: pl.name,
        类型: pl.custom ? '定制' : PLAN_TYPE_LABEL[pl.type],
        价格: pl.price,
        计价: pl.type === 'onetime' ? '一次性' : pl.type === 'yearly' ? '每年' : pl.type === 'quarterly' ? '每季' : pl.type === 'semiannual' ? '每半年' : '每月',
        流量GB: pl.trafficGB || '按需定制',
        流量方式: pl.trafficPer === 'month' ? '每月重置' : '总量不过期',
        折合每月: perMonth(pl) !== null ? r2(perMonth(pl)!) : '',
        每GB单价: Number.isFinite(perGB(pl)) ? r2(perGB(pl), 3) : '',
        说明: pl.note ?? '',
      })),
    };
  });
}

/** 生成 Excel 能直接打开的 CSV（带 BOM，中文不乱码） */
export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '﻿';
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v === undefined || v === null ? '' : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return '﻿' + [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\r\n');
}
