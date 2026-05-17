***这个Readme是AI写的，我就稍微改了一下，仅供参考。***

# IYKYK
一款极其轻量、纯前端运行的“双人默契度测试” H5 网页应用。无需注册，开箱即用，支持自由出题并生成专属分享链接。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Web-orange.svg)]()

## 🌟 项目亮点

- **🚫 零后端依赖**：完全不依赖任何后端服务器和数据库，100% 纯前端运行。
- **🔒 隐私与去中心化**：所有的试卷题目、选项以及出题人昵称，全部通过压缩与加密算法（JSON -> Base64）直接编码进 URL 链接中，服务器不存储任何数据，绝对保障隐私。
- **⚡ 极速访问**：由于是纯静态单页应用 (SPA)，可完美托管于 Vercel 或 Cloudflare Pages 等免费平台，国内配合自定义域名可实现秒开。
- **📱 移动端优化**：针对微信、QQ 等手机端内置浏览器进行了专门的 UI 适配，答题交互丝滑顺畅。

## 🚀 在线体验

👉 **点击直接体验：** [https://lumine.p8.ink](https://lumine.p8.ink)

## 🎮 玩法介绍

没写。等会吧。

---

## 🛠️ 核心实现原理

本项目巧妙利用了浏览器的 URL 传参机制来实现数据的动态传递：

- **数据打包**：出题人在前端配置好题目后，应用将试卷的 JSON 对象进行序列化，转化为 URL 安全的 Base64 字符串。
- **动态解析**：分享的链接格式形如 `https://domain.com/#/quiz?d=<Base64加密串>`。答题人打开链接时，前端的 JS 脚本会自动拦截并解码该参数，动态渲染出对应的试卷内容，从而完美避开了传统全栈应用对数据库的依赖。


## 📦 本地开发与部署

如果你想在此项目的基础上进行二次开发，或者部署一套属于自己的网站：

### 1. 本地运行
```bash
# 克隆仓库
git clone [https://github.com/你的用户名/你的仓库名.git](https://github.com/你的用户名/你的仓库名.git)

# 进入项目目录
cd 你的仓库名

# 如果使用了 Vite/Vue/React 等框架，请先安装依赖（若是纯 HTML 项目可跳过）
npm install

# 启动本地开发服务器
npm run dev
```

## 📦 一键部署至 Vercel

本项目是纯静态网页，非常适合免费部署在 Vercel：

1. 将本项目 Fork 或 Push 到你自己的 GitHub 仓库。

2. 登录 Vercel，导入该 GitHub 仓库。

3. 点击 Deploy，等待十几秒即可完成部署。

4. (强烈建议) 在 Vercel 的 Settings -> Domains 中绑定你自己的个人域名，以获得国内最佳的访问速度。

## 🤝 贡献指南
我们非常欢迎互动的 PR 和 Issue！如果你有更好的 UI 设计想法、想增加更有趣的动效，或者发现了 Bug，欢迎随时提 Issue 或提交 Pull Request。

## 📄 开源协议
本项目基于 MIT 协议开源，你可以自由地复制、修改和商业化使用。
