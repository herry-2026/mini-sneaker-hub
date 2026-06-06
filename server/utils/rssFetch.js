import Parser from 'rss-parser';
import { createHttpClient } from './http.js';

const http = createHttpClient();
const parser = new Parser();
const MAX_ITEMS = 10;

export function decodeHtml(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '');
}

export function mapItems(items) {
  return items.slice(0, MAX_ITEMS).map((item, index) => ({
    rank: index + 1,
    title: item.title,
    url: item.url,
  }));
}

async function fetchFromRss(rssUrl) {
  const response = await http.get(rssUrl, {
    headers: { Accept: 'application/rss+xml, application/xml, text/xml, */*' },
    responseType: 'text',
    timeout: 30000,
  });
  const feed = await parser.parseString(response.data);
  const items = (feed.items ?? []).map((item) => ({
    title: item.title,
    url: item.link,
  }));
  return mapItems(items);
}

async function fetchFromWordPressApi(wpApiUrl) {
  const response = await http.get(wpApiUrl, {
    headers: { Accept: 'application/json' },
    timeout: 30000,
  });
  const posts = response.data;
  const items = posts.map((post) => ({
    title: decodeHtml(post.title?.rendered ?? ''),
    url: post.link,
  }));
  return mapItems(items);
}

/**
 * 优先 RSS，失败则降级 WordPress REST API
 */
export async function fetchWithRssFallback({ rssUrl, wpApiUrl, label }) {
  try {
    return await fetchFromRss(rssUrl);
  } catch (rssError) {
    console.warn(
      `[${label}] RSS failed (${rssError.message}), trying WordPress API`,
    );
    return fetchFromWordPressApi(wpApiUrl);
  }
}
