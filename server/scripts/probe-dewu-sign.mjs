import axios from 'axios';
import { getProxyConfig } from '../utils/http.js';

const proxy = getProxyConfig();
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
};

const chunkUrl =
  'https://www.dewu.com/_next/static/chunks/main-56fb2041de3c0b949d65.js';
const js = (await axios.get(chunkUrl, { headers, proxy: proxy || false, timeout: 30000 })).data;

const patterns = ['newSign', 'sign:', 'SK', 'loginToken', 'uuid', 'timestamp', 'app.dewu.com'];
for (const p of patterns) {
  let idx = 0;
  let count = 0;
  while (count < 3) {
    idx = js.indexOf(p, idx);
    if (idx === -1) break;
    console.log(`\n[${p}]`, js.slice(Math.max(0, idx - 60), idx + 120).replace(/\n/g, ' '));
    idx += p.length;
    count += 1;
  }
}

// try poizon
const poizonUrls = [
  'https://www.poizon.com/',
  'https://www.poizon.com/trend',
  'https://www.poizon.com/rank',
];
for (const url of poizonUrls) {
  try {
    const r = await axios.get(url, { headers, proxy: proxy || false, timeout: 20000, validateStatus: () => true });
    console.log('\npoizon', url, r.status, (typeof r.data === 'string' ? r.data.length : JSON.stringify(r.data).length));
    if (typeof r.data === 'string' && r.data.includes('__NEXT_DATA__')) {
      const m = r.data.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (m) {
        const data = JSON.parse(m[1]);
        console.log('page', data.page, 'pageProps keys', Object.keys(data.props?.pageProps || {}));
      }
    }
  } catch (e) {
    console.log('poizon fail', url, e.message);
  }
}
