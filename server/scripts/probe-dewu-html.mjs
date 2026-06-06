import axios from 'axios';
import * as cheerio from 'cheerio';
import { getProxyConfig } from '../utils/http.js';

const proxy = getProxyConfig();
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
  Accept: 'text/html,*/*',
  'Accept-Language': 'zh-CN,zh;q=0.9',
};

const urls = [
  'https://www.dewu.com/',
  'https://www.dewu.com/search?keyword=%E7%90%83%E9%9E%8B',
  'https://www.dewu.com/product/Nike',
  'https://www.dewu.com/brand/Nike',
  'https://www.dewu.com/category/sneakers',
  'https://www.dewu.com/rank/sneakers',
  'https://www.dewu.com/trend/sneakers',
  'https://www.dewu.com/p/123456',
];

for (const url of urls) {
  try {
    const r = await axios.get(url, { headers, proxy: proxy || false, timeout: 20000, validateStatus: () => true });
    const html = r.data;
    console.log('\n', url, 'status', r.status, 'len', html.length);
    const patterns = ['__INITIAL', '__NUXT__', '__PRELOADED', 'productName', 'spuId', 'soldCount', 'hotValue'];
    for (const p of patterns) {
      if (html.includes(p)) console.log('  has', p, 'count', (html.match(new RegExp(p, 'g')) || []).length);
    }
    const $ = cheerio.load(html);
    const title = $('title').text();
    console.log('  title', title);
    const links = [];
    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      if (text.length > 5 && (href.includes('/product/') || href.includes('/p/'))) {
        links.push({ text: text.slice(0, 50), href });
      }
    });
    if (links.length) console.log('  links', JSON.stringify(links.slice(0, 5), null, 2));
  } catch (e) {
    console.log(url, 'fail', e.message);
  }
}
