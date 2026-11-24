<div align="center">

# IYKYK (If You Know You Know)

面向朋友间的轻量默契度测试应用，无需注册，用具体问题量化彼此的「认知温差」。

[![在线体验](https://img.shields.io/badge/在线体验-iykyk.xlumi.cn-2563eb?style=flat-square)](https://iykyk.xlumi.cn)
![Stack](https://img.shields.io/badge/React%2019-Express%20%2B%20SQLite-0f172a?style=flat-square)
![Platform](https://img.shields.io/badge/Platform-Web%20H5-16a34a?style=flat-square)

</div>

## ✨ 核心功能

- 🎯 **开箱即测**：无需注册登录，输入昵称即可挑战默认问卷或好友分享的专属问卷，1–5 分直觉作答，提交前可随时在概览页回改任意题目
- 📊 **认知温差报告**：自动计算默契度百分比，提炼分歧最大的 **GAPS（认知温差）** 与想法一致的 **MATCHES（高频共鸣）**
- ✍️ **可视化出题与查分**：支持自由编辑题目、从内置题库抽题、拖拽排序及设置「仅限作答一次」；发布后生成短链、二维码与分享海报，出题人可凭密语查看全部作答记录
- 💾 **自托管单体全栈**：已由早期 Serverless 架构重构为 React 19 + Vite 6 + Express 4 + SQLite（`better-sqlite3` WAL 模式），响应迅速且部署简单

## 🚀 本地运行

### 前置条件

- Node.js 20+

### 安装与启动

```bash
npm install
cp .env.example .env    # 按需调整 PORT、HOST、DB_PATH（Windows 本地请改为可写路径）
npm run dev             # 默认监听 http://127.0.0.1:3300
```

### 生产构建与校验

```bash
npm run lint            # TypeScript 类型检查
npm run build           # 构建前端 dist/ 与单文件服务端 build/server.cjs
npm start               # 启动 API 与健康检查（/api/*、/healthz）
```

> 生产环境通常由 Nginx 托管静态目录 `dist/`，并将 `/api/*` 与 `/healthz` 反向代理至 `node build/server.cjs`。
