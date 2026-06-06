import axios from 'axios';
import { getProxyConfig } from '../utils/http.js';

const proxy = getProxyConfig();
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
  Accept: 'text/html,*/*',
};

const urls = [
  'https://www.dewu.com/product-detail.html?sourceName=pc&spuId=1000&skuId=0',
  'https://www.dewu.com/product-detail.html?sourceName=pcindex&spuId=134&skuId=0',
  'https://www.dewu.com/product-detail.html?sourceName=pc&spuId=1000123456&propertyValueId=0&skuId=0',
];

for (const url of urls) {
  const r = await axios.get(url, { headers, proxy: proxy || false, timeout: 20000, validateStatus: () => true });
  const html = r.data;
  console.log('\n', url, 'status', r.status, 'len', html.length);
  const next = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (next) {
    const data = JSON.parse(next[1]);
    console.log('page', data.page, 'pageProps', JSON.stringify(data.props?.pageProps || {}).slice(0, 500));
  }
  for (const k of ['title', 'spuId', 'soldCount', 'productName', 'price']) {
    if (html.includes(k)) console.log(' has', k);
  }
}
