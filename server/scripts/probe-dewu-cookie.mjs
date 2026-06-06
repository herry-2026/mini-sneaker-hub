import axios from 'axios';
import { getProxyConfig } from '../utils/http.js';

const proxy = getProxyConfig();
const client = axios.create({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    Origin: 'https://www.dewu.com',
    Referer: 'https://www.dewu.com/',
  },
  proxy: proxy || false,
  timeout: 30000,
  validateStatus: () => true,
  withCredentials: true,
});

const home = await client.get('https://www.dewu.com/');
console.log('home cookies', home.headers['set-cookie']?.map((c) => c.split(';')[0]));

const mapping = await client.post(
  'https://www.dewu.com/api/v1/h5/commodity-pick-interfaces/pc/pick-rule-result/category-pick/mapping',
  { pageNum: 1, pageSize: 20 },
);
console.log('\nmapping www', mapping.status, JSON.stringify(mapping.data).slice(0, 800));

const mappingApp = await client.post(
  'https://app.dewu.com/api/v1/h5/commodity-pick-interfaces/pc/pick-rule-result/category-pick/mapping',
  { pageNum: 1, pageSize: 20 },
);
console.log('\nmapping app', mappingApp.status, JSON.stringify(mappingApp.data).slice(0, 800));

if (mappingApp.data?.data?.checkRespDTOList?.[0]?.pickId) {
  const pickId = mappingApp.data.data.checkRespDTOList[0].pickId;
  console.log('first pickId', pickId, 'name', mappingApp.data.data.checkRespDTOList[0].name);
  const feeds = await client.post(
    'https://app.dewu.com/api/v1/h5/commodity-pick-interfaces/pc/pick-rule-result/feeds/info',
    { pickRuleId: pickId, pageNum: 1, pageSize: 24, filterUnbid: true, showCspu: true },
  );
  console.log('\nfeeds', feeds.status, JSON.stringify(feeds.data).slice(0, 1000));
}
