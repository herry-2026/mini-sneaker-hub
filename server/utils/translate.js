import axios from 'axios';
import { getProxyConfig } from './http.js';

const LANG_PAIR = 'en|zh-CN';
const CONCURRENCY = 3;
const cache = new Map();

function isMostlyChinese(text) {
  const letters = text.match(/[a-zA-Z]/g)?.length ?? 0;
  const cjk = text.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  return cjk > 0 && letters < 4;
}

/**
 * 将英文标题翻译为简体中文（带内存缓存）
 */
export async function translateToZh(text) {
  const source = text?.trim();
  if (!source) return text;
  if (isMostlyChinese(source)) return source;
  if (cache.has(source)) return cache.get(source);

  const proxy = getProxyConfig();
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(source)}&langpair=${LANG_PAIR}`;
  const response = await axios.get(url, {
    timeout: 15000,
    proxy: proxy || false,
    validateStatus: () => true,
  });

  const translated = response.data?.responseData?.translatedText?.trim();
  if (!translated || translated.toUpperCase() === source.toUpperCase()) {
    return source;
  }

  cache.set(source, translated);
  return translated;
}

async function translateItem(item) {
  const original = item.title;
  let translated = original;

  try {
    translated = await translateToZh(original);
  } catch (err) {
    console.warn('[translate] item failed:', err.message);
  }

  return {
    ...item,
    title: translated,
    ...(translated !== original ? { titleOriginal: original } : {}),
  };
}

/**
 * 批量翻译热搜标题：title 显示译文，titleOriginal 保留原文
 */
export async function translateHotItems(items) {
  const result = new Array(items.length);

  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    const translatedBatch = await Promise.all(batch.map(translateItem));
    translatedBatch.forEach((item, index) => {
      result[i + index] = item;
    });
  }

  return result;
}
