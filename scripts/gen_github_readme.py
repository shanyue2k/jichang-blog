#!/usr/bin/env python3
"""从网站资料生成 GitHub 仓库 shanyue2k/jichang-tuijian 的 README.md。
用法：python3 scripts/gen_github_readme.py 输出路径
数据：src/data/affiliate-links.json（排序、优惠码）+ src/data/profiles/*.json（套餐、节点、实测）
     + src/data/zhanzhang.json（站长点评）+ src/data/duibi.json（对比页）
只写资料里有的内容：没有实测的机场不写速度。"""
import json, re, sys, glob, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://jichanghao.com'
FEATURED = 10
MONTHS = {'monthly': 1, 'quarterly': 3, 'semiannual': 6, 'yearly': 12, 'onetime': 0}
LABEL = {'monthly': '月付', 'quarterly': '季付', 'semiannual': '半年付', 'yearly': '年付', 'onetime': '不限时'}
CN = '一二三四五六七八九十'

def load(rel):
    return json.load(open(os.path.join(ROOT, rel)))

aff = load('src/data/affiliate-links.json')['airports']
aff.sort(key=lambda a: a['order'])
profiles = {}
for f in glob.glob(f'{ROOT}/src/data/profiles/*.json'):
    p = json.load(open(f))
    if not p.get('draft'):
        profiles[p['id']] = p
zz = load('src/data/zhanzhang.json')
pairs_all = load('src/data/duibi.json')['pairs']

def y(n):
    r = round(n, 2)
    return f'¥{int(r)}' if r == int(r) else f'¥{r:g}'

def gb(n):
    return f'{n/1000:g}TB' if n >= 1000 else f'{n}GB'

def short_line(p):
    scope, kind = p.get('lineScope'), p.get('lineKind')
    if scope == 'all':
        return {'IPLC': 'IPLC 专线', 'IEPL': 'IEPL 专线', 'both': 'IPLC/IEPL 专线'}.get(kind, '专线')
    if scope == 'exit':
        return 'BGP + 专线出口'
    if scope == 'partial':
        return '部分套餐专线'
    return p.get('lineType') or '线路未写明'

def audit(p, a):
    s = 30
    au = p.get('audit') or {}
    if au.get('nodeMismatch'): s -= 10
    if au.get('protocolMismatch'): s -= 8
    if au.get('labelMismatch'): s -= 6
    s += {'all': 20, 'exit': 12, 'partial': 10}.get(p.get('lineScope'), 8)
    s += (7 if p.get('devices') else 0) + (7 if p.get('rate') else 0) + (6 if p.get('discounts') else 0)
    s += 5 if re.search('不接受|不提供', p.get('refund') or '') else 15
    if a.get('couponStatus') == 'valid' and a.get('couponOff'):
        s += 15 if a['couponOff'] >= 20 else 12
    elif a.get('couponStatus') == 'renewal':
        s += 5
    return s

rows = []
for a in aff:
    p = profiles.get(a['id'])
    if not p:
        continue
    std = [x for x in p['plans'] if not x.get('custom') and '定制' not in x['name']]
    per = [(x['price'] / MONTHS[x['type']], x) for x in std if MONTHS[x['type']]]
    low = min(per, key=lambda t: t[0]) if per else None
    mon = sorted([x for x in std if x['type'] == 'monthly'], key=lambda x: x['price'])
    n = re.search(r'\d+', p.get('nodeCount', '') or '')
    pg = [x['price'] / (x['trafficGB'] * MONTHS[x['type']]) for x in std if MONTHS[x['type']] and x['trafficGB']]
    rows.append(dict(rank=len(rows) + 1, a=a, p=p, std=std, low=low, mon=mon[0] if mon else None,
                     nodes=int(n.group()) if n else None, regions=len(p.get('regions') or []),
                     pergb=min(pg) if pg else None,
                     onetime=any(x['type'] == 'onetime' for x in std),
                     test=(p.get('tests') or [None])[0],
                     url=f"{SITE}/jichang/{a['id']}/"))

names = {r['a']['id']: r['a']['name'] for r in rows}
pairs = [x for x in pairs_all if x['a'] in names and x['b'] in names]
collected = max(r['p']['collectedAt'] for r in rows)
yy, mm = collected[:4], int(collected[5:7])
main = rows[0]
featured = rows[:FEATURED]
tested = [r for r in rows if r['test']]
L = []
w = L.append

def coupon_of(a):
    return a.get('coupon') if a.get('couponStatus') == 'valid' and a.get('couponOff') else None

def heading(i, r):
    p, a = r['p'], r['a']
    nm = a['name'] if a['name'].endswith('机场') else a['name'] + (' 机场' if re.match(r'^[A-Za-z0-9]', a['name']) else '机场')
    bits = [short_line(p), ' / '.join(p.get('protocols') or []) or '协议未写明']
    if r['mon']:
        bits.append(f"{int(r['mon']['price']) if r['mon']['price'] == int(r['mon']['price']) else r['mon']['price']}元/月{gb(r['mon']['trafficGB'])}")
    if r['test']:
        bits.append('已实测')
    return f"### {CN[i]}、{nm}（{'｜'.join(bits)}）"

# ---------------- 开头 ----------------
w(f'# {yy} 机场推荐（{mm} 月更新）：{len(featured)} 家主推机场实测、价格与优惠码\n')
w(f'> 整理 {len(rows)} 家主流机场的官网套餐、后台节点、线路和协议，其中 {len(tested)} 家由站长用自己买的订阅实测，附原始测速截图。没测过的机场不写速度。每月核对一次价格和优惠码。完整资料与互动选机场见 **[机场好 jichanghao.com]({SITE}/)**。\n')
w(f'最后更新：{collected} · 价格以各机场官网为准 · 📢 Telegram 频道 [t.me/jichanghao](https://t.me/jichanghao) · 交流群 [t.me/jichanghaoqun](https://t.me/jichanghaoqun)\n')
w('**目录：** [买机场前要知道的几件事](#买机场前要知道的几件事) · [客户端推荐](#机场客户端推荐) · [机场推荐 10 家](#机场推荐主推与次推-10-家) · [站长实测汇总](#站长实测汇总) · [两家机场对比](#两家机场对比) · [其他机场](#其他机场) · [按需求挑机场](#按需求挑机场) · [常见问题](#常见问题)\n')

# ---------------- 买前须知 ----------------
cheap_mon = sorted([r for r in rows if r['mon']], key=lambda r: r['mon']['price'])
w('## 买机场前要知道的几件事\n')
tips = [
    ('先买月付，别一上来就买一年',
     f"机场跑路的事每年都有。哪怕年付折合每月只要 {y(min(r['low'][0] for r in rows if r['low']))}，也建议先买一个月，晚上 8 点到 11 点多用几天，确认稳定再买长周期。"),
    ('线路比流量重要',
     '同样 100GB，走 IPLC / IEPL 专线的晚高峰基本不卡，走公网直连的到了晚上可能连视频都打不开。看套餐先看线路标注，再看流量。区别详见 [机场线路怎么选](' + SITE + '/wenzhang/jichang-xianlu-qubie/)。'),
    ('要用 ChatGPT，得有香港以外的节点',
     'ChatGPT 和 Claude 都不支持香港，而香港偏偏是机场节点最多、最快的地区。要用 AI，就看台湾、日本、新加坡、美国节点够不够。详见 [ChatGPT 机场推荐](' + SITE + '/chatgpt-jichang/)。'),
    ('官网写的不一定等于后台',
     '整理资料时，有机场官网写 15 个地区、后台实际只有 4 个。下单前可以先看节点列表，或者看有没有第三方实测。'),
    ('优惠码一般不能用于年付',
     '大多数机场的优惠码只能用于月付、季付、半年付，个别活动套餐也不能用。用码前先算一下，有时候直接买更高一档用码反而更划算。'),
    ('准备一个备用机场',
     f"再好的机场也可能临时出问题。工作离不开的话，可以再备一个便宜的不限时流量包，平时不用不扣钱，例如本站整理里最便宜的不限时包从 {y(min(x['price'] for r in rows for x in r['std'] if x['type']=='onetime'))} 起。"),
]
for i, (t, d) in enumerate(tips, 1):
    w(f'### {i}. {t}\n')
    w(d + '\n')

# ---------------- 客户端 ----------------
w('## 机场客户端推荐\n')
w('机场只提供节点和订阅链接，还需要一个客户端来连接。快不快主要看机场，客户端选一个顺手、还在更新的就行。\n')
w('| 设备 | 推荐客户端 | 教程 |')
w('| --- | --- | --- |')
for d, c, path in [('Windows / macOS', 'Clash Verge Rev', '/jiaocheng/clash-verge-rev-jiaocheng/'),
                   ('Windows', 'v2rayN', '/jiaocheng/v2rayn-jiaocheng/'),
                   ('iPhone / iPad', 'Shadowrocket（小火箭，需外区 Apple ID）', '/jiaocheng/shadowrocket-jiaocheng/'),
                   ('安卓', 'Clash Meta for Android', '/jiaocheng/clash-meta-for-android-jiaocheng/')]:
    w(f'| {d} | {c} | [{c.split("（")[0]} 教程]({SITE}{path}) |')
w('')

# ---------------- 主推与次推 ----------------
w('## 机场推荐：主推与次推 10 家\n')
w(f"第 1 名为站长主推，第 2 到第 {FEATURED} 名为次推，按本站推荐顺序排列。先看总表，下面每家有详细介绍。\n")

def table(items):
    head = '| 排名 | 机场 | 线路 | 月付起价 | 折合最低 | 节点 | 优惠码 | 实测 |'
    w(head)
    w('|' + ' --- |' * (head.count('|') - 1))
    for r in items:
        p = r['p']
        cp = coupon_of(r['a'])
        w('| ' + ' | '.join([
            str(r['rank']), f"[{r['a']['name']}]({r['url']})", short_line(p),
            f"{y(r['mon']['price'])}/月" if r['mon'] else '—',
            f"{y(r['low'][0])}/月" if r['low'] else '—',
            f"{r['nodes']} 个" if r['nodes'] else '整理中',
            f"`{cp}` -{r['a']['couponOff']}%" if cp else '—',
            f"✅ {r['test']['date'][5:]}" if r['test'] else '—',
        ]) + ' |')
    w('')

table(featured)
w('"折合最低"是把季付、半年付、年付摊到每月后的最低价，多为年付小流量套餐。\n')

for i, r in enumerate(featured):
    p, a = r['p'], r['a']
    w(heading(i, r) + '\n')
    note = zz['notes'].get(a['id'])
    if note:
        w(f"> **站长 {zz['author']} 点评：** {note['text']}\n")
    facts = [('线路', p.get('lineType')), ('节点', (p.get('nodeCount') or '') + ('，' + p['nodeNote'] if p.get('nodeNote') else '')),
             ('协议', ' / '.join(p.get('protocols') or [])), ('设备数', p.get('devices')), ('倍率', p.get('rate'))]
    for k, v in facts:
        if v:
            w(f'- **{k}**：{v}')
    au = (p.get('audit') or {}).get('nodeMismatch')
    if au:
        w(f'- **注意**：{au}')
    w('')
    # 套餐
    w('| 套餐 | 付款 | 价格 | 流量 | 折合每月 |')
    w('| --- | --- | --- | --- | --- |')
    order = {'monthly': 0, 'quarterly': 1, 'semiannual': 2, 'yearly': 3, 'onetime': 4}
    for x in sorted(r['std'], key=lambda x: (order[x['type']], x['price'])):
        m = MONTHS[x['type']]
        traffic = (gb(x['trafficGB']) + ('（总量）' if x.get('trafficPer') == 'total' else '/月')) if x['trafficGB'] else '—'
        w(f"| {x['name']} | {LABEL[x['type']]} | {y(x['price'])} | {traffic} | {y(x['price']/m) if m else '—'} |")
    w('')
    if p.get('discounts'):
        w(p['discounts'] + '\n')
    # 实测
    t = r['test']
    if t:
        w(f"**站长实测**（{t['date']} {t.get('time','')}，{t['env']}，{t['tool']}）：\n")
        w('| 地区 | 节点 | 平均速度 | 延迟 |')
        w('| --- | --- | --- | --- |')
        for g in t['regions']:
            fail = f"（{g['failed']} 个失败）" if g['failed'] else ''
            w(f"| {g['name']} | {g['nodes']} 个{fail} | {g['avgMBps']:g} MB/s ≈ {round(g['avgMBps']*8):,} Mbps | {g['medianRttMs']} ms |")
        w('')
        if t.get('unlock'):
            w('流媒体解锁：' + '、'.join(f'{k} {v}' for k, v in t['unlock'].items()) + '\n')
        if t.get('images'):
            img = t['images'][0]
            w(f"[![{img['alt']}]({SITE}{img['src']})]({r['url']}#test-title)\n")
            w(f"*{img.get('caption', '测速截图')}，保留测速工具水印。全部截图见[{a['name']}资料页]({r['url']}#test-title)。*\n")
    elif p.get('topology'):
        tp = p['topology']
        w(f"**尚未测速。** 站长 {tp['date']} 做过一次节点出口分析（不是测速）：" + '；'.join(tp['findings'][:2]) + '。\n')
    else:
        w(f"**尚未实测。** 资料核对分 {audit(p, a)} / 100（只看官网资料是否透明、宣传和后台是否一致，不代表速度）。\n")
    # 优惠码 + 链接
    cp = coupon_of(a)
    if cp:
        w(f"🎟️ 优惠码 **`{cp}`**：立减 {a['couponOff']}%，一般可用于月付、季付、半年付，以官网为准。\n")
    rel = [x for x in pairs if a['id'] in (x['a'], x['b'])]
    links = [f"[访问{a['name']}官网]({a['url']})", f"[{a['name']}全部资料]({r['url']})"]
    links += [f"[{names[x['a']]} vs {names[x['b']]}]({SITE}/duibi/{x['a']}-vs-{x['b']}/)" for x in rel[:3]]
    w('👉 ' + ' ｜ '.join(links) + '\n')

# ---------------- 实测汇总 ----------------
if tested:
    w('## 站长实测汇总\n')
    w(f'{len(tested)} 家由站长用自己购买的订阅测速（MiaoKo 测速机器人，珠海联通测试服务器，32 线程）。数值为各地区节点平均速度，1 MB/s ≈ 8 Mbps；测试时段不同，结果只代表当时的情况。\n')
    regs = ['香港', '台湾', '新加坡', '日本', '美国']
    w('| 机场 | 测试时间 | ' + ' | '.join(regs) + ' | 流媒体解锁 |')
    w('|' + ' --- |' * (len(regs) + 3))
    for r in tested:
        t = r['test']
        cells = [f"[{r['a']['name']}]({r['url']}#test-title)", t['date'] + (' ' + t['time'] if t.get('time') else '')]
        for g in regs:
            x = next((q for q in t['regions'] if q['name'] == g), None)
            cells.append(f"{x['avgMBps']:g}" if x else '—')
        u = t.get('unlock')
        cells.append('、'.join(f'{k} {v}' for k, v in u.items()) if u else '未测')
        w('| ' + ' | '.join(cells) + ' |')
    w('\n单位：MB/s。测试方法见 [测评方法](' + SITE + '/ceping-fangfa/)。\n')

# ---------------- 对比 ----------------
if pairs:
    w('## 两家机场对比\n')
    w('纠结两家选哪个？价格、按用量的最省方案、节点、优惠码和实测速度逐项比较：\n')
    for x in pairs:
        w(f"- [{names[x['a']]} vs {names[x['b']]}]({SITE}/duibi/{x['a']}-vs-{x['b']}/)")
    w(f'\n全部对比和选择器：[{SITE}/duibi/]({SITE}/duibi/)\n')

# ---------------- 其他机场 ----------------
w('## 其他机场\n')
w(f'下面 {len(rows) - FEATURED} 家也整理了完整的套餐和节点资料，点名字可以看详情：\n')
table(rows[FEATURED:])

# ---------------- 按需求 ----------------
w('## 按需求挑机场\n')
def lst(title, items, fmt):
    w(f'### {title}\n')
    for i, r in enumerate(items, 1):
        w(f"{i}. [{r['a']['name']}]({r['url']})：{fmt(r)}")
    w('')
lst('长期用最省钱（折合每月价格）', sorted([r for r in rows if r['low']], key=lambda r: r['low'][0])[:5],
    lambda r: f"{r['low'][1]['name']}，折合约 {y(r['low'][0])}/月")
lst('先买一个月试试（月付起价）', cheap_mon[:5],
    lambda r: f"{y(r['mon']['price'])}/月，每月 {gb(r['mon']['trafficGB'])}")
lst('流量用得多（每 GB 最便宜）', sorted([r for r in rows if r['pergb']], key=lambda r: r['pergb'])[:5],
    lambda r: f"最低约 {y(round(r['pergb'], 3))}/GB")
lst('节点最多', sorted([r for r in rows if r['nodes']], key=lambda r: -r['nodes'])[:5],
    lambda r: f"{r['nodes']} 个节点，覆盖 {r['regions']} 个地区")
w('更多专题：' + ' · '.join(f'[{n}]({SITE}{p})' for n, p in [
    ('便宜机场推荐', '/pianyi-jichang/'), ('不限时流量机场', '/buxianshi-jichang/'), ('IPLC / IEPL 专线机场', '/zhuanxian-jichang/'),
    ('梯子推荐', '/tizi-tuijian/'), ('ChatGPT 机场推荐', '/chatgpt-jichang/'), ('机场优惠码', '/jichang-youhuima/')]) + '\n')

# ---------------- 教程 ----------------
w('## 客户端教程\n')
for name, path in [('Clash Verge Rev（Windows / macOS）', '/jiaocheng/clash-verge-rev-jiaocheng/'),
                   ('v2rayN（Windows）', '/jiaocheng/v2rayn-jiaocheng/'),
                   ('Shadowrocket 小火箭（iPhone）', '/jiaocheng/shadowrocket-jiaocheng/'),
                   ('Clash Meta for Android（安卓）', '/jiaocheng/clash-meta-for-android-jiaocheng/'),
                   ('Telegram 连不上、收不到验证码、设置中文', '/jiaocheng/telegram-jiaocheng/'),
                   ('ChatGPT 打不开怎么办', '/jiaocheng/chatgpt-da-bu-kai/'),
                   ('Netflix 等流媒体解锁', '/jiaocheng/liumeiti-jiesuo/'),
                   ('外区 Apple ID 注册', '/jiaocheng/waiqu-apple-id-zhuce/'),
                   ('机场是什么', '/wenzhang/jichang-shi-shenme/')]:
    w(f'- [{name}]({SITE}{path})')
w('')

# ---------------- FAQ ----------------
w('## 常见问题\n')
cheap = sorted([r for r in rows if r['low']], key=lambda r: r['low'][0])[:3]
noref = [r['a']['name'] for r in rows if re.search('不接受|不提供', r['p'].get('refund', '') or '')]
qa = [
    ('2026 年哪个机场最好？', f"没有一家适合所有人。本站主推{main['a']['name']}（{main['p'].get('lineType','')}，晚高峰实测香港 {next((g['avgMBps'] for g in (main['test'] or {}).get('regions', []) if g['name']=='香港'), '—')} MB/s）；预算紧可以看月付最便宜的几家，流量用得多看每 GB 单价。按自己的用量对照上面的表最准确。"),
    ('机场和 VPN 有什么区别？', '机场提供订阅链接，在 Clash、Shadowrocket 等客户端里导入后可以按规则分流：国内网站直连，国外网站走代理。传统 VPN 一般全局转发所有流量。机场节点多、价格低，但需要自己装客户端。'),
    ('哪个机场最便宜？', '按官网价格，折合每月最便宜的是 ' + '、'.join(f"{r['a']['name']}（{y(r['low'][0])}/月）" for r in cheap) + '，基本都是年付小流量套餐。月付最便宜的从 ' + y(cheap_mon[0]['mon']['price']) + ' 起。价格以官网为准。'),
    ('这些机场有免费试用吗？', '本站整理的机场都没有免费试用。建议先买最便宜的月付，用一两周确认晚高峰速度和常用网站都正常，再买长周期。'),
    ('可以退款吗？', '多数机场需要提交工单联系客服申请，能否退款以客服答复为准。' + (('、'.join(noref) + ' 在官网标注不提供退款。') if noref else '')),
    ('实测数据可信吗？', '实测由站长用自己购买的订阅交给 MiaoKo 测速机器人测，每份都写明测试时间和环境，并公开原始截图（保留工具水印）。速度只代表测试当时、测试服务器所在网络的情况。没测过的机场一律写"尚未实测"。'),
]
for q, a_ in qa:
    w(f'**{q}**\n')
    w(f'{a_}\n')

w('---\n')
w(f'- 完整、每月更新的榜单：**[{SITE}/jichang-tuijian/]({SITE}/jichang-tuijian/)**')
w(f'- 机场优惠码汇总：[{SITE}/jichang-youhuima/]({SITE}/jichang-youhuima/) · 测评方法：[{SITE}/ceping-fangfa/]({SITE}/ceping-fangfa/)')
w('- 排名为本站推荐顺序；速度数据只来自站长实测。表格中的官网链接为推广链接，通过它注册价格不变，本站可能获得佣金。')
w('- 发现价格变动或机场异常，欢迎提 Issue，或到 Telegram 交流群反馈。招商合作：shanyue2k@proton.me\n')

out = sys.argv[1] if len(sys.argv) > 1 else 'README.md'
open(out, 'w').write('\n'.join(L))
print(out, len(rows), 'airports', collected, len('\n'.join(L).encode()), 'bytes')
