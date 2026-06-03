# 今日球鞋热搜 · 技术设计文档（完整版）

> 本文档用于指导 AI 和开发者理解项目的技术实现。零基础学员可以只关注“前后端分工”和“数据长什么样”部分。

---

## 1. 技术栈总览

| 部分 | 技术 | 用途 |
|------|------|------|
| 前端框架 | React 18 + TypeScript | 构建页面组件，提供类型安全 |
| 构建工具 | Vite | 快速开发和打包 |
| 样式 | CSS Modules | 组件级样式，避免冲突 |
| 后端运行时 | Node.js | 运行 JavaScript 服务器 |
| 后端框架 | Express | 处理 HTTP 请求，定义 API 路由 |
| RSS 解析 | rss-parser | 解析海外平台的 RSS 订阅源 |
| HTML 解析（备选） | cheerio | 如果国内平台需要解析网页 |
| 缓存 | 内存 Map + TTL | 存储各平台数据，定时过期 |
| 部署前端 | Vercel | 自动构建和托管静态页面 |
| 部署后端 | Railway | 托管 Node.js 服务，支持环境变量 |

---

## 2. 项目结构（完整版）

```
mini-sneaker-hub/
│
├── client/                      # 前端项目（Vite + React）
│   ├── public/                  # 静态资源（favicon等）
│   ├── src/
│   │   ├── components/
│   │   │   ├── HotCard.tsx      # 单个平台卡片组件
│   │   │   ├── HotCard.module.css
│   │   │   ├── Layout.tsx       # 整体布局（头部、页脚）
│   │   │   └── Layout.module.css
│   │   ├── api/
│   │   │   └── hot.ts           # 封装向后端请求的函数
│   │   ├── types/
│   │   │   └── hot.ts           # TypeScript 类型定义
│   │   ├── pages/
│   │   │   └── Home.tsx         # 首页，展示全部卡片
│   │   ├── mock/
│   │   │   └── hot.json         # 后备 Mock 数据（当后端不可用）
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts           # Vite 配置（含代理设置）
│   └── package.json
│
├── server/                      # 后端项目（Express）
│   ├── routes/
│   │   └── hot.js               # 定义 /api/hot/* 路由
│   ├── services/
│   │   ├── shihuo.js            # 识货网数据抓取逻辑
│   │   ├── dewu.js              # 得物数据抓取逻辑
│   │   ├── hupu.js              # 虎扑数据抓取逻辑
│   │   ├── sneakernews.js       # Sneaker News RSS 解析
│   │   ├── hypebeast.js         # Hypebeast RSS 解析
│   │   └── nicekicks.js         # Nice Kicks RSS 解析
│   ├── utils/
│   │   └── cache.js             # 内存缓存工具（Map + TTL）
│   ├── index.js                 # Express 入口，启动服务器
│   └── package.json
│
├── .gitignore
├── README.md                    # 项目说明、本地运行指南
├── RESEARCH.md                  # Day3 需求调研
├── PRD.md                       # Day4 产品需求文档
├── TECH_DESIGN.md               # 本文件
└── AGENTS.md                    # Day6 AI 开发指令
```

---

## 3. 数据模型（TypeScript 类型定义）

### 3.1 单条热搜项 `HotItem`

```typescript
interface HotItem {
  rank: number;        // 排名 1,2,3...
  title: string;       // 标题文本
  heat?: string;       // 热度（可选，海外平台可以为空）
  url: string;         // 点击跳转的完整链接
}
```

### 3.2 单个平台数据 `HotPlatform`

```typescript
interface HotPlatform {
  source: string;      // 平台标识：shihuo, dewu, hupu, sneakernews, hypebeast, nicekicks
  sourceName: string;  // 显示名称：识货、得物、虎扑、Sneaker News 等
  listName: string;    // 榜单名称，如“热门榜”“本周流行”
  updatedAt: string;   // ISO8601 时间字符串，例如 "2025-06-03T10:30:00.000Z"
  items: HotItem[];    // 该平台的热搜列表，至少包含 10 条
  error?: boolean;     // 是否出错（可选，出错时为 true）
  message?: string;    // 错误提示信息（可选）
}
```

### 3.3 全量接口响应（`GET /api/hot`）

```typescript
type AllHotResponse = HotPlatform[];
```

---

## 4. API 接口规范

所有接口返回 `Content-Type: application/json`，并支持 CORS（开发环境允许本地前端）。

| 方法 | 路径 | 功能 | 返回示例 |
|------|------|------|----------|
| GET | `/api/hot` | 返回全部 6 个平台数据（数组） | `[{source:"shihuo", ...}, {...}]` |
| GET | `/api/hot/shihuo` | 仅返回识货数据 | `{source:"shihuo", ...}` |
| GET | `/api/hot/dewu` | 仅返回得物数据 | 同上 |
| GET | `/api/hot/hupu` | 仅返回虎扑数据 | 同上 |
| GET | `/api/hot/sneakernews` | 仅返回 Sneaker News 数据 | 同上 |
| GET | `/api/hot/hypebeast` | 仅返回 Hypebeast 数据 | 同上 |
| GET | `/api/hot/nicekicks` | 仅返回 Nice Kicks 数据 | 同上 |
| GET | `/api/health` | 健康检查 | `{ok: true}` |

### 响应示例（成功）

```json
{
  "source": "shihuo",
  "sourceName": "识货",
  "listName": "热门球鞋榜",
  "updatedAt": "2025-06-03T10:30:00.000Z",
  "items": [
    { "rank": 1, "title": "Air Jordan 1 芝加哥复刻", "heat": "12.3w", "url": "https://shihuo.com/..." },
    { "rank": 2, "title": "Yeezy 350 黑红字补货", "heat": "9.8w", "url": "https://shihuo.com/..." }
  ]
}
```

### 响应示例（失败）

```json
{
  "source": "hupu",
  "sourceName": "虎扑",
  "listName": "装备区热帖",
  "updatedAt": "2025-06-03T10:30:00.000Z",
  "items": [],
  "error": true,
  "message": "数据获取失败，请稍后重试"
}
```

---

## 5. 缓存策略

- **实现方式**：在 `server/utils/cache.js` 中使用 JavaScript `Map` 对象存储。
- **缓存键**：`${source}`（例如 `shihuo`）。
- **缓存值**：`{ data: HotPlatform, expiresAt: number }`。
- **TTL 默认值**：600 秒（10 分钟）。可通过环境变量 `CACHE_TTL` 全局覆盖。
- **差异化 TTL**（建议，但非 MVP 强制）：
  - 国内平台：300 秒（5 分钟，变化快）
  - 海外 RSS：900 秒（15 分钟，更新慢）
- **刷新方式**：
  - 每次请求先检查缓存是否过期。
  - 若过期或不存在，则调用对应的 `services/*.js` 抓取最新数据，写入缓存后返回。
  - 支持 URL 参数 `?refresh=1` 强制跳过缓存（仅开发/调试用）。

---

## 6. 数据抓取方案（按平台）

| 平台 | 方案 | 所需依赖 | 难度 |
|------|------|----------|------|
| 识货 | 优先寻找公开 API，若无则解析网页 | `axios`, `cheerio` | 中等 |
| 得物 | 同上 | `axios`, `cheerio` | 中等 |
| 虎扑 | 虎扑装备区热帖（JSON 接口或 HTML） | `axios`, `cheerio` | 较低 |
| Sneaker News | RSS 订阅 `https://sneakernews.com/feed` | `rss-parser` | 低 |
| Hypebeast | RSS `https://hypebeast.com/feed` | `rss-parser` | 低 |
| Nice Kicks | RSS `https://nicekicks.com/feed` | `rss-parser` | 低 |

### 通用要求
- 所有请求必须设置合理的 `User-Agent`（例如 `Mozilla/5.0 ...`）。
- 请求频率控制：每个平台至少间隔 2 秒（使用 `setTimeout` 或队列）。
- 错误处理：任何网络错误或解析异常都应捕获，并返回 `error: true`，不抛出导致整个后端崩溃。

---

## 7. 开发环境配置

### 7.1 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `PORT` | 后端监听端口 | `3001` |
| `CACHE_TTL` | 全局缓存秒数（默认 600） | `600` |
| `CLIENT_ORIGIN` | 生产环境前端域名，用于 CORS | `https://你的前端域名.vercel.app` |

### 7.2 Vite 代理设置

在 `client/vite.config.ts` 中配置，使前端开发时 `/api` 请求转发到本地后端：

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

### 7.3 同时启动前后端

在项目根目录创建 `package.json`（可选），添加 scripts：

```json
{
  "scripts": {
    "dev:client": "cd client && npm run dev",
    "dev:server": "cd server && npm run dev",
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\""
  }
}
```

需要先安装 `concurrently`（`npm install -D concurrently`）。

---

## 8. 部署配置

### 前端（Vercel）
- 根目录设置：`client`
- 构建命令：`npm run build`
- 输出目录：`dist`
- 环境变量：`VITE_API_BASE` 设置为后端 Railway 域名（例如 `https://xxx.up.railway.app`）

### 后端（Railway）
- 启动命令：`node index.js` 或 `npm start`
- 环境变量：`PORT`, `CACHE_TTL`, `CLIENT_ORIGIN`（设为 Vercel 前端域名）

---

## 9. 错误处理与降级原则

1. **单平台失败不影响全局**：后端的 `/api/hot` 接口应并行抓取所有平台（`Promise.allSettled`），失败平台返回 `error: true`，成功平台正常返回。
2. **前端展示**：每个 `HotCard` 独立接收 `error` 状态，显示“加载失败”文案和重试按钮。
3. **缓存降级**：如果抓取失败但缓存中有旧数据（未过期），可以继续返回旧数据，并在 `message` 中标注“数据可能不是最新”。
4. **全局兜底**：如果所有平台都失败，前端显示友好错误提示，建议稍后刷新。

---

## 10. 安全性 & 合规

- 不得将任何 API 密钥、私有 token 提交到公开仓库（使用环境变量）。
- 页脚必须包含：
  - “本站为个人学习项目，不用于商业用途”
  - “数据来源于各平台公开内容，版权归原作者所有”
  - “更新频率约 X 分钟”（X 对应实际缓存 TTL）
- 控制抓取频率，避免对目标平台造成压力。

---

> **文档版本**：v1.0  
> **更新日期**：2025-06-03  
> **对应项目**：今日球鞋热搜（mini-sneaker-hub）
