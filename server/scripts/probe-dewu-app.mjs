import axios from 'axios';
import { getProxyConfig } from '../utils/http.js';
import fs from 'fs';

const proxy = getProxyConfig();
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  Referer: 'https://www.dewu.com/',
  Origin: 'https://www.dewu.com',
  'Content-Type': 'application/json',
  platform: 'pc',
  appVersion: '5.0.0',
};

const path = '/api/v1/h5/commodity-pick-interfaces/pc/pick-rule-result/feeds/info';
const bodies = [
  { pickRuleId: 1 },
  { pickRuleId: 2 },
  { pickRuleId: 3 },
  { pickRuleId: 4 },
  { pickRuleId: 5 },
  { pickRuleId: 6 },
  { pickRuleId: 7 },
  { pickRuleId: 8 },
  { pickRuleId: 9 },
  { pickRuleId: 10 },
  { pickRuleId: 11 },
  { pickRuleId: 12 },
  { pickRuleId: 13 },
  { pickRuleId: 14 },
  { pickRuleId: 15 },
  { pickRuleId: 16 },
  { pickRuleId: 17 },
  { pickRuleId: 18 },
  { pickRuleId: 19 },
  { pickRuleId: 20 },
  { pickRuleId: 21 },
  { pickRuleId: 22 },
  { pickRuleId: 23 },
  { pickRuleId: 24 },
  { pickRuleId: 25 },
  { pickRuleId: 26 },
  { pickRuleId: 27 },
  { pickRuleId: 28 },
  { pickRuleId: 29 },
  { pickRuleId: 30 },
  { pickRuleId: 31 },
  { pickRuleId: 32 },
  { pickRuleId: 33 },
  { pickRuleId: 34 },
  { pickRuleId: 35 },
  { pickRuleId: 36 },
  { pickRuleId: 37 },
  { pickRuleId: 38 },
  { pickRuleId: 39 },
  { pickRuleId: 40 },
  { pickRuleId: 41 },
  { pickRuleId: 42 },
  { pickRuleId: 43 },
  { pickRuleId: 44 },
  { pickRuleId: 45 },
  { pickRuleId: 46 },
  { pickRuleId: 47 },
  { pickRuleId: 48 },
  { pickRuleId: 49 },
  { pickRuleId: 50 },
];

for (const body of bodies) {
  try {
    const r = await axios.post(`https://app.dewu.com${path}`, body, {
      headers,
      proxy: proxy || false,
      timeout: 20000,
      validateStatus: () => true,
    });
    if (r.data?.code === 200 || (r.data?.data && r.status === 200)) {
      console.log('SUCCESS pickRuleId', body.pickRuleId, JSON.stringify(r.data).slice(0, 1000));
      fs.writeFileSync('scripts/dewu-success.json', JSON.stringify(r.data, null, 2));
      break;
    }
    if (r.data?.code && r.data.code !== 404) {
      console.log('pickRuleId', body.pickRuleId, 'code', r.data.code, r.data.msg);
    }
  } catch (e) {
    console.log('fail', body.pickRuleId, e.message);
  }
}

// download index chunk for pickRuleId references
const js = (
  await axios.get(
    'https://www.dewu.com/_next/static/chunks/pages/index-a0e5b7ca69d461b55b68.js',
    { headers, proxy: proxy || false, timeout: 20000 },
  )
).data;
const ids = [...js.matchAll(/pickRuleId[\":\s]+(\d+)/g)].map((m) => m[1]);
console.log('pickRuleIds in JS', [...new Set(ids)]);
