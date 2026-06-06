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
  Referer: 'https://www.dewu.com/',
  Origin: 'https://www.dewu.com',
  platform: 'pc',
};

async function dewuPost(path, params) {
  const body = { sign: createDewuSign(params), ...params };
  const r = await axios.post(`https://app.dewu.com${path}`, body, {
    headers,
    proxy: proxy || false,
    timeout: 30000,
    validateStatus: () => true,
  });
  return r.data;
}

const bodies = [
  { catId: 29, page: 1, limit: 20 },
  { catId: 29, pageNum: 1, pageSize: 20 },
  { categoryId: 29, page: 1, limit: 20 },
  { frontCategoryId: 29, page: 1, limit: 20 },
  { tabId: 29, page: 1, limit: 20 },
  { pickRuleId: 644443, pageNum: 1, pageSize: 20 },
  { item: 29, pageNum: 1, pageSize: 20 },
  { level1CategoryId: 29, page: 1, limit: 20 },
];

const paths = [
  '/api/v1/h5/commodity/fire/search/doCategoryDetail',
  '/api/v1/h5/search/fire/commodity/list',
  '/api/v1/h5/search/fire/commodity/detail_category',
  '/api/v1/h5/commodity-pick-interfaces/pc/pick-rule-result/category-pick/detail',
];

for (const path of paths) {
  for (const body of bodies.slice(0, 3)) {
    const res = await dewuPost(path, body);
    const hasList = res?.data?.list?.length || res?.data?.productList?.length;
    if (res.code === 200 && hasList) {
      console.log('HIT', path, body, 'count', hasList);
      console.log(JSON.stringify(res.data.list?.[0] || res.data.productList?.[0]).slice(0, 400));
    } else if (res.code !== 404 && res.code !== 403 && res.code !== 485) {
      console.log(path, body, '=>', res.code, JSON.stringify(res.data).slice(0, 120));
    }
  }
}
