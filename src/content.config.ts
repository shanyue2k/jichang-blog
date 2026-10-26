import { defineCollection, reference, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

/**
 * 机场数据：全站唯一数据源。
 * 榜单页、首页航班牌、评测页登机牌、对比表都从这里读，改一处全站同步。
 */
const airports = defineCollection({
  loader: file('src/data/airports.json'),
  schema: z.object({
    name: z.string(),
    /** 购买/注册链接（推广链接也放这里，页面会自动加 rel="sponsored nofollow"） */
    url: z.string().url(),
    /** 榜单名次，1 最靠前；不想上榜填 0 */
    rank: z.number().int().min(0),
    /** 综合评分，满分 10 */
    score: z.number().min(0).max(10),
    /** 最低月付价格（元/月） */
    priceFrom: z.number().min(0),
    /** 价格说明，例如「年付折合」 */
    priceNote: z.string().optional(),
    trial: z.boolean().default(false),
    protocols: z.array(z.string()),
    /** 线路类型，如「IEPL 专线」「中转」「直连」 */
    lineType: z.string(),
    nodeCount: z.number().int().min(0),
    regions: z.array(z.string()),
    unlock: z.object({
      netflix: z.boolean(),
      disney: z.boolean(),
      chatgpt: z.boolean(),
    }),
    /** 当前状态：稳定 / 观察中 / 不推荐 */
    status: z.enum(['稳定', '观察中', '不推荐']),
    /** 一句话点评，用在航班牌和榜单 */
    tagline: z.string(),
    bestFor: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    /** 最近一次实测日期 */
    testedAt: z.coerce.date(),
    /** 示例数据标记：为 true 时相关页面会显示提示并设为 noindex，不会被收录 */
    sample: z.boolean().default(false),
  }),
});

const faq = z.array(z.object({ q: z.string(), a: z.string() })).default([]);

const base = z.object({
  title: z.string(),
  /** 搜索结果里显示的摘要，建议 60–120 个汉字 */
  description: z.string().max(200),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  faq,
});

const pingce = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pingce' }),
  schema: base.extend({ airport: reference('airports') }),
});

const duibi = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/duibi' }),
  schema: base.extend({ airports: z.array(reference('airports')).min(2) }),
});

const jiaocheng = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/jiaocheng' }),
  schema: base.extend({
    /** 适用平台，例如 ['Windows', 'macOS'] */
    platforms: z.array(z.string()).default([]),
  }),
});

const wenzhang = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/wenzhang' }),
  schema: base,
});

export const collections = { airports, pingce, duibi, jiaocheng, wenzhang };
