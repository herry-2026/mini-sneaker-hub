import cors from 'cors';
import express from 'express';
import { getMockPlatform, PLATFORM_SOURCES } from './mock/hot.js';
import { fetchHypebeast } from './services/hypebeast.js';
import { fetchHupuHot } from './services/hupu.js';
import { fetchNiceKicks } from './services/nicekicks.js';
import { fetchShihuoHot } from './services/shihuo.js';
import { fetchSneakerNews } from './services/sneakernews.js';
import { getCache, setCache } from './utils/cache.js';
import { translateHotItems } from './utils/translate.js';

const app = express();
const PORT = process.env.PORT || 3001;

const OVERSEAS_SOURCES = new Set(['sneakernews', 'hypebeast', 'nicekicks']);

const LIVE_PLATFORM_CONFIG = {
  shihuo: {
    fetch: fetchShihuoHot,
    sourceName: '识货',
    listName: '热门球鞋榜',
  },
  hupu: {
    fetch: fetchHupuHot,
    sourceName: '虎扑',
    listName: '装备区热帖',
  },
  sneakernews: {
    fetch: fetchSneakerNews,
    sourceName: 'Sneaker News',
    listName: '最新文章',
  },
  hypebeast: {
    fetch: fetchHypebeast,
    sourceName: 'Hypebeast',
    listName: 'Footwear',
  },
  nicekicks: {
    fetch: fetchNiceKicks,
    sourceName: 'Nice Kicks',
    listName: 'Top Stories',
  },
};

app.use(cors());
app.use(express.json());

function shouldRefresh(req) {
  return req.query.refresh === '1';
}

/** 得物演示数据（Mock，不调用真实抓取） */
function getDewuDemoPlatform() {
  const mock = getMockPlatform('dewu');
  return {
    source: 'dewu',
    sourceName: '得物',
    listName: '热门球鞋榜',
    updatedAt: new Date().toISOString(),
    items: mock?.items ?? [],
    error: false,
    demo: true,
  };
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

async function getLivePlatform(source, skipCache = false) {
  const config = LIVE_PLATFORM_CONFIG[source];
  if (!config) {
    return null;
  }

  if (!skipCache) {
    const cached = getCache(source);
    if (cached) {
      console.log(`[cache hit] ${source}`);
      return cached;
    }
  }

  try {
    let items = await config.fetch();
    if (OVERSEAS_SOURCES.has(source)) {
      items = await translateHotItems(items);
    }
    const data = {
      source,
      sourceName: config.sourceName,
      listName: config.listName,
      updatedAt: new Date().toISOString(),
      items,
      error: false,
    };
    setCache(source, data);
    return data;
  } catch (err) {
    console.error(`[${source}] fetch failed:`, err.message);
    return {
      source,
      sourceName: config.sourceName,
      listName: config.listName,
      updatedAt: new Date().toISOString(),
      items: [],
      error: true,
      message: '获取数据失败',
    };
  }
}

function getPlatformData(source, skipCache = false) {
  if (source === 'dewu') {
    return Promise.resolve(getDewuDemoPlatform());
  }
  if (source in LIVE_PLATFORM_CONFIG) {
    return getLivePlatform(source, skipCache);
  }
  return Promise.resolve(getHotPlatform(source, skipCache));
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

/** 返回全部 6 个平台数据 */
app.get('/api/hot', async (req, res) => {
  const skipCache = shouldRefresh(req);
  const platforms = await Promise.all(
    PLATFORM_SOURCES.map((source) => getPlatformData(source, skipCache)),
  );
  res.json(platforms.filter((platform) => platform !== null));
});

app.get('/api/hot/shihuo', async (req, res) => {
  const data = await getLivePlatform('shihuo', shouldRefresh(req));
  res.json(data);
});

app.get('/api/hot/dewu', (_req, res) => {
  res.json(getDewuDemoPlatform());
});

app.get('/api/hot/hupu', async (req, res) => {
  const data = await getLivePlatform('hupu', shouldRefresh(req));
  res.json(data);
});

app.get('/api/hot/sneakernews', async (req, res) => {
  const data = await getLivePlatform('sneakernews', shouldRefresh(req));
  res.json(data);
});

app.get('/api/hot/hypebeast', async (req, res) => {
  const data = await getLivePlatform('hypebeast', shouldRefresh(req));
  res.json(data);
});

app.get('/api/hot/nicekicks', async (req, res) => {
  const data = await getLivePlatform('nicekicks', shouldRefresh(req));
  res.json(data);
});

app.use((_req, res) => {
  res.status(404).json({
    error: true,
    message: '出错了，请稍后重试',
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
