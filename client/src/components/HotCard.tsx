import type { HotPlatform } from '../types/hot';
import styles from './HotCard.module.css';

interface HotCardProps {
  platform: HotPlatform;
  /** ISO8601 时间字符串，默认取 platform.updatedAt */
  updatedAt?: string;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

const SKELETON_ROWS = 6;

/** 根据 ISO 时间计算相对时间（距今多久） */
function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '未知';
  }

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin} 分钟前`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} 小时前`;

  return date.toLocaleString('zh-CN');
}

function getRankClass(rank: number): string {
  if (rank === 1) return styles.rankTop1;
  if (rank === 2) return styles.rankTop2;
  if (rank === 3) return styles.rankTop3;
  return '';
}

function LoadingSkeleton() {
  return (
    <div className={styles.loadingState}>
      <p className={styles.loadingText}>加载中...</p>
      <div className={styles.skeletonList}>
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <div key={i} className={styles.skeletonRow}>
            <span className={styles.skeletonRank} />
            <span className={styles.skeletonTitle} />
            <span className={styles.skeletonHeat} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HotCard({
  platform,
  updatedAt: updatedAtProp,
  loading = false,
  error = false,
  onRetry,
}: HotCardProps) {
  const { source, sourceName, listName, items, message } = platform;
  const updatedAt = updatedAtProp ?? platform.updatedAt;

  const renderBody = () => {
    if (loading) {
      return <LoadingSkeleton />;
    }

    if (error) {
      return (
        <div className={styles.errorState}>
          <p className={styles.errorMessage}>
            {message ?? '数据获取失败，请稍后重试'}
          </p>
          <button
            type="button"
            className={styles.retryButton}
            onClick={() => onRetry?.()}
          >
            重试
          </button>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>暂无数据</p>
        </div>
      );
    }

    return (
      <ol className={styles.list}>
        {items.map((item) => (
          <li key={`${source}-${item.rank}`} className={styles.item}>
            <span className={`${styles.rank} ${getRankClass(item.rank)}`}>
              {item.rank}
            </span>
            <a
              className={styles.link}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.title}
            </a>
            {item.heat && <span className={styles.heat}>{item.heat}</span>}
          </li>
        ))}
      </ol>
    );
  };

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <h2 className={styles.platformName}>{sourceName}</h2>
        <p className={styles.listName}>{listName}</p>
      </header>

      {renderBody()}

      {!loading && (
        <footer className={styles.footer}>
          更新于 {formatRelativeTime(updatedAt)}
        </footer>
      )}
    </article>
  );
}
