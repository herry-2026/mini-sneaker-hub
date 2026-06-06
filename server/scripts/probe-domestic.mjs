import axios from 'axios';
import * as cheerio from 'cheerio';
import { getProxyConfig } from '../utils/http.js';

const proxy = getProxyConfig();
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'text/html,application/json,*/*',
  'Accept-Language': 'zh-CN,zh;q=0.9',
};

async function fetchHtml(name, url) {
  const r = await axios.get(url, {
    headers,
    proxy: proxy || false,
    timeout: 30000,
    responseType: 'text',
  });
  const html = r.data;
  console.log(`\n=== ${name} status=${r.status} len=${html.length}`);

  const nextMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (nextMatch) {
    try {
      const data = JSON.parse(nextMatch[1]);
      console.log('__NEXT_DATA__ keys', Object.keys(data));
      console.log('page', data.page?.slice?.(0, 80) || data.page);
    } catch (e) {
      console.log('next parse fail', e.message);
    }
  }

  const $ = cheerio.load(html);
  const links = [];
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim();
    if (text.length > 8 && (href.includes('detail') || href.includes('product') || href.includes('goods') || href.includes('/p/'))) {
      links.push({ text: text.slice(0, 50), href });
    }
  });
  console.log('product-like links', links.length);
  console.log(JSON.stringify(links.slice(0, 5), null, 2));

  const scripts = [];
  $('script').each((_, el) => {
    const t = $(el).html() || '';
    if (t.includes('hot') || t.includes('rank') || t.includes('trend')) scripts.push(t.slice(0, 100));
  });
  console.log('hot/rank scripts', scripts.length);
}

await fetchHtml('shihuo', 'https://www.shihuo.cn/');
await fetchHtml('dewu', 'https://www.dewu.com/');
