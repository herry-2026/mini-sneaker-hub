/**
 * 内存缓存工具（Map + TTL）
 */

const cache = new Map();

const parsedTtl = Number(process.env.CACHE_TTL);
const DEFAULT_TTL_SEC =
  Number.isFinite(parsedTtl) && parsedTtl > 0 ? parsedTtl : 600;

/**
 * 根据 key 获取缓存，过期则返回 null 并清除条目
 * @param {string} key
 * @returns {unknown | null}
 */
export function getCache(key) {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * 写入缓存，过期时间为当前时间 + ttlSec 秒
 * @param {string} key
 * @param {unknown} data
 * @param {number} [ttlSec] 默认使用 CACHE_TTL 环境变量或 600 秒
 */
export function setCache(key, data, ttlSec = DEFAULT_TTL_SEC) {
  const ttl = ttlSec > 0 ? ttlSec : DEFAULT_TTL_SEC;
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl * 1000,
  });
}
