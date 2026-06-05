/**
 * 各平台 Mock 热搜数据（开发阶段使用，格式符合 HotPlatform）
 * 海外平台 items 不含 heat 字段
 */

const now = new Date().toISOString();

export const mockPlatforms = [
  {
    source: 'shihuo',
    sourceName: '识货',
    listName: '热门球鞋榜',
    updatedAt: now,
    items: [
      { rank: 1, title: 'Nike Air Jordan 1 芝加哥复刻', heat: '12.3w', url: 'https://www.shihuo.cn/' },
      { rank: 2, title: 'Adidas Yeezy 350 V2 黑红字补货', heat: '9.8w', url: 'https://www.shihuo.cn/' },
      { rank: 3, title: 'New Balance 550 白绿配色', heat: '7.5w', url: 'https://www.shihuo.cn/' },
      { rank: 4, title: 'Nike Dunk Low 熊猫配色', heat: '6.2w', url: 'https://www.shihuo.cn/' },
      { rank: 5, title: 'Air Force 1 纯白经典款', heat: '5.1w', url: 'https://www.shihuo.cn/' },
      { rank: 6, title: 'Salomon XT-6 越野跑鞋', heat: '4.8w', url: 'https://www.shihuo.cn/' },
    ],
  },
  {
    source: 'dewu',
    sourceName: '得物',
    listName: '本周流行',
    updatedAt: now,
    items: [
      { rank: 1, title: 'Travis Scott x Air Jordan 1 Low', heat: '15.6w', url: 'https://www.dewu.com/' },
      { rank: 2, title: 'Nike Kobe 6 Protro 青蜂侠', heat: '11.2w', url: 'https://www.dewu.com/' },
      { rank: 3, title: 'Adidas Samba OG 经典白', heat: '8.9w', url: 'https://www.dewu.com/' },
      { rank: 4, title: 'New Balance 2002R 元祖灰', heat: '7.3w', url: 'https://www.dewu.com/' },
      { rank: 5, title: 'Asics Gel-Kayano 14 银灰', heat: '6.0w', url: 'https://www.dewu.com/' },
      { rank: 6, title: 'Nike Air Max 97 银子弹', heat: '5.4w', url: 'https://www.dewu.com/' },
    ],
  },
  {
    source: 'hupu',
    sourceName: '虎扑',
    listName: '装备区热帖',
    updatedAt: now,
    items: [
      { rank: 1, title: '【讨论】AJ1 芝加哥到底值不值得入手？', heat: '328回复', url: 'https://bbs.hupu.com/' },
      { rank: 2, title: '晒一晒我的球鞋墙，20双够不够？', heat: '256回复', url: 'https://bbs.hupu.com/' },
      { rank: 3, title: '2026 年最值得关注的 10 双球鞋', heat: '198回复', url: 'https://bbs.hupu.com/' },
      { rank: 4, title: '跑步鞋和篮球鞋怎么选？老哥们给点建议', heat: '167回复', url: 'https://bbs.hupu.com/' },
      { rank: 5, title: 'NB 550 vs AF1，日常穿搭哪个更百搭', heat: '142回复', url: 'https://bbs.hupu.com/' },
      { rank: 6, title: '国产球鞋现在水平到底怎么样？', heat: '118回复', url: 'https://bbs.hupu.com/' },
    ],
  },
  {
    source: 'sneakernews',
    sourceName: 'Sneaker News',
    listName: 'Latest News',
    updatedAt: now,
    items: [
      { rank: 1, title: 'Air Jordan 4 "Military Blue" Release Date', url: 'https://sneakernews.com/' },
      { rank: 2, title: 'Nike Air Max 1 "Big Bubble" Returns This Summer', url: 'https://sneakernews.com/' },
      { rank: 3, title: 'adidas Originals Samba Gets a Premium Suede Makeover', url: 'https://sneakernews.com/' },
      { rank: 4, title: 'New Balance 990v6 "Grey" Restock Confirmed', url: 'https://sneakernews.com/' },
      { rank: 5, title: 'Converse x Comme des Garçons PLAY Chuck 70', url: 'https://sneakernews.com/' },
      { rank: 6, title: 'Puma Speedcat OG "Red" Official Images', url: 'https://sneakernews.com/' },
    ],
  },
  {
    source: 'hypebeast',
    sourceName: 'Hypebeast',
    listName: 'Footwear',
    updatedAt: now,
    items: [
      { rank: 1, title: 'Nike and NOCTA Reunite for New Air Force 1 Collection', url: 'https://hypebeast.com/' },
      { rank: 2, title: 'Salomon Expands XT-6 Lineup With New Colorways', url: 'https://hypebeast.com/' },
      { rank: 3, title: 'JJJJound x New Balance 992 Release Info', url: 'https://hypebeast.com/' },
      { rank: 4, title: 'A Ma Maniére x Air Jordan 5 "Black" Detailed Look', url: 'https://hypebeast.com/' },
      { rank: 5, title: 'CLOT x Nike Air Max DN Official Announcement', url: 'https://hypebeast.com/' },
      { rank: 6, title: 'Birkenstock 1774 Collection Gets High-Fashion Update', url: 'https://hypebeast.com/' },
    ],
  },
  {
    source: 'nicekicks',
    sourceName: 'Nice Kicks',
    listName: 'Top Stories',
    updatedAt: now,
    items: [
      { rank: 1, title: 'Where to Buy the Nike Dunk Low "Panda" Restock', url: 'https://www.nicekicks.com/' },
      { rank: 2, title: 'Best Sneaker Releases This Week', url: 'https://www.nicekicks.com/' },
      { rank: 3, title: 'Kobe Brand Continues Legacy With New Protro Models', url: 'https://www.nicekicks.com/' },
      { rank: 4, title: 'Yeezy Slide Restock: Everything You Need to Know', url: 'https://www.nicekicks.com/' },
      { rank: 5, title: 'How to Style Air Jordan 1 Low for Summer', url: 'https://www.nicekicks.com/' },
      { rank: 6, title: 'Sneaker Resale Market Trends in 2026', url: 'https://www.nicekicks.com/' },
    ],
  },
];

export const PLATFORM_SOURCES = mockPlatforms.map((p) => p.source);

export function getMockPlatform(source) {
  const platform = mockPlatforms.find((p) => p.source === source);
  if (!platform) {
    return null;
  }
  return toHotPlatformResponse(platform);
}

export function getAllMockPlatforms() {
  return mockPlatforms.map((p) => toHotPlatformResponse(p));
}

/** 转为符合 HotPlatform 类型的响应，每次请求刷新 updatedAt */
function toHotPlatformResponse(platform) {
  return {
    source: platform.source,
    sourceName: platform.sourceName,
    listName: platform.listName,
    updatedAt: new Date().toISOString(),
    items: platform.items.map((item) => ({ ...item })),
    error: false,
  };
}
