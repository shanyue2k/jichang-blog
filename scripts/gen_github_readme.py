#!/usr/bin/env python3
"""从网站资料生成 GitHub 仓库 shanyue2k/jichang-tuijian 的 README.md。
用法：python3 scripts/gen_github_readme.py 输出路径
数据：src/data/affiliate-links.json（排序）+ src/data/profiles/*.json（套餐、节点）"""
import json, re, sys, glob, os
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://jichanghao.com'
FEATURED = 10
MONTHS = {'monthly': 1, 'quarterly': 3, 'semiannual': 6, 'yearly': 12, 'onetime': 0}
LABEL = {'monthly': '月付', 'quarterly': '季付', 'semiannual': '半年付', 'yearly': '年付', 'onetime': '不限时'}

aff = json.load(open(f'{ROOT}/src/data/affiliate-links.json'))['airports']
aff.sort(key=lambda a: a['order'])
profiles = {}
for f in glob.glob(f'{ROOT}/src/data/profiles/*.json'):
    p = json.load(open(f))
    if not p.get('draft'):
        profiles[p['id']] = p

def y(n):
    r = round(n, 2)
    return f'¥{int(r)}' if r == int(r) else f'¥{r:g}'

def gb(n):
    return f'{n/1000:g}TB' if n >= 1000 else f'{n}GB'

rows = []
for a in aff:
    p = profiles.get(a['id'])
    if not p:
        continue
    std = [x for x in p['plans'] if not x.get('custom')]
    per = [(x['price'] / MONTHS[x['type']], x) for x in std if MONTHS[x['type']]]
    low = min(per, key=lambda t: t[0]) if per else None
    mon = sorted([x for x in std if x['type'] == 'monthly'], key=lambda x: x['price'])
    n = re.search(r'\d+', p.get('nodeCount', '') or '')
    pg = [x['price'] / (x['trafficGB'] * MONTHS[x['type']]) for x in std if MONTHS[x['type']] and x['trafficGB']]
    rows.append(dict(rank=len(rows) + 1, a=a, p=p, low=low, mon=mon[0] if mon else None,
                     nodes=int(n.group()) if n else None, regions=len(p.get('regions') or []),
                     pergb=min(pg) if pg else None,
                     onetime=any(x['type'] == 'onetime' for x in std),
                     test=(p.get('tests') or [None])[0],
                     url=f"{SITE}/jichang/{a['id']}/"))

collected = max(r['p']['collectedAt'] for r in rows)
yy, mm = collected[:4], int(collected[5:7])
main = rows[0]
L = []
w = L.append

w(f'# 机场推荐 {yy}年{mm}月：{len(rows)} 家机场价格、节点与线路对比\n')
w(f'> 整理主流机场的官网套餐价格、后台节点数量、线路类型和协议，每月更新。完整资料、互动选机场和流量估算器见 **[机场好 jichanghao.com]({SITE}/)**。\n')
w(f'最后更新：{collected} · 资料来源：各机场官网套餐页与后台节点列表 · 价格以官网为准\n')
w('📢 **Telegram 频道：** [t.me/jichanghao](https://t.me/jichanghao)（每月榜单、涨价与优惠通知） · **交流群：** [t.me/jichanghaoqun](https://t.me/jichanghaoqun)\n')
w('**目录：** [站长主推](#站长主推) · [主推与次推 10 家](#主推与次推-10-家) · [站长实测](#站长实测) · [两家机场对比](#两家机场对比) · [全部机场对比表](#全部机场对比表) · [按需求挑机场](#按需求挑机场) · [客户端教程](#客户端教程) · [常见问题](#常见问题)\n')

# 主推
mp = main['p']
w('## 站长主推\n')
w(f"### 🥇 [{main['a']['name']}]({main['url']})\n")
facts = [mp.get('lineType'), f"{main['nodes']} 个节点" if main['nodes'] else None,
         ' / '.join(mp.get('protocols') or []) or None, ('设备' + mp['devices']) if mp.get('devices') else None]
w('**' + ' · '.join(x for x in facts if x) + '**\n')
for c in mp['claims'][:4]:
    w(f'- {c}')
w('')
w('| 怎么买 | 套餐 | 价格 | 每月流量 |')
w('| --- | --- | --- | --- |')
std = [x for x in mp['plans'] if not x.get('custom')]
monthly = sorted([x for x in std if x['type'] == 'monthly'], key=lambda x: x['price'])
longs = sorted([x for x in std if x['type'] not in ('monthly', 'onetime')], key=lambda x: x['price'] / MONTHS[x['type']])
picks = []
if monthly: picks.append(('先试一个月', monthly[0]))
if longs: picks.append(('长期最省', longs[0]))
if len(monthly) > 1: picks.append(('流量更多', monthly[1]))
for tag, x in picks:
    extra = '' if x['type'] == 'monthly' else f"（折合 {y(x['price']/MONTHS[x['type']])}/月）"
    w(f"| {tag} | {x['name']} | {y(x['price'])}/{LABEL[x['type']].replace('付','')}{extra} | {gb(x['trafficGB'])} |")
w('')
if main['a'].get('coupon') and main['a'].get('couponOff'):
    w(f"🎟️ 优惠码 **`{main['a']['coupon']}`**：月付、季付、半年付立减 {main['a']['couponOff']}%（年付一般不能用，以官网为准）\n")
w(f"👉 [{main['a']['name']} 全部套餐与节点]({main['url']}) ｜ [访问 {main['a']['name']} 官网]({main['a']['url']})\n")

def table(items, line=True):
    head = '| 排名 | 机场 | 月付起价 | 折合最低 |' + (' 线路 |' if line else '') + ' 节点 | 协议 | 优惠码 | 实测 | 官网 |'
    w(head)
    w('|' + ' --- |' * (head.count('|') - 1))
    for r in items:
        p = r['p']
        cells = [str(r['rank']), f"[{r['a']['name']}]({r['url']})",
                 f"{y(r['mon']['price'])}/月" if r['mon'] else '—',
                 f"{y(r['low'][0])}/月" if r['low'] else '—']
        if line: cells.append(p.get('lineType') or '—')
        cp = r['a'].get('coupon') if r['a'].get('couponStatus') == 'valid' and r['a'].get('couponOff') else None
        cells += [f"{r['nodes']} 个" if r['nodes'] else '整理中', ' / '.join(p.get('protocols') or []) or '—',
                  f"`{cp}` -{r['a']['couponOff']}%" if cp else '—',
                  f"✅ {r['test']['date'][5:]}" if r['test'] else '—',
                  f"[官网]({r['a']['url']})"]
        w('| ' + ' | '.join(cells) + ' |')
    w('')

w('## 主推与次推 10 家\n')
w(f"第 1 名为站长主推，第 2 到第 {FEATURED} 名为次推，按本站推荐顺序排列。点机场名字可以看全部套餐、节点分布和怎么买最划算。\n")
table(rows[:FEATURED])
w('"折合最低"按年付等长周期套餐换算成每月价格。优惠码一般可用于月付、季付、半年付，年付通常不能用，以官网为准。\n')

tested = [r for r in rows if r['test']]
if tested:
    w('## 站长实测\n')
    w(f'以下 {len(tested)} 家由站长用自己购买的订阅测速（MiaoKo 测速机器人，珠海联通测试服务器，32 线程）。数值为各地区节点平均速度，1 MB/s ≈ 8 Mbps；测试时段不同，结果只代表当时的情况。原始截图见各家资料页。\n')
    regs = ['香港', '台湾', '新加坡', '日本', '美国']
    w('| 机场 | 测试时间 | ' + ' | '.join(regs) + ' | 流媒体解锁 |')
    w('|' + ' --- |' * (len(regs) + 3))
    for r in tested:
        t = r['test']
        cells = [f"[{r['a']['name']}]({r['url']}#test-title)", t['date'] + (' ' + t['time'] if t.get('time') else '')]
        for g in regs:
            x = next((q for q in t['regions'] if q['name'] == g), None)
            cells.append(f"{x['avgMBps']:g} MB/s" if x else '—')
        u = t.get('unlock')
        cells.append('、'.join(f'{k} {v}' for k, v in u.items()) if u else '未测')
        w('| ' + ' | '.join(cells) + ' |')
    w('')

dp = os.path.join(ROOT, 'src/data/duibi.json')
if os.path.exists(dp):
    names = {r['a']['id']: r['a']['name'] for r in rows}
    pairs = [x for x in json.load(open(dp))['pairs'] if x['a'] in names and x['b'] in names]
    if pairs:
        w('## 两家机场对比\n')
        w('价格、按用量的最省方案、节点、优惠码和实测速度逐项比较：\n')
        w(' · '.join(f"[{names[x['a']]} vs {names[x['b']]}]({SITE}/duibi/{x['a']}-vs-{x['b']}/)" for x in pairs) + '\n')
        w(f'全部对比和选择器：[{SITE}/duibi/]({SITE}/duibi/)\n')

w('## 全部机场对比表\n')
w(f'其他 {len(rows) - FEATURED} 家机场也整理了完整资料：\n')
table(rows[FEATURED:])

w('## 按需求挑机场\n')
def lst(title, items, fmt):
    w(f'### {title}\n')
    for i, r in enumerate(items, 1):
        w(f"{i}. [{r['a']['name']}]({r['url']})：{fmt(r)}")
    w('')
lst('长期用最省钱（折合每月价格）', sorted([r for r in rows if r['low']], key=lambda r: r['low'][0])[:5],
    lambda r: f"{r['low'][1]['name']}，折合约 {y(r['low'][0])}/月")
lst('先买一个月试试（月付起价）', sorted([r for r in rows if r['mon']], key=lambda r: r['mon']['price'])[:5],
    lambda r: f"{y(r['mon']['price'])}/月，每月 {gb(r['mon']['trafficGB'])}")
lst('流量用得多（每 GB 最便宜）', sorted([r for r in rows if r['pergb']], key=lambda r: r['pergb'])[:5],
    lambda r: f"最低约 {y(round(r['pergb'], 3))}/GB")
lst('节点最多', sorted([r for r in rows if r['nodes']], key=lambda r: -r['nodes'])[:5],
    lambda r: f"{r['nodes']} 个节点，覆盖 {r['regions']} 个地区")
ot = [r for r in rows if r['onetime']]
if ot:
    w('### 不限时流量包（一次买断，流量不过期）\n')
    w('、'.join(f"[{r['a']['name']}]({r['url']})" for r in ot) + '\n')
w(f'想按自己的用途和预算挑？试试网站上的 **[30 秒选机场]({SITE}/#picker-title)** 和流量估算器。\n')

w('## 客户端教程\n')
for name, path in [('Clash Verge Rev（Windows / macOS）', '/jiaocheng/clash-verge-rev-jiaocheng/'),
                   ('v2rayN（Windows）', '/jiaocheng/v2rayn-jiaocheng/'),
                   ('Shadowrocket 小火箭（iPhone）', '/jiaocheng/shadowrocket-jiaocheng/'),
                   ('Clash Meta for Android（安卓）', '/jiaocheng/clash-meta-for-android-jiaocheng/'),
                   ('外区 Apple ID 注册', '/jiaocheng/waiqu-apple-id-zhuce/'),
                   ('iOS 客户端对比', '/jiaocheng/ios-kehuduan-duibi/'),
                   ('ChatGPT 打不开怎么办', '/jiaocheng/chatgpt-da-bu-kai/'),
                   ('Netflix 等流媒体解锁', '/jiaocheng/liumeiti-jiesuo/'),
                   ('机场是什么', '/wenzhang/jichang-shi-shenme/')]:
    w(f'- [{name}]({SITE}{path})')
w('')

w('## 常见问题\n')
cheap = sorted([r for r in rows if r['low']], key=lambda r: r['low'][0])[:3]
noref = [r['a']['name'] for r in rows if re.search('不接受|不提供', r['p'].get('refund', '') or '')]
qa = [
    ('机场和 VPN 有什么区别？', '机场提供订阅链接，在 Clash、Shadowrocket 等客户端里导入后可以按规则分流：国内网站直连，国外网站走代理。传统 VPN 一般全局转发所有流量。机场节点多、价格低，但需要自己装客户端。'),
    ('哪个机场最便宜？', '按官网价格，折合每月最便宜的是 ' + '、'.join(f"{r['a']['name']}（{y(r['low'][0])}/月）" for r in cheap) + '，基本都是年付小流量套餐。价格以官网为准。'),
    ('这些机场有免费试用吗？', '榜单里的机场都没有免费试用。建议先买最便宜的月付，用一两周确认晚高峰速度和常用网站都正常，再买长周期。'),
    ('可以退款吗？', '多数机场需要提交工单联系客服申请，能否退款以客服答复为准。' + (('、'.join(noref) + ' 在官网标注不提供退款。') if noref else '')),
    ('IPLC / IEPL 专线有什么好处？', '专线不走公网出境，晚高峰更稳、延迟更低，适合看 4K 和用 ChatGPT。'),
]
for q, a in qa:
    w(f'**{q}**\n')
    w(f'{a}\n')

w('---\n')
w(f'- 完整、每月更新的榜单：**[{SITE}/jichang-tuijian/]({SITE}/jichang-tuijian/)**')
w(f'- 机场官网入口汇总：[{SITE}/jichang-daohang/]({SITE}/jichang-daohang/)')
w('- 排名为本站推荐顺序；速度数据只来自站长实测，没实测的机场不写速度。表格中的官网链接为推广链接，通过它注册价格不变，本站可能获得佣金。')
w(f'- 优惠码汇总：[{SITE}/jichang-youhuima/]({SITE}/jichang-youhuima/) · 测评方法：[{SITE}/ceping-fangfa/]({SITE}/ceping-fangfa/)')
w('- Telegram 频道：[t.me/jichanghao](https://t.me/jichanghao) · 交流群：[t.me/jichanghaoqun](https://t.me/jichanghaoqun)')
w('- 发现价格变动或机场异常，欢迎提 Issue 或到交流群反馈。\n')

out = sys.argv[1] if len(sys.argv) > 1 else 'README.md'
open(out, 'w').write('\n'.join(L))
print(out, len(rows), 'airports', collected)
