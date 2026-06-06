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

async function dewuGet(base, path, params) {
  const sign = createDewuSign(params);
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries({ sign, ...params }).map(([k, v]) => [k, typeof v === 'boolean' ? String(v) : String(v)]),
    ),
  );
  const r = await axios.get(`${base}${path}?${qs}`, {
    headers,
    proxy: proxy || false,
    timeout: 30000,
    validateStatus: () => true,
  });
  return r.data;
}

async function dewuPost(base, path, params) {
  const sign = createDewuSign(params);
  const body = { sign, ...params };
  const r = await axios.post(`${base}${path}`, body, {
    headers,
    proxy: proxy || false,
    timeout: 30000,
    validateStatus: () => true,
  });
  return r.data;
}

const bases = ['https://app.dewu.com', 'https://app.poizon.com'];
const tests = [
  ['GET', '/api/v1/h5/search/fire/list/v2', { page: 1, limit: 20 }],
  ['GET', '/api/v1/h5/index/fire/index', {}],
  ['POST', '/api/v1/h5/search/fire/commodity/detail_brand', { brandId: 144, page: 1, limit: 20 }],
  ['POST', '/api/v1/h5/commodity/fire/search/doCategoryDetail', { catId: 29, page: 1, limit: 20 }],
  ['GET', '/api/v1/h5/commodity-pick-spu/pick-rule-result', { pickRuleId: 644443 }],
];

for (const base of bases) {
  for (const [method, path, params] of tests) {
    const res =
      method === 'GET' ? await dewuGet(base, path, params) : await dewuPost(base, path, params);
    const preview = JSON.stringify(res).slice(0, 400);
    console.log(`\n${base}${path} [${method}] => ${res?.code} ${res?.msg || ''}`);
    console.log(preview);
  }
}
