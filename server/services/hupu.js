import axios from 'axios';
import * as cheerio from 'cheerio';
import { getProxyConfig } from '../utils/http.js';

const PAGE_URL = 'https://bbs.hupu.com/all-gcj';
const BASE_URL = 'https://bbs.hupu.com';
const MAX_ITEMS = 10;

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
};

function resolveUrl(href) {
  if (!href) return '';
  if (href.startsWith('http')) return href;
  return `${BASE_URL}${href.startsWith('/') ? href : `/${href}`}`;
}

function parseReplyCount(text) {
  const match = text.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function parsePosts(html) {
  const $ = cheerio.load(html);
  const posts = [];

  $('.list-item').each((_, el) => {
    const item = $(el);
    const linkEl = item.find('.t-info a').first();
    const title = item.find('.t-title').text().trim() || linkEl.text().trim();
    const href = linkEl.attr('href');
    const repliesText = item.find('.t-replies').text().trim();

    if (!title || !href) return;

    posts.push({
      title,
      url: resolveUrl(href),
      reply_count: parseReplyCount(repliesText),
    });
  });

  return posts;
}

/**
 * 抓取虎扑装备区热帖
 * @returns {Promise<Array<{ rank: number, title: string, url: string, heat: string }>>}
 */
export async function fetchHupuHot() {
  const proxy = getProxyConfig();
  const response = await axios.get(PAGE_URL, {
    headers: BROWSER_HEADERS,
    timeout: 30000,
    responseType: 'text',
    proxy: proxy || false,
  });

  const posts = parsePosts(response.data);
  if (posts.length === 0) {
    throw new Error('未解析到虎扑帖子列表');
  }

  return posts
    .sort((a, b) => b.reply_count - a.reply_count)
    .slice(0, MAX_ITEMS)
    .map((post, index) => ({
      rank: index + 1,
      title: post.title,
      url: post.url,
      heat: `${post.reply_count}回复`,
    }));
}
