export interface HotItem {
  rank: number;
  title: string;
  /** 海外平台原文标题，悬浮时展示 */
  titleOriginal?: string;
  heat?: string;
  url: string;
}

export interface HotPlatform {
  source: string;
  sourceName: string;
  listName: string;
  updatedAt: string;
  items: HotItem[];
  error?: boolean;
  message?: string;
}

export type AllHotResponse = HotPlatform[];
