import type { ReactNode } from 'react';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.title}>今日球鞋热搜</h1>
        <p className={styles.subtitle}>聚合识货、得物、虎扑及海外球鞋资讯平台热门内容</p>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <p>本站为个人学习项目，数据来源于各平台公开内容，非商用。</p>
        <p>展示内容版权归原始平台所有，本站仅为聚合展示，不存储任何数据文件。</p>
        <p>本站无需登录，不收集任何个人信息，不使用追踪 Cookie。数据更新频率约 10 分钟。</p>
      </footer>
    </div>
  );
}
