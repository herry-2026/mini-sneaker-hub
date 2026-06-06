import crypto from 'crypto';
import axios from 'axios';
import { getProxyConfig } from '../utils/http.js';

const SALT = '048a9c4943398714b356a696503d2d36';

function buildSignString(params) {
  if (!params) return '';
  return Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      let value = params[key];
      if (value === undefined) return acc;
      if (Number.isNaN(value)) value = '';
      if (Array.isArray(value)) {
        if (value.length === 0) return `${acc}${key}`;
        const sorted = value
          .slice()
          .sort()
          .map((item) => (typeof item === 'object' && item !== null ? JSON.stringify(item) : item))
          .join(',');
        return `${acc}${key}${sorted}`;
      }
      if (typeof value === 'object' && value !== null) return acc + key + JSON.stringify(value);
      return acc + key + String(value);
    }, '');
}

function createDewuSign(params) {
  return crypto.createHash('md5').update(buildSignString(params) + SALT).digest('hex');
}

const proxy = getProxyConfig();
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Referer: 'https://www.dewu.com/',
  Origin: 'https://www.dewu.com',
  platform: 'pc',
};

async function dewuGet(path, params) {
  const sign = createDewuSign(params);
  const qs = new URLSearchParams({ sign, ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) });
  const r = await axios.get(`https://app.dewu.com${path}?${qs}`, {
    headers,
    proxy: proxy || false,
    timeout: 30000,
    validateStatus: () => true,
  });
  return r.data;
}

async function dewuPost(path, params) {
  const sign = createDewuSign(params);
  const body = { sign, ...params };
  const r = await axios.post(`https://app.dewu.com${path}`, body, {
    headers,
    proxy: proxy || false,
    timeout: 30000,
    validateStatus: () => true,
  });
  return r.data;
}

const pickIds = [644479, 644443];
const bodies = [
  { pickRuleId: 644443, pageNum: 1, pageSize: 24, filterUnbid: true, showCspu: true },
  { pickRuleId: 644443, pageNum: 1, pageSize: 24 },
  { pickRuleId: 644479, pageNum: 1, pageSize: 24, filterUnbid: true, showCspu: true },
];

for (const body of bodies) {
  const res = await dewuPost(
    '/api/v1/h5/commodity-pick-interfaces/pc/pick-rule-result/feeds/info',
    body,
  );
  console.log('\nPOST feeds', body, '=>', res.code, res.msg, 'list', res.data?.list?.length);
}

const getPaths = [
  ['/api/v1/h5/commodity-pick-spu/pick-rule-result', { pickRuleId: 644443 }],
  ['/api/v1/h5/search/fire/list/v2', { page: 1, limit: 20 }],
  ['/api/v1/h5/index/fire/index', {}],
];

for (const [path, params] of getPaths) {
  const res = await dewuGet(path, params);
  console.log('\nGET', path, '=>', res.code, res.msg?.slice?.(0, 40), 'data', JSON.stringify(res.data).slice(0, 200));
}
