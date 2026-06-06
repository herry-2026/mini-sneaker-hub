import axios from 'axios';
import { getProxyConfig } from '../utils/http.js';

const proxy = getProxyConfig();
const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36' };

const html = (await axios.get('https://www.dewu.com/', { headers, proxy: proxy || false })).data;
const chunks = [...new Set([...html.matchAll(/\/_next\/static\/chunks\/[^"']+\.js/g)].map((m) => m[0]))];
console.log('chunks', chunks.length);

for (const c of chunks) {
  const js = (await axios.get(`https://www.dewu.com${c}`, { headers, proxy: proxy || false })).data;
  if (js.includes('newSign') || js.includes('rW1U:') || js.includes('"rW1U"')) {
    console.log('SIGN CHUNK', c, 'len', js.length);
    const idx = js.indexOf('newSign');
    if (idx > -1) console.log(js.slice(Math.max(0, idx - 100), idx + 200));
  }
}
