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

async function dewuPost(path, params) {
  const sign = createDewuSign(params);
  const body = { sign, ...params };
  const proxy = getProxyConfig();
  const r = await axios.post(`https://app.dewu.com${path}`, body, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Referer: 'https://www.dewu.com/',
      Origin: 'https://www.dewu.com',
    },
    proxy: proxy || false,
    timeout: 30000,
    validateStatus: () => true,
  });
  return r.data;
}

const mapping = await dewuPost(
  '/api/v1/h5/commodity-pick-interfaces/pc/pick-rule-result/category-pick/mapping',
  { pageNum: 1, pageSize: 20 },
);
console.log('mapping', JSON.stringify(mapping).slice(0, 1200));

if (mapping?.data?.checkRespDTOList?.length) {
  const tabs = mapping.data.checkRespDTOList;
  console.log(
    'tabs',
    tabs.map((t) => ({ name: t.name, pickId: t.pickId })),
  );
  const shoeTab = tabs.find((t) => /鞋|潮流|运动|潮鞋|球鞋/.test(t.name || '')) || tabs[0];
  const feeds = await dewuPost(
    '/api/v1/h5/commodity-pick-interfaces/pc/pick-rule-result/feeds/info',
    {
      pickRuleId: shoeTab.pickId,
      pageNum: 1,
      pageSize: 24,
      filterUnbid: true,
      showCspu: true,
    },
  );
  console.log('\nfeeds keys', Object.keys(feeds || {}));
  console.log('feeds data keys', Object.keys(feeds?.data || {}));
  console.log('feeds full', JSON.stringify(feeds, null, 2).slice(0, 3000));
}
