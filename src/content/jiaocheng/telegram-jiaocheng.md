---
title: Telegram 连不上、收不到验证码、怎么设置中文？电报下载与使用教程
description: 国内用 Telegram（电报）最常遇到的问题一次讲清：去哪里下载才安全、一直转圈连不上怎么设置代理、+86 收不到验证码怎么办、怎么把界面改成简体中文，附 Windows、macOS、iPhone、安卓的具体操作。
pubDate: 2026-11-06
platforms:
  - Windows
  - macOS
  - iPhone
  - Android
faq:
  - q: Telegram 是免费的吗？
    a: 是的，Telegram 本身完全免费，官网和各大应用商店都能下载。付费的 Telegram Premium 只是增加一些额外功能，不买也能正常聊天、看频道。在国内使用需要另外准备机场（梯子），这部分是要付费的。
  - q: 为什么 Telegram 一直显示"连接中"或"Connecting"？
    a: 因为 Telegram 的服务器在国内无法直接访问。需要先打开机场客户端，并确认 Telegram 的流量走了代理：手机上开着小火箭或 Clash 一般就能用；电脑版要检查 Telegram 的代理设置是不是"使用系统代理"，或者打开客户端的 TUN 模式。
  - q: +86 手机号收不到 Telegram 验证码怎么办？
    a: 先看验证码是不是发到了你已经登录 Telegram 的其他设备上；没有其他设备的话，等倒计时结束选择用短信或电话接收。不要短时间内反复点"重新发送"，否则号码可能被暂时限制，通常要等几小时到一天。
  - q: Telegram 有官方简体中文吗？
    a: 官方客户端的语言列表里没有简体中文，界面默认是英文。可以通过 Telegram 翻译平台上由用户维护的简体中文语言包切换，点开语言包链接、确认即可，不需要下载任何"中文版"安装包。
  - q: 网上的"Telegram 中文版"安全吗？
    a: 不建议下载。这类安装包不是 Telegram 官方发布的，曾多次被发现夹带木马、盗取账号。请只从 telegram.org、desktop.telegram.org 或官方应用商店下载，中文界面用语言包设置就行。
  - q: 用 Telegram 要买多少流量？
    a: 文字聊天和看频道消耗的流量很少。经常看频道里的视频、下载大文件的话流量会多一些，每月 100GB 左右的机场套餐一般足够。
---

Telegram（国内常叫"电报""纸飞机"）是很多人用来看频道、进群交流的聊天软件。但在国内用 Telegram，几乎每个人都会卡在同几个地方：**装好了一直转圈连不上**、**手机号收不到验证码**、**界面全是英文**。

这篇按顺序把这几件事讲清楚：**安全下载 → 让 Telegram 连上网 → 注册登录 → 改成中文 → 常见问题**。照着做，一般十几分钟就能用上。

## 先说清楚：在国内用 Telegram 需要什么

Telegram 的服务器在国内无法直接连接，所以除了 Telegram 本身，你还需要：

| 需要的东西 | 作用 | 去哪里找 |
| --- | --- | --- |
| Telegram 客户端 | 聊天软件本身，免费 | 官网或官方应用商店，见下一节 |
| 机场（梯子） | 让 Telegram 能连上服务器 | [机场推荐榜](/jichang-tuijian/)、[梯子推荐](/tizi-tuijian/) |
| 代理客户端 | 导入机场订阅、连接节点 | 电脑用 [Clash Verge Rev](/jiaocheng/clash-verge-rev-jiaocheng/) 或 [v2rayN](/jiaocheng/v2rayn-jiaocheng/)，iPhone 用 [Shadowrocket](/jiaocheng/shadowrocket-jiaocheng/)，安卓用 [Clash Meta for Android](/jiaocheng/clash-meta-for-android-jiaocheng/) |
| 一个能收短信的手机号 | 注册账号 | 国内手机号（+86）可以注册 |

Telegram 本身不吃流量，只是文字聊天的话，最便宜的机场套餐就够用。

## 第一步：从官方渠道下载 Telegram

搜"telegram 下载"会出来很多"Telegram 中文版""电报中文版"的网站，**不要从这些网站下载**。它们不是官方发布的，曾经多次被发现夹带木马、盗取账号和钱包。官方客户端完全免费，中文界面用语言包就能设置（见第四步），根本不需要所谓的中文版。

| 设备 | 官方下载渠道 |
| --- | --- |
| Windows / macOS / Linux | desktop.telegram.org（macOS 也可以在 Mac App Store 下载） |
| iPhone / iPad | App Store。**国区 App Store 搜不到**，需要切换到外区 Apple ID，方法见 [外区 Apple ID 注册教程](/jiaocheng/waiqu-apple-id-zhuce/) |
| 安卓 | Google Play；没有 Google Play 的手机，到 telegram.org/android 下载官方 APK |
| 网页版 | web.telegram.org，不用安装，打开浏览器就能用 |

> 判断方法：网址必须是 telegram.org 或它的子域名（desktop.telegram.org、web.telegram.org），或者是官方应用商店。其他域名一律不要信。

注意：打开这些网址本身也需要先连上机场，所以建议先把下一步的代理设置好再下载。

## 第二步：让 Telegram 连上网（解决一直转圈）

装好 Telegram 后，如果顶部一直显示 **Connecting / 连接中 / Updating**，说明 Telegram 没有走代理。按你的设备处理：

### iPhone：开着小火箭就行

Shadowrocket 打开后相当于手机级别的 VPN，Telegram 的流量会自动走代理。

1. 打开小火箭，顶部开关打开，选一个能连通的节点。
2. "全局路由"保持 **配置**（规则模式）即可。
3. 回到 Telegram，下拉刷新，几秒内就会连上。

还是连不上的话，把全局路由临时切到"代理"试试；能连上就说明是规则没覆盖 Telegram，更新一下小火箭的配置或机场订阅。

### 安卓：确认 Clash 开的是 VPN 模式

Clash Meta for Android 默认以 VPN 方式接管全部 App 的流量。

1. 打开 Clash Meta，点"已停止"启动，选好节点。
2. 如果在设置里开过"访问控制"（只让部分 App 走代理），记得把 Telegram 加进去。
3. 回到 Telegram 等几秒即可。

### Windows / macOS：检查 Telegram 的代理设置

电脑版最容易出问题，因为 Clash Verge Rev、v2rayN 打开的"系统代理"，不一定会被 Telegram 用上。有三种解决办法，任选一种：

**办法一：让 Telegram 使用系统代理（最简单）**

1. 先在 Clash Verge Rev 或 v2rayN 里打开系统代理。
2. 打开 Telegram：Settings（设置）→ Advanced（高级）→ Connection type（连接类型）。
3. 选择 **Use system proxy settings（使用系统代理）**。

**办法二：在 Telegram 里手动填代理**

还是不行的话，在同一个位置选 **Use custom proxy（使用自定义代理）**，添加一个代理：

- 类型：SOCKS5
- 服务器：`127.0.0.1`
- 端口：你的代理客户端的本地端口。常见默认值是 Clash Verge Rev `7897`、v2rayN `10808`，以软件设置里显示的为准

保存后左下角显示已连接即可。

**办法三：打开代理客户端的 TUN 模式**

Clash Verge Rev 设置里打开 **TUN 模式**（也叫虚拟网卡模式），电脑上所有软件的流量都会被接管，Telegram 不用做任何设置。第一次打开可能要授权安装服务，按提示操作即可。

### 换了设置还是连不上

- 在代理客户端里测一下延迟，换一个节点。香港、日本、新加坡节点都可以用。
- 更新一次机场订阅，确认套餐没过期、流量没用完。
- 其他国外网站能打开、唯独 Telegram 不行，多半是规则问题，用上面的"全局"或 TUN 模式验证。

## 第三步：注册和登录（解决收不到验证码）

连上网之后，用手机号注册：选择国家 **China (+86)**，输入手机号，点 Next。

### 验证码去哪了

Telegram 发验证码有固定的顺序，很多人收不到其实是没找对地方：

1. **已经登录过 Telegram 的其他设备**：如果你在别的手机、电脑上登录过这个号，验证码会先以一条 Telegram 消息发到那里，而不是短信。
2. **短信或电话**：没有其他设备时，等页面倒计时结束，点 "Didn't get the code?"（没收到验证码？），选择通过短信（SMS）或电话（Call）接收。
3. **登录邮箱**：如果之前给账号设置过登录邮箱，验证码可能发到邮箱。

### 一直收不到短信怎么办

国内运营商对国际短信有拦截，+86 号码收不到 Telegram 短信的情况比较常见，按顺序试：

- **检查手机的骚扰拦截**：很多手机会把国际短信放进"骚扰拦截"或"垃圾短信"，去那里找找。
- **选电话接收**：倒计时结束后选择电话，Telegram 会打电话念出验证码。确认手机没有拦截国际来电。
- **别反复点重新发送**：短时间内请求太多次，号码会被暂时限制（提示 Too many attempts 或 FLOOD），通常要等几小时到一天才恢复。越急越点，等得越久。
- **换个时间、换个节点再试**：隔几个小时，换一个其他地区的节点重新请求。
- **换一个手机号**：同一运营商的不同号码，收不收得到也不一样。

> 不建议用网上的"接码平台"、临时号码注册。号码被回收后别人可以用它登录你的账号，换手机时你也收不到验证码，账号很容易丢。

### 注册成功后，先做两件事

- **设置两步验证**：Settings → Privacy and Security → Two-Step Verification，设置一个密码。以后即使有人拿到你的短信验证码，也登录不了。
- **设置登录邮箱**：同一页面里可以绑定邮箱，以后换手机或收不到短信时多一个登录方式。

## 第四步：把界面改成简体中文

Telegram 官方的语言列表里**没有简体中文**，默认是英文。改中文不需要下载任何"中文版"，用语言包切换就行：

1. 确认 Telegram 已经能正常连接。
2. 在手机或电脑上，用浏览器或在 Telegram 里点开简体中文语言包链接，例如 `t.me/setlanguage/classic-zh-cn`。
3. 弹出提示后点 **Change（更换）**，界面马上变成中文。电脑版可能会自动重启一次。

几点说明：

- 语言包是 Telegram 翻译平台（translations.telegram.org）上由用户维护的，不是官方翻译，个别新功能可能还是英文。
- 某个语言包链接失效的话，到翻译平台搜索 Chinese (Simplified)，选一个还在更新的即可。
- 想改回英文：设置 → 语言（Language）→ 选 English。

外文频道看不懂的话，在设置 → 语言里打开"显示翻译按钮"，长按消息就能翻译成中文；整个对话自动翻译是 Telegram Premium 的功能。

## 第五步：开始使用

- **搜索频道和群组**：顶部搜索框输入名字或 @用户名。也可以直接点开 t.me/xxx 这样的链接加入。
- **防骚扰**：设置 → 隐私与安全 → 电话号码，把"谁可以看到我的手机号"改成"没有人"，并设置一个用户名，别人用用户名就能找到你。
- **注意诈骗**：Telegram 上冒充客服、"官方"、投资带单的骗子很多。Telegram 官方不会私信你要验证码或密码，遇到这种消息直接删除。

本站也有 Telegram 频道，每月更新机场榜单、涨价和优惠信息：[t.me/jichanghao](https://t.me/jichanghao)，交流群 [t.me/jichanghaoqun](https://t.me/jichanghaoqun)。

## 常见问题速查

| 问题 | 原因 | 怎么办 |
| --- | --- | --- |
| 一直显示 Connecting | Telegram 没走代理 | 手机开着代理客户端；电脑设置"使用系统代理"、自定义 SOCKS5 或开 TUN |
| 能连上，但图片视频加载慢 | 节点慢或晚高峰拥堵 | 换节点；晚上用的多建议选 [IPLC / IEPL 专线机场](/zhuanxian-jichang/) |
| 收不到验证码 | 发到了其他设备，或短信被拦截 | 先看其他设备和骚扰拦截，再选短信 / 电话，别频繁重发 |
| 提示 Too many attempts | 请求验证码太频繁 | 等几小时到一天再试 |
| 界面是英文 | 官方没有简体中文 | 用 t.me/setlanguage/ 开头的简体中文语言包 |
| 国区 App Store 搜不到 | 国区没有上架 | 用 [外区 Apple ID](/jiaocheng/waiqu-apple-id-zhuce/) 下载 |

## 小结

在国内用 Telegram，关键就三件事：**从官方渠道下载**、**确保 Telegram 的流量走了代理**、**验证码别着急反复点**。中文界面用语言包一键切换。

还没有机场的话，可以从 [机场推荐榜](/jichang-tuijian/) 里挑一家，先买最便宜的月付试用；想比较价格，见 [便宜机场推荐](/pianyi-jichang/) 和 [机场优惠码](/jichang-youhuima/)。
