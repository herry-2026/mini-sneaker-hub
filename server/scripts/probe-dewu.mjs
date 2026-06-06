import axios from 'axios';
import { getProxyConfig } from '../utils/http.js';

const proxy = getProxyConfig();
const desktopHeaders = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  Referer: 'https://www.dewu.com/',
  Origin: 'https://www.dewu.com',
};
const mobileHeaders = {
  'User-Agent':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  Accept: 'application/json, text/plain, */*',
  Referer: 'https://m.dewu.com/',
};

async function tryReq(name, method, url, body, headers) {
  try {
    const r = await axios({
      method,
      url,
      data: body,
      headers,
      proxy: proxy || false,
      timeout: 20000,
      validateStatus: () => true,
    });
    const ct = r.headers['content-type'] || '';
    const preview =
      typeof r.data === 'string'
        ? r.data.slice(0, 300)
        : JSON.stringify(r.data).slice(0, 600);
    console.log(`\n[${name}] ${method} ${url}`);
    console.log(`status=${r.status} ct=${ct}`);
    console.log(preview);
    return r;
  } catch (e) {
    console.log(`\n[${name}] FAIL ${e.message}`);
    return null;
  }
}

const html = (
  await axios.get('https://www.dewu.com/', {
    headers: desktopHeaders,
    proxy: proxy || false,
    timeout: 20000,
  })
).data;
const scripts = [...html.matchAll(/src="([^"]+\.js)"/g)].map((m) => m[1]);
console.log('dewu scripts sample', scripts.slice(0, 8));

const apiUrls = [
  ['GET', 'https://app.dewu.com/api/v1/h5/index/fire/search/list', null],
  ['GET', 'https://app.dewu.com/api/v1/h5/search/fire/list/v2', null],
  ['GET', 'https://app.dewu.com/api/v1/h5/index/fire/flow/product/list', null],
  ['GET', 'https://app.dewu.com/api/v1/h5/commodity-pick-spu/pick-rule-result?pickRuleId=1', null],
  ['POST', 'https://app.dewu.com/api/v1/h5/index/fire/search/list', {}],
  ['POST', 'https://app.dewu.com/api/v1/h5/search/fire/list/v2', { page: 1, limit: 20 }],
  ['GET', 'https://cdn-fast.dewu.com/api/v1/h5/index/fire/search/list', null],
  ['GET', 'https://www.dewu.com/api/v1/h5/index/fire/search/list', null],
  ['GET', 'https://www.dewu.com/api/v1/h5/search/fire/list/v2', null],
];

for (const [method, url, body] of apiUrls) {
  await tryReq('desktop', method, url, body, desktopHeaders);
  await tryReq('mobile', method, url, body, mobileHeaders);
}
