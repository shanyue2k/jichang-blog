// JSON-LD 结构化数据，帮助 Bing / Google 理解页面类型
import { SITE } from '../site.config';
import { absoluteUrl, lastModified, postPath, type Airport, type Post } from './content';

type Crumb = { name: string; path: string };

const publisher = () => ({
  '@type': 'Organization',
  name: SITE.name,
  url: SITE.url,
  logo: { '@type': 'ImageObject', url: absoluteUrl('/favicon.svg') },
});

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: absoluteUrl('/'),
    inLanguage: SITE.locale,
    description: SITE.description,
    publisher: publisher(),
  };
}

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function articleSchema(post: Post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.data.title,
    description: post.data.description,
    datePublished: post.data.pubDate.toISOString(),
    dateModified: lastModified(post).toISOString(),
    inLanguage: SITE.locale,
    mainEntityOfPage: absoluteUrl(postPath(post)),
    author: { '@type': 'Person', name: SITE.author, url: absoluteUrl('/about/') },
    publisher: publisher(),
  };
}

export function reviewSchema(post: Post, airport: Airport) {
  const a = airport.data;
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: post.data.title,
    datePublished: post.data.pubDate.toISOString(),
    author: { '@type': 'Person', name: SITE.author },
    publisher: publisher(),
    reviewBody: post.data.description,
    reviewRating: { '@type': 'Rating', ratingValue: a.score, bestRating: 10, worstRating: 0 },
    positiveNotes: {
      '@type': 'ItemList',
      itemListElement: a.pros.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p })),
    },
    negativeNotes: {
      '@type': 'ItemList',
      itemListElement: a.cons.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c })),
    },
    itemReviewed: {
      '@type': 'Service',
      name: a.name,
      url: a.url,
      offers: { '@type': 'Offer', price: a.priceFrom, priceCurrency: 'CNY' },
    },
  };
}

export function itemListSchema(airports: Airport[], reviewPaths: Record<string, string>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '机场推荐榜单',
    numberOfItems: airports.length,
    itemListElement: airports.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: a.data.name,
      url: reviewPaths[a.id] ? absoluteUrl(reviewPaths[a.id]) : a.data.url,
    })),
  };
}

export function faqSchema(faq: { q: string; a: string }[]) {
  if (!faq.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
