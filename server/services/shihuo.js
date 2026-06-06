import axios from 'axios';
import { getProxyConfig } from '../utils/http.js';

const PAGE_URL = 'https://www.shihuo.cn/';
const DETAIL_URL = 'https://www.shihuo.cn/page/pcGoodsDetail';
const SHOE_CATEGORY_ID = 8;
const MAX_ITEMS = 10;

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
};

function parseNextData(html) {
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) return null;
  return JSON.parse(match[1]);
}

function parseSalesCount(salesInfo = '') {
  const text = String(salesInfo);
  const wanMatch = text.match(/([\d.]+)w/);
  if (wanMatch) return Number(wanMatch[1]) * 10000;
  const numMatch = text.match(/(\d+)/);
  return numMatch ? Number(numMatch[1]) : 0;
}

function formatHeat(salesInfo = '') {
  const text = String(salesInfo).trim();
  if (!text) return undefined;
  const wanMatch = text.match(/([\d.]+w)/i);
  if (wanMatch) return wanMatch[1].toLowerCase();
  const numMatch = text.match(/(\d+)/);
  if (!numMatch) return undefined;
  const count = Number(numMatch[1]);
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1).replace(/\.0$/, '')}w`;
  }
  return String(count);
}

function buildDetailUrl(goodsId, styleId) {
  return `${DETAIL_URL}?goodsId=${goodsId}&styleId=${styleId}`;
}

/**
 * 抓取识货首页 SSR 数据中的热门球鞋（运动鞋类目）
 */
export async function fetchShihuoHot() {
  const proxy = getProxyConfig();
  const response = await axios.get(PAGE_URL, {
    headers: BROWSER_HEADERS,
    timeout: 30000,
    responseType: 'text',
    proxy: proxy || false,
  });

  const nextData = parseNextData(response.data);
  const list = nextData?.props?.pageProps?.data?.data?.list;
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('未解析到识货商品列表');
  }

  const shoes = list
    .filter((item) => item.root_category_id === SHOE_CATEGORY_ID)
    .sort((a, b) => parseSalesCount(b.sales_info) - parseSalesCount(a.sales_info));

  if (shoes.length === 0) {
    throw new Error('未找到识货球鞋数据');
  }

  return shoes.slice(0, MAX_ITEMS).map((item, index) => ({
    rank: index + 1,
    title: item.title,
    url: buildDetailUrl(item.goods_id, item.style_id),
    heat: formatHeat(item.sales_info),
  }));
}
