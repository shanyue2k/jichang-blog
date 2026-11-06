// ============================================================
// 全站配置：买好域名后只需要改这个文件里的 url（和 name）。
// ============================================================

export const SITE = {
  /** 正式域名，必须带 https:// ，结尾不要加 / */
  url: 'https://jichanghao.com',
  /** 站点名称，会出现在标题、页脚、结构化数据里 */
  name: '机场好',
  /** 首页 <title>，围绕核心关键词「机场推荐」 */
  homeTitle: '机场推荐 2026：主流机场套餐价格、节点与线路对比',
  description:
    '整理主流机场的官网套餐价格、节点数量、线路和协议，每月更新机场推荐榜，并提供 Clash、Shadowrocket 等客户端使用教程。',
  locale: 'zh-CN',
  author: '站长',
  /** IndexNow 密钥（Bing 即时收录用），换不换都可以，保持 32 位十六进制即可 */
  indexNowKey: 'fd5439ecec0adee02208cdb4622c3515',
  /** Telegram 频道与交流群 */
  telegram: {
    channel: 'https://t.me/jichanghao',
    group: 'https://t.me/jichanghaoqun',
  },
  /** Cloudflare Web Analytics 统计 token（公开值，留空则不加载统计脚本） */
  cfAnalyticsToken: '8b6dae5260044215a6bc92d6ee8adbe3',
  /** 站长平台验证码：在 Bing Webmaster / Google Search Console 拿到后填进来 */
  verification: {
    bing: '',
    google: '',
  },
};

/** 域名还是占位的 xxx.com 时，全站禁止收录，防止预览站被搜索引擎抓取 */
export const IS_PLACEHOLDER_DOMAIN = SITE.url.includes('xxx.com');

/** 四个内容栏目。key 同时是网址路径和 src/content 下的文件夹名 */
export const SECTIONS = {
  pingce: {
    label: '机场实测',
    title: '机场实测：站长用自己的订阅测过的机场',
    description: '站长用自己购买的订阅实际测过的机场：各地区速度、延迟和流媒体解锁结果，附测试日期、环境和原始截图。',
  },
  duibi: {
    label: '机场对比',
    title: '机场对比：同价位机场横向比较',
    description: '把价格、节点、协议和实测速度放在一张表里，帮你在几家机场之间做决定。',
  },
  jiaocheng: {
    label: '客户端教程',
    title: '客户端教程：Clash、Shadowrocket 等导入订阅与设置',
    description: '各平台代理客户端的下载、导入订阅、分流规则与常见问题处理教程。',
  },
  wenzhang: {
    label: '文章',
    title: '文章：机场入门知识与选购经验',
    description: '机场相关的基础概念、协议科普、选购避坑经验。',
  },
} as const;

export type SectionKey = keyof typeof SECTIONS;
export const SECTION_KEYS = Object.keys(SECTIONS) as SectionKey[];

/** 核心榜单页（承接「机场推荐」关键词） */
export const PILLAR = {
  path: '/jichang-tuijian/',
  label: '机场推荐',
};
