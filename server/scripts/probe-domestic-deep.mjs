import axios from 'axios';
import * as cheerio from 'cheerio';
import { getProxyConfig } from '../utils/http.js';
import fs from 'fs';

const proxy = getProxyConfig();
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'text/html,application/json,*/*',
  'Accept-Language': 'zh-CN,zh;q=0.9',
};

async function tryGet(name, url, opts = {}) {
  try {
    const r = await axios.get(url, {
      headers: { ...headers, ...opts.headers },
      proxy: proxy || false,
      timeout: 20000,
      responseType: opts.json ? 'json' : 'text',
      validateStatus: () => true,
    });
    console.log(`\n[${name}] ${url} => ${r.status} type=${typeof r.data} len=${JSON.stringify(r.data).length}`);
    return r;
  } catch (e) {
    console.log(`\n[${name}] ${url} => FAIL ${e.message}`);
    return null;
  }
}

function walk(obj, path = '', hits = [], depth = 0) {
  if (depth > 6 || hits.length > 30) return hits;
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === 'object') {
      const sample = obj[0];
      const keys = Object.keys(sample);
      if (keys.some((k) => /title|name|goods|product|heat|sale|pay/i.test(k))) {
        hits.push({ path, len: obj.length, keys: keys.slice(0, 12), sample: JSON.stringify(sample).slice(0, 300) });
      }
    }
    for (const [k, v] of Object.entries(obj)) {
      walk(v, path ? `${path}.${k}` : k, hits, depth + 1);
    }
  }
  return hits;
}

// --- Shihuo ---
const shihuoHtml = (await tryGet('shihuo-home', 'https://www.shihuo.cn/'))?.data;
if (shihuoHtml) {
  const $ = cheerio.load(shihuoHtml);
  const goods = [];
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (href.includes('pcGoodsDetail') && text.length > 5) {
      const heatMatch = text.match(/([\d.]+w?)人付款/);
      goods.push({ text: text.slice(0, 80), href, heat: heatMatch?.[1] });
    }
  });
  console.log('shihuo goods links', goods.length);
  console.log(JSON.stringify(goods.slice(0, 8), null, 2));

  const nextMatch = shihuoHtml.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (nextMatch) {
    const data = JSON.parse(nextMatch[1]);
    const hits = walk(data);
    console.log('shihuo __NEXT_DATA__ interesting arrays:', hits.length);
    hits.slice(0, 5).forEach((h) => console.log(JSON.stringify(h, null, 2)));
    fs.writeFileSync('scripts/shihuo-next.json', JSON.stringify(data, null, 2));
  }
}

const shihuoUrls = [
  'https://www.shihuo.cn/page/pcRankList',
  'https://www.shihuo.cn/rank',
  'https://sh-gateway.shihuo.cn/v4/services/sh-rank/rank/list?type=1',
  'https://sh-gateway.shihuo.cn/v4/services/sh-goodsapi/goods/rankList',
  'https://sh-gateway.shihuo.cn/v4/services/sh-goodsapi/goods/hotList',
  'https://sh-gateway.shihuo.cn/v4/services/sh-goodsapi/goods/hotSaleList',
  'https://sh-gateway.shihuo.cn/v4/services/sh-goodsapi/goods/hotRank',
];
for (const url of shihuoUrls) {
  const r = await tryGet('shihuo-api', url, { json: url.includes('gateway') });
  if (r?.data && typeof r.data === 'object') {
    console.log('keys', Object.keys(r.data));
    console.log(JSON.stringify(r.data).slice(0, 500));
  }
}

// --- Dewu ---
const dewuUrls = [
  'https://www.dewu.com/',
  'https://www.dewu.com/trend',
  'https://app.dewu.com/api/v1/h5/index/fire/search/list',
  'https://app.dewu.com/api/v1/h5/commodity-pick-spu/pick-rule-result?pickRuleId=1',
  'https://app.dewu.com/api/v1/h5/index/fire/flow/product/list',
  'https://app.dewu.com/api/v1/h5/search/fire/list/v2',
  'https://app.dewu.com/api/v1/h5/index/fire/hot-words',
  'https://fast.dewu.com/api/v1/h5/index/fire/search/list',
];
for (const url of dewuUrls) {
  const r = await tryGet('dewu', url, {
    json: url.includes('/api/'),
    headers: url.includes('/api/') ? { Referer: 'https://www.dewu.com/' } : {},
  });
  if (r?.data && typeof r.data === 'object') {
    console.log('keys', Object.keys(r.data));
    const str = JSON.stringify(r.data);
    console.log(str.slice(0, 800));
    if (str.includes('title') || str.includes('productName')) {
      fs.writeFileSync('scripts/dewu-sample.json', JSON.stringify(r.data, null, 2));
    }
  }
}

const dewuHtml = (await tryGet('dewu-trend', 'https://www.dewu.com/trend'))?.data;
if (dewuHtml) {
  const nextMatch = dewuHtml.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (nextMatch) {
    const data = JSON.parse(nextMatch[1]);
    const hits = walk(data);
    console.log('dewu trend __NEXT_DATA__ hits', hits.length);
    hits.slice(0, 5).forEach((h) => console.log(JSON.stringify(h, null, 2)));
  }
}
