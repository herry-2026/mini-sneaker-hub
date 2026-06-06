import axios from 'axios';
import { getProxyConfig } from '../utils/http.js';

const proxy = getProxyConfig();
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
};

const html = (
  await axios.get('https://www.poizon.com/', { headers, proxy: proxy || false, timeout: 30000 })
).data;
const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
if (!m) {
  console.log('no next data');
  process.exit(0);
}
const data = JSON.parse(m[1]);
const homeInfo = data.props?.pageProps?.homeInfo;
console.log('homeInfo keys', Object.keys(homeInfo || {}));
console.log(JSON.stringify(homeInfo, null, 2).slice(0, 4000));
