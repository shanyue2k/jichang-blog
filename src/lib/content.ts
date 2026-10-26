import { getCollection, getEntries, getEntry, type CollectionEntry } from 'astro:content';
import { SECTION_KEYS, SECTIONS, SITE, type SectionKey } from '../site.config';

export type Airport = CollectionEntry<'airports'>;
export type Post = CollectionEntry<SectionKey>;

/** 正式构建时隐藏草稿，本地 dev 时显示 */
const visible = ({ data }: { data: { draft: boolean } }) => !(import.meta.env.PROD && data.draft);

const byDate = (a: Post, b: Post) => lastModified(b).getTime() - lastModified(a).getTime();

export function lastModified(post: Post): Date {
  return post.data.updatedDate ?? post.data.pubDate;
}

export async function getPosts(section: SectionKey): Promise<Post[]> {
  const posts = (await getCollection(section, visible as never)) as Post[];
  return posts.sort(byDate);
}

export async function getAllPosts(): Promise<Post[]> {
  const lists = await Promise.all(SECTION_KEYS.map((key) => getPosts(key)));
  return lists.flat().sort(byDate);
}

export function postPath(post: Post): string {
  return `/${post.collection}/${post.id}/`;
}

export function sectionPath(section: SectionKey): string {
  return `/${section}/`;
}

export function sectionLabel(section: SectionKey): string {
  return SECTIONS[section].label;
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).href;
}

/** 榜单：按名次排序，rank 为 0 的不上榜 */
export async function getRankedAirports(): Promise<Airport[]> {
  const all = await getCollection('airports');
  return all.filter((a) => a.data.rank > 0).sort((a, b) => a.data.rank - b.data.rank);
}

/** 评测/对比文章关联的机场 */
export async function getPostAirports(post: Post): Promise<Airport[]> {
  if (post.collection === 'pingce') {
    const one = await getEntry((post as CollectionEntry<'pingce'>).data.airport);
    return one ? [one] : [];
  }
  if (post.collection === 'duibi') {
    return getEntries((post as CollectionEntry<'duibi'>).data.airports);
  }
  return [];
}

/** 找到某家机场的评测文章（用于榜单跳转） */
export async function getReviewFor(airportId: string): Promise<Post | undefined> {
  const reviews = await getPosts('pingce');
  return reviews.find((r) => (r as CollectionEntry<'pingce'>).data.airport.id === airportId);
}

/** 含示例数据的页面不应被收录 */
export function hasSample(airports: Airport[]): boolean {
  return airports.some((a) => a.data.sample);
}
