import cors from 'cors';
import express from 'express';
import { getMockPlatform, PLATFORM_SOURCES } from './mock/hot.js';
import { getCache, setCache } from './utils/cache.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

function shouldRefresh(req) {
  return req.query.refresh === '1';
}

/**
 * 获取单平台数据：优先读缓存，未命中则生成 Mock 并写入缓存
 */
function getHotPlatform(source, skipCache = false) {
  if (!skipCache) {
    const cached = getCache(source);
    if (cached) {
      console.log(`[cache hit] ${source}`);
      return cached;
    }
  }

  const data = getMockPlatform(source);
  if (!data) {
    return null;
  }

  setCache(source, data);
  return data;
}

function handleHotPlatform(source, req, res) {
  const data = getHotPlatform(source, shouldRefresh(req));
  if (!data) {
    res.status(404).json({
      error: true,
      message: '出错了，请稍后重试',
    });
    return;
  }
  res.json(data);
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

/** 返回全部 6 个平台数据 */
app.get('/api/hot', (req, res) => {
  const skipCache = shouldRefresh(req);
  const platforms = PLATFORM_SOURCES.map((source) =>
    getHotPlatform(source, skipCache),
  ).filter((platform) => platform !== null);
  res.json(platforms);
});

app.get('/api/hot/shihuo', (req, res) => handleHotPlatform('shihuo', req, res));

app.get('/api/hot/dewu', (req, res) => handleHotPlatform('dewu', req, res));

app.get('/api/hot/hupu', (req, res) => handleHotPlatform('hupu', req, res));

app.get('/api/hot/sneakernews', (req, res) =>
  handleHotPlatform('sneakernews', req, res),
);

app.get('/api/hot/hypebeast', (req, res) =>
  handleHotPlatform('hypebeast', req, res),
);

app.get('/api/hot/nicekicks', (req, res) =>
  handleHotPlatform('nicekicks', req, res),
);

app.use((_req, res) => {
  res.status(404).json({
    error: true,
    message: '出错了，请稍后重试',
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
