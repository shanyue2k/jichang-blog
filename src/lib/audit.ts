// 资料核对分：只看「资料是否透明、宣传和实际是否一致」，不代表速度和稳定性
import type { AffItem, Profile } from './profiles';

export type AuditItem = { key: string; label: string; max: number; score: number; reasons: string[] };
export type Audit = { total: number; grade: 'A' | 'B' | 'C' | 'D'; items: AuditItem[] };

export function auditOf(p: Profile, aff: AffItem): Audit {
  const items: AuditItem[] = [];

  // 1. 宣传与实际一致（30）
  {
    let s = 30;
    const r: string[] = [];
    if (p.audit?.nodeMismatch) { s -= 10; r.push('节点：' + p.audit.nodeMismatch + '（-10）'); }
    if (p.audit?.protocolMismatch) { s -= 8; r.push('协议：套餐说明写 Shadowsocks / SS，后台实际是 VLESS（-8）'); }
    if (p.audit?.labelMismatch) { s -= 6; r.push('线路：' + p.audit.labelMismatch + '（-6）'); }
    if (!r.length) r.push('官网的节点、协议、线路说明和后台一致');
    items.push({ key: 'match', label: '宣传与实际一致', max: 30, score: s, reasons: r });
  }

  // 2. 线路标注（20）
  {
    const scope = p.lineScope;
    const s = scope === 'all' ? 20 : scope === 'exit' ? 12 : scope === 'partial' ? 10 : 8;
    const r =
      scope === 'all' ? ['全部套餐都标注 IPLC / IEPL 专线']
      : scope === 'exit' ? ['标注 BGP 调度 + 专线出口，入口不是专线（-8）']
      : scope === 'partial' ? ['只有部分套餐标注专线，其余是 BGP 或中转（-10）']
      : ['线路说明不明确（-12）'];
    items.push({ key: 'line', label: '线路标注', max: 20, score: s, reasons: r });
  }

  // 3. 套餐说明（20）
  {
    let s = 0;
    const r: string[] = [];
    if (p.devices) { s += 7; r.push('写明设备数：' + p.devices); } else r.push('没有写明设备数（-7）');
    if (p.rate) { s += 7; r.push('写明节点倍率'); } else r.push('没有写明节点倍率（-7）');
    if (p.discounts) { s += 6; r.push('写明长期付折扣'); } else r.push('没有写明长期付折扣（-6）');
    items.push({ key: 'plan', label: '套餐说明', max: 20, score: s, reasons: r });
  }

  // 4. 退款（15）
  {
    const no = /不接受|不提供/.test(p.refund ?? '');
    items.push({
      key: 'refund',
      label: '退款规则',
      max: 15,
      score: no ? 5 : 15,
      reasons: [no ? '官网标注不提供退款（-10）' : '可以提交工单申请退款'],
    });
  }

  // 5. 优惠码（15）
  {
    let s = 0;
    let why = '目前没有可用的优惠码（-15）';
    if (aff.couponStatus === 'valid' && aff.couponOff) {
      s = aff.couponOff >= 20 ? 15 : 12;
      why = '有可用优惠码，立减 ' + aff.couponOff + '%' + (s < 15 ? '（-3）' : '');
    } else if (aff.couponStatus === 'renewal') {
      s = 5;
      why = '只有老用户续费优惠码（-10）';
    }
    items.push({ key: 'coupon', label: '优惠码', max: 15, score: s, reasons: [why] });
  }

  const total = items.reduce((a, b) => a + b.score, 0);
  const grade = total >= 90 ? 'A' : total >= 80 ? 'B' : total >= 70 ? 'C' : 'D';
  return { total, grade, items };
}
