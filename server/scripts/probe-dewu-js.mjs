import axios from 'axios';
import { getProxyConfig } from '../utils/http.js';

const proxy = getProxyConfig();
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
};

const html = (
  await axios.get('https://www.dewu.com/', { headers, proxy: proxy || false, timeout: 20000 })
).data;

const chunkPaths = [...html.matchAll(/\/_next\/static\/chunks\/[^"]+\.js/g)].map((m) => m[0]);
console.log('chunks', chunkPaths.length);

const keywords = ['fire/search', 'pick-rule', 'hotWords', 'productName', 'rankList', 'trend'];
for (const path of chunkPaths.slice(0, 12)) {
  const url = `https://www.dewu.com${path}`;
  try {
    const r = await axios.get(url, { headers, proxy: proxy || false, timeout: 20000 });
    const js = r.data;
    const hits = keywords.filter((k) => js.includes(k));
    if (hits.length) {
      console.log('\n', path, 'hits', hits);
      for (const k of hits) {
        const idx = js.indexOf(k);
        console.log('  context:', js.slice(Math.max(0, idx - 80), idx + 120).replace(/\n/g, ' '));
      }
    }
  } catch (e) {
    console.log(path, 'fail', e.message);
  }
}
