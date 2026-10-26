# 机场测评博客

用 Astro 搭建的纯静态机场测评站：机场推荐榜、单家评测、横向对比、客户端教程、文章。

## 本地运行

需要 Node.js 20.3 以上。

```bash
npm install
npm run dev      # 本地预览 http://localhost:4321
npm run build    # 生成 dist/
```

## 买好域名后要改的地方

只改一个文件：`src/site.config.ts`

1. `url` 改成 `https://你的域名`（结尾不要 `/`）
2. `name` 改成站点名
3. 拿到 Bing / Google 站长验证码后填进 `verification`

推送后 Cloudflare Pages 会自动重新部署。

## 部署到 Cloudflare Pages

1. Cloudflare 控制台 → Workers 和 Pages → 创建 → Pages → 连接到 Git，选这个仓库
2. 框架预设选 **Astro**；构建命令 `npm run build`；输出目录 `dist`
3. 环境变量加 `NODE_VERSION` = `22`
4. 部署完成后，在「自定义域」里绑定买好的域名

## 写内容

### 机场数据：`src/data/airports.json`

所有机场的价格、线路、解锁、评分、优缺点都写在这里，是全站唯一的数据源。榜单、首页航班牌、评测页登机牌、对比表都自动从这里读取。

- `rank`：榜单名次，1 最靠前；填 0 就不上榜
- `status`：只能是 `稳定`、`观察中`、`不推荐`
- `testedAt`：最近实测日期，榜单的「最后更新」取的是所有机场里最新的这个日期
- `sample`：示例数据标记。**为 true 的机场相关页面会显示提示、设置 noindex、不进 sitemap**。换成真实数据后删掉这一行

### 文章：`src/content/<栏目>/文件名.md`

文件名就是网址，例如 `src/content/pingce/abc-jichang-pingce.md` → `/pingce/abc-jichang-pingce/`。文件名用小写拼音或英文加连字符。

| 栏目 | 文件夹 | 额外字段 |
| --- | --- | --- |
| 机场评测 | `pingce` | `airport: 机场id` |
| 机场对比 | `duibi` | `airports: [id1, id2]` |
| 客户端教程 | `jiaocheng` | `platforms: [Windows, macOS]` |
| 文章 | `wenzhang` | 无 |

所有文章都需要：

```yaml
title: 标题（含关键词）
description: 搜索结果里显示的摘要，60–120 字
pubDate: 2026-10-26
updatedDate: 2026-11-20   # 有实质更新时再加，会显示「最后更新」
draft: true               # 可选，草稿只在本地 dev 显示
faq:                      # 可选，会生成常见问题和 FAQ 结构化数据
  - q: 问题
    a: 回答
```

## SEO 已做的事

- 每页独立 title / description / canonical，Open Graph
- 结构化数据：WebSite、BreadcrumbList、BlogPosting、Review（评测页带评分）、ItemList（榜单）、FAQPage
- 自动生成 `sitemap.xml`（带准确的 lastmod）、`robots.txt`、`rss.xml`
- 示例数据页面、空栏目自动 noindex，避免低质量页面拖累整站收录
- 不生成标签页、分页等薄内容页面
- 推广链接自动加 `rel="sponsored nofollow"`
- IndexNow：部署后运行 `npm run indexnow`，把全站网址推给 Bing

## 上线后

1. Bing Webmaster Tools 添加站点（可以直接从 Google Search Console 导入），提交 `https://你的域名/sitemap.xml`
2. 每次发布或更新文章后运行一次 `npm run indexnow`
