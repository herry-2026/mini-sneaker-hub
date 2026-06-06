import axios from 'axios';
import { withDewuSign } from '../utils/dewuSign.js';
import { getProxyConfig } from '../utils/http.js';

const API_BASE = 'https://app.dewu.com';
const SHOE_TAB_PATTERN = /鞋/;
const MAX_ITEMS = 10;

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json',
  Referer: 'https://www.dewu.com/',
  Origin: 'https://www.dewu.com',
  platform: 'pc',
};

async function dewuPost(path, params) {
  const proxy = getProxyConfig();
  const response = await axios.post(`${API_BASE}${path}`, withDewuSign(params), {
    headers: BROWSER_HEADERS,
    timeout: 30000,
    proxy: proxy || false,
    validateStatus: () => true,
  });

  const data = response.data;
  if (!data || (data.code !== 200 && data.status !== 200)) {
    throw new Error(data?.msg || '得物接口返回异常');
  }
  return data;
}

function buildProductUrl(item) {
  const spuId = item.spuId ?? 0;
  const skuId = item.skuId ?? 0;
  const propertyValueId = item.propertyValueId ?? 0;
  return `https://www.dewu.com/product-detail.html?sourceName=pc&spuId=${spuId}&propertyValueId=${propertyValueId}&skuId=${skuId}`;
}

function formatHeat(item) {
  const candidates = [
    item.soldNumText,
    item.soldCountText,
    item.soldCount,
    item.payCount,
    item.wantCount,
    item.favoriteCount,
  ];

  for (const value of candidates) {
    if (value === undefined || value === null || value === '') continue;
    const text = String(value);
    if (/w|万|人付款|想要/.test(text)) return text.replace(/人付款$/, '');
    const num = Number(text);
    if (!Number.isNaN(num) && num > 0) {
      if (num >= 10000) {
        return `${(num / 10000).toFixed(1).replace(/\.0$/, '')}w`;
      }
      return String(num);
    }
  }

  if (typeof item.price === 'number' && item.price > 0) {
    return `¥${Math.floor(item.price / 100)}`;
  }
  return undefined;
}

/**
 * 抓取得物 PC 首页「鞋类」频道商品流
 */
export async function fetchDewuHot() {
  const mapping = await dewuPost(
    '/api/v1/h5/commodity-pick-interfaces/pc/pick-rule-result/category-pick/mapping',
    { pageNum: 1, pageSize: 20 },
  );

  const tabs = mapping.data?.checkRespDTOList;
  if (!Array.isArray(tabs) || tabs.length === 0) {
    throw new Error('未解析到得物频道列表');
  }

  const shoeTab = tabs.find((tab) => SHOE_TAB_PATTERN.test(tab.name || '')) || tabs[0];
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

  const list = feeds.data?.list;
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('未解析到得物商品列表');
  }

  return list.slice(0, MAX_ITEMS).map((item, index) => ({
    rank: index + 1,
    title: item.title || item.productName || '未知商品',
    url: buildProductUrl(item),
    heat: formatHeat(item),
  }));
}
