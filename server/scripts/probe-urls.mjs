import axios from 'axios';
import { getProxyConfig } from '../utils/http.js';

const proxy = getProxyConfig();
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
  Accept: 'text/html,application/json,*/*',
  'Accept-Language': 'zh-CN,zh;q=0.9',
};

function parseNext(html) {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  const data = JSON.parse(m[1]);
  const list = data?.props?.pageProps?.data?.data?.list;
  return { page: data.page, listLen: list?.length, list };
}

const shihuoUrls = [
  'https://www.shihuo.cn/',
  'https://www.shihuo.cn/sports',
  'https://www.shihuo.cn/sports/shoes',
  'https://www.shihuo.cn/page/pcChannel?rootCategoryId=8',
  'https://www.shihuo.cn/page/pcRank?categoryId=8',
];
for (const url of shihuoUrls) {
  try {
    const r = await axios.get(url, { headers, proxy: proxy || false, timeout: 20000, validateStatus: () => true });
    const parsed = typeof r.data === 'string' ? parseNext(r.data) : null;
    console.log(url, 'status', r.status, 'page', parsed?.page, 'list', parsed?.listLen);
    if (parsed?.list) {
      const shoes = parsed.list.filter((i) => i.root_category_id === 8);
      console.log('  shoes', shoes.length, 'sample', shoes[0]?.title?.slice(0, 40));
    }
  } catch (e) {
    console.log(url, 'fail', e.message);
  }
}

const dewuUrls = [
  'https://www.dewu.com/',
  'https://www.dewu.com/product',
  'https://www.dewu.com/trend',
  'https://www.dewu.com/rank',
  'https://m.dewu.com/',
  'https://m.dewu.com/rank',
  'https://m.dewu.com/trend',
];
for (const url of dewuUrls) {
  try {
    const r = await axios.get(url, { headers, proxy: proxy || false, timeout: 20000, validateStatus: () => true });
    const html = typeof r.data === 'string' ? r.data : '';
    const next = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    const links = (html.match(/href="[^"]*product[^"]*"/gi) || []).slice(0, 3);
    console.log(url, 'status', r.status, 'len', html.length, 'next', !!next, 'product links', links.length);
    if (next) {
      const data = JSON.parse(next[1]);
      console.log('  page', data.page, 'keys', Object.keys(data.props?.pageProps || {}));
    }
    const apiMatch = html.match(/"productName"/g);
    console.log('  productName count', apiMatch?.length || 0);
  } catch (e) {
    console.log(url, 'fail', e.message);
  }
}
