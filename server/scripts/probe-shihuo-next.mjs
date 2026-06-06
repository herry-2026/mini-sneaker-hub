import axios from 'axios';
import { getProxyConfig } from '../utils/http.js';

const proxy = getProxyConfig();
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
  Accept: 'application/json,*/*',
};

const homeHtml = (
  await axios.get('https://www.shihuo.cn/', { headers, proxy: proxy || false, timeout: 20000 })
).data;
const buildId = homeHtml.match(/"buildId":"([^"]+)"/)?.[1];
console.log('buildId', buildId);

const nextUrls = [
  `https://www.shihuo.cn/_next/data/${buildId}/pcHome.json`,
  `https://www.shihuo.cn/_next/data/${buildId}/pcChannel.json?rootCategoryId=8`,
  `https://www.shihuo.cn/_next/data/${buildId}/sports.json`,
];
for (const url of nextUrls) {
  try {
    const r = await axios.get(url, { headers, proxy: proxy || false, timeout: 20000, validateStatus: () => true });
    const list = r.data?.pageProps?.data?.data?.list;
    console.log(url.split('.cn')[1], 'status', r.status, 'list', list?.length);
    if (list?.length) {
      const shoes = list.filter((i) => i.root_category_id === 8);
      console.log('shoes', shoes.length, shoes.slice(0, 3).map((s) => s.title.slice(0, 30)));
    }
  } catch (e) {
    console.log(url, 'fail', e.message);
  }
}

// dewu community search without sign
const dewuSearch = [
  'https://app.dewu.com/api/v1/app/search/ice/community/search/list?hideAddProduct=0&title=球鞋&sortMode=1&typeId=0&sortType=0&showHot=1&catId=0&page=0&limit=20&scene=community_trans_product',
  'https://app.dewu.com/sns-rec/v1/recommend/all/feed',
  'https://app.dewu.com/api/v1/h5/index/fire/index',
];
for (const url of dewuSearch) {
  try {
    const r = await axios.get(url, {
      headers: {
        ...headers,
        Referer: 'https://www.dewu.com/',
      },
      proxy: proxy || false,
      timeout: 20000,
      validateStatus: () => true,
    });
    console.log('\ndewu', url.split('dewu.com')[1]);
    console.log('status', r.status, JSON.stringify(r.data).slice(0, 500));
  } catch (e) {
    console.log('dewu fail', e.message);
  }
}
