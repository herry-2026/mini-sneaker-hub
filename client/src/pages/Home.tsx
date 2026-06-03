import { useCallback, useEffect, useState } from 'react';
import HotCard from '../components/HotCard';
import mockData from '../mock/hot.json';
import type { HotPlatform } from '../types/hot';
import styles from './Home.module.css';

const DOMESTIC_SOURCES = ['shihuo', 'dewu', 'hupu'];
const OVERSEAS_SOURCES = ['sneakernews', 'hypebeast', 'nicekicks'];
const ALL_SOURCES = [...DOMESTIC_SOURCES, ...OVERSEAS_SOURCES];
const LOAD_DELAY_MS = 500;

interface PlatformCardState {
  loading: boolean;
  error: boolean;
  platform: HotPlatform;
}

const mockPlatforms = mockData as HotPlatform[];

function getMockPlatform(source: string): HotPlatform | undefined {
  return mockPlatforms.find((p) => p.source === source);
}

function createPlaceholderPlatform(source: string): HotPlatform {
  const found = getMockPlatform(source);
  if (found) {
    return { ...found, items: [] };
  }
  return {
    source,
    sourceName: source,
    listName: '',
    updatedAt: new Date().toISOString(),
    items: [],
  };
}

function createInitialStates(): Record<string, PlatformCardState> {
  return Object.fromEntries(
    ALL_SOURCES.map((source) => [
      source,
      {
        loading: true,
        error: false,
        platform: createPlaceholderPlatform(source),
      },
    ]),
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchPlatformData(source: string): Promise<HotPlatform> {
  await delay(LOAD_DELAY_MS);
  const platform = getMockPlatform(source);
  if (!platform) {
    throw new Error('数据获取失败，请稍后重试');
  }
  if (platform.error) {
    throw new Error(platform.message ?? '数据获取失败，请稍后重试');
  }
  return platform;
}

function useHotPlatforms() {
  const [platformStates, setPlatformStates] = useState(createInitialStates);

  const loadPlatform = useCallback(async (source: string) => {
    setPlatformStates((prev) => ({
      ...prev,
      [source]: {
        ...prev[source],
        loading: true,
        error: false,
        platform: {
          ...prev[source].platform,
          items: [],
          message: undefined,
        },
      },
    }));

    try {
      const platform = await fetchPlatformData(source);
      setPlatformStates((prev) => ({
        ...prev,
        [source]: { loading: false, error: false, platform },
      }));
    } catch {
      setPlatformStates((prev) => ({
        ...prev,
        [source]: {
          loading: false,
          error: true,
          platform: {
            ...prev[source].platform,
            items: [],
            message: '数据获取失败，请稍后重试',
          },
        },
      }));
    }
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all(ALL_SOURCES.map((source) => loadPlatform(source)));
  }, [loadPlatform]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const retryPlatform = useCallback(
    (source: string) => {
      loadPlatform(source);
    },
    [loadPlatform],
  );

  const getPlatformsBySources = (sources: string[]) =>
    sources
      .map((source) => platformStates[source])
      .filter((state): state is PlatformCardState => state !== undefined);

  return {
    allPlatforms: getPlatformsBySources(ALL_SOURCES),
    domesticPlatforms: getPlatformsBySources(DOMESTIC_SOURCES),
    overseasPlatforms: getPlatformsBySources(OVERSEAS_SOURCES),
    retryPlatform,
  };
}

function renderHotCards(
  platforms: PlatformCardState[],
  retryPlatform: (source: string) => void,
) {
  return platforms.map(({ loading, error, platform }) => (
    <HotCard
      key={platform.source}
      platform={platform}
      loading={loading}
      error={error}
      onRetry={() => retryPlatform(platform.source)}
    />
  ));
}

export default function Home() {
  const { allPlatforms, domesticPlatforms, overseasPlatforms, retryPlatform } =
    useHotPlatforms();
  const allLoading =
    allPlatforms.length > 0 && allPlatforms.every((state) => state.loading);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>今日球鞋热搜</h1>
        <p className={styles.subtitle}>
          聚合识货、得物、虎扑及海外球鞋资讯平台热门内容，一站浏览各平台热搜
        </p>
      </header>

      <main className={styles.main}>
        {allLoading ? (
          <div className={styles.globalLoading}>
            <div className={styles.spinner} aria-hidden="true" />
            <p className={styles.globalLoadingText}>加载中...</p>
          </div>
        ) : (
          <>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>国内平台</h2>
              <div className={styles.grid}>
                {renderHotCards(domesticPlatforms, retryPlatform)}
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>海外平台</h2>
              <div className={styles.grid}>
                {renderHotCards(overseasPlatforms, retryPlatform)}
              </div>
            </section>
          </>
        )}
      </main>

      <footer className={styles.footer}>
        <p>本站为个人学习项目，不用于商业用途。</p>
        <p>
          数据来源于各平台公开内容（识货、得物、虎扑、Sneaker News、Hypebeast、Nice Kicks），版权归原作者所有。
        </p>
        <p>本站仅为聚合展示，不存储任何数据文件。数据更新频率约 10 分钟。</p>
      </footer>
    </div>
  );
}
