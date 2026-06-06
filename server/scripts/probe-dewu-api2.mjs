import axios from 'axios';
import { getProxyConfig } from '../utils/http.js';

const proxy = getProxyConfig();
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  Referer: 'https://www.dewu.com/',
  Origin: 'https://www.dewu.com',
  'Content-Type': 'application/json',
};

const base = 'https://www.dewu.com';
const paths = [
  '/api/v1/h5/commodity-pick-interfaces/pc/pick-rule-result/feeds/info',
  '/api/v1/h5/commodity-pick-interfaces/pc/pick-rule-result/feeds/list',
  '/api/v1/h5/commodity-pick-interfaces/pc/pick-rule-result/list',
];

const bodies = [
  {},
  { pickRuleId: 1 },
  { pickRuleId: '1' },
  { pickRuleId: 1, page: 1, pageSize: 20 },
  { pickRuleId: 1, lastId: '' },
  { tabId: 1 },
  { ruleId: 1 },
];

for (const path of paths) {
  for (const body of bodies) {
    try {
      const r = await axios.post(`${base}${path}`, body, {
        headers,
        proxy: proxy || false,
        timeout: 20000,
        validateStatus: () => true,
      });
      const preview = JSON.stringify(r.data).slice(0, 800);
      if (r.status !== 404 && !preview.includes('前方拥挤')) {
        console.log(`\nPOST ${path}`, JSON.stringify(body));
        console.log('status', r.status, preview);
      }
    } catch (e) {
      // ignore
    }
  }
}

// GET variants
for (const path of paths) {
  for (const qs of ['?pickRuleId=1', '?pickRuleId=1&page=1', '']) {
    try {
      const r = await axios.get(`${base}${path}${qs}`, {
        headers,
        proxy: proxy || false,
        timeout: 20000,
        validateStatus: () => true,
      });
      const preview = JSON.stringify(r.data).slice(0, 800);
      if (typeof r.data === 'object' && r.data.code !== 404) {
        console.log(`\nGET ${path}${qs}`);
        console.log('status', r.status, preview);
      }
    } catch (e) {
      // ignore
    }
  }
}
