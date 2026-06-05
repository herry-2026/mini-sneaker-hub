import { useCallback, useEffect, useState } from 'react';
import { fetchAllHot, fetchHotBySource } from '../api/hot';
import HotCard from '../components/HotCard';
import type { HotPlatform } from '../types/hot';
import styles from './Home.module.css';

const DOMESTIC_SOURCES = ['shihuo', 'dewu', 'hupu'];
const OVERSEAS_SOURCES = ['sneakernews', 'hypebeast', 'nicekicks'];
const ALL_SOURCES = [...DOMESTIC_SOURCES, ...OVERSEAS_SOURCES];

interface PlatformCardState {
  loading: boolean;
  error: boolean;
  platform: HotPlatform;
}

const PLATFORM_META: Record<
  string,
  Pick<HotPlatform, 'source' | 'sourceName' | 'listName'>
> = {
  shihuo: { source: 'shihuo', sourceName: '识货', listName: '热门球鞋榜' },
  dewu: { source: 'dewu', sourceName: '得物', listName: '本周流行' },
  hupu: { source: 'hupu', sourceName: '虎扑', listName: '装备区热帖' },
  sneakernews: {
    source: 'sneakernews',
    sourceName: 'Sneaker News',
    listName: 'Latest News',
  },
  hypebeast: { source: 'hypebeast', sourceName: 'Hypebeast', listName: 'Footwear' },
  nicekicks: {
    source: 'nicekicks',
    sourceName: 'Nice Kicks',
    listName: 'Top Stories',
  },
};

function createPlaceholderPlatform(source: string): HotPlatform {
  const meta = PLATFORM_META[source];
  return {
    source,
    sourceName: meta?.sourceName ?? source,
    listName: meta?.listName ?? '',
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

function toCardState(platform: HotPlatform | undefined, fallback: HotPlatform): PlatformCardState {
  if (!platform) {
    return {
      loading: false,
      error: true,
      platform: {
        ...fallback,
        items: [],
        message: '数据获取失败，请稍后重试',
      },
    };
  }

  if (platform.error) {
    return {
      loading: false,
      error: true,
      platform: {
        ...platform,
        items: [],
        message: platform.message ?? '数据获取失败，请稍后重试',
      },
    };
  }

  return {
    loading: false,
    error: false,
    platform,
  };
}

function useHotPlatforms() {
  const [platformStates, setPlatformStates] = useState(createInitialStates);

  const applyPlatforms = useCallback((platforms: HotPlatform[]) => {
    setPlatformStates((prev) =>
      Object.fromEntries(
        ALL_SOURCES.map((source) => [
          source,
          toCardState(
            platforms.find((p) => p.source === source),
            prev[source].platform,
          ),
        ]),
      ),
    );
  }, []);

  const setAllLoading = useCallback(() => {
    setPlatformStates((prev) =>
      Object.fromEntries(
        ALL_SOURCES.map((source) => [
          source,
          {
            loading: true,
            error: false,
            platform: {
              ...prev[source].platform,
              items: [],
              message: undefined,
            },
          },
        ]),
      ),
    );
  }, []);

  const loadAll = useCallback(async () => {
    setAllLoading();
    try {
      const data = await fetchAllHot();
      applyPlatforms(data);
    } catch {
      setPlatformStates((prev) =>
        Object.fromEntries(
          ALL_SOURCES.map((source) => [
            source,
            {
              loading: false,
              error: true,
              platform: {
                ...prev[source].platform,
                items: [],
                message: '数据获取失败，请稍后重试',
              },
            },
          ]),
        ),
      );
    }
  }, [applyPlatforms, setAllLoading]);

  const loadPlatform = useCallback(async (source: string) => {
    setPlatformStates((prev) => ({
      ...prev,
      [source]: {
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
      const platform = await fetchHotBySource(source);
      setPlatformStates((prev) => ({
        ...prev,
        [source]: toCardState(platform, prev[source].platform),
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
