_<p align="center"> 💡 提示：这个 Readme 是由 AI 辅助编写并经过人工修改的，仅供参考。 </p>_

<h1 align="center">IYKYK (If You Know You Know)</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
  <a href="#"><img src="https://img.shields.io/badge/platform-Web-orange.svg" alt="Platform"></a>
</p>

这是一款极其轻量的 <b>“默契度测试”</b> H5 网页应用，用来测试朋友之间“认知温差”的互动网页小测验。无需注册，开箱即用。

通过量化的方式，对比“自评”与“他评”的差异；抛开星座和 MBTI 的评判标准（刻板印象），用最具体的细节来衡量你们之间的默契与了解程度。

> _名字灵感来源于 ILLIT 的歌曲《IYKYK》，取一样的意思——“懂得都懂”。来看看你眼中的我和我眼中的自己有什么区别？_

---

## 🌟 项目亮点

- **🚫 零后端依赖**：完全不依赖任何后端服务器和数据库，100% 纯前端运行。


- **🔒 隐私与去中心化**：所有的试卷题目、选项以及出题人昵称，全部通过压缩与加密算法（`JSON -> Base64`）直接编码进 URL 链接中，服务器不存储任何数据。


- **⚡ 极速访问**：纯静态单页应用 (SPA)，完美适配 Vercel、Cloudflare Pages、GitHub Pages 等免费托管平台。


- **📱 移动端优化**：针对微信、QQ 等手机端内置浏览器进行了专门的 UI 适配，体验丝滑。

- **🚀 在线体验**: 👉 **[点击这里体验：来自 Lumine 的 Quiz](https://iykyk.xlumi.cn/)**

## 🎮 玩法介绍

1. **输入名字**

   首先作为答题者，输入你的名字，即可开始挑战。

   
3. **直觉打分**

    屏幕上会依次出现若干条关于 Quiz 主人的描述。你需要依靠自己对主人的认知与直觉，给每一条描述打分：
   - `1`：完全不符合
   - `...`
   - `5`：完全符合


5. **答题概览**

   所有题目答完后，会进入答题概览页。在这里你可以一览所有题目和你的打分。觉得哪里直觉不对？随时点击题目回到那一题修改分数。


7. **生成专属报告**

   点击提交后，测算引擎会把你的答案与测验主人的标准答案进行比对，生成一份专属的**重合度报告**：
   - 📊 **默契度评分**：用直观的百分比告诉你，你有多懂 Ta。
   - 🧊 **认知温差 (GAPS)**：深度解析你们评分差距最大的题目，揭示认知分岔点。
   - 🔥 **高频共鸣 (MATCHES)**：列出你们想法惊人一致的瞬间，见证绝对默契。

## 🧾 如何定制你的专属测验？

🚧 我还没写。

*(目前你可以通过修改源码中的 JSON 配置文件来硬编码你的题目，可视化出题功能即将上线。)*

---

## 🛠️ 核心实现原理

本项目巧妙利用了浏览器的 URL 传参机制来实现数据的动态传递：

- **数据打包**：出题人在前端配置好题目后，应用将试卷的 JSON 对象进行序列化，转化为 URL 安全的 Base64 字符串。
- **动态解析**：分享的链接格式形如 `https://domain.com/#/quiz?d=<Base64加密串>`。答题人打开链接时，前端的 JS 脚本会自动拦截并解码该参数，动态渲染出对应的试卷内容，从而完美避开了传统全栈应用对数据库的依赖。

## 📦 本地开发与运行

如果你想在此项目的基础上进行二次开发，请按照以下步骤进行：

```bash
# 1. 克隆仓库 (请将 URL 替换为实际的项目地址)
git clone [https://github.com/your-username/iykyk.git](https://github.com/your-username/iykyk.git)

# 2. 进入项目目录
cd iykyk

# 3. 安装依赖（如果使用了 Vite/Vue/React 等框架，纯 HTML 项目可跳过）
npm install # 或 pnpm install / yarn

# 4. 启动本地开发服务器
npm run dev
```

## ☁️ 一键部署至 Vercel

本项目是纯前端应用，非常适合免费、零配置部署在 Vercel。只需几分钟，你就能拥有一个全球 CDN 加速的专属网站。

- 第一步：准备代码

  1. 点击本项目右上角的 Fork 按钮，将代码复制到你自己的 GitHub 账号下。

  2. [可选] 如果你想直接在本地修改题目，可以将代码 Clone 到本地，修改完再 Push 上去。

- 第二步：导入 Vercel

  1. 打开 Vercel 官网 并使用 GitHub 账号登录。
  
  2. 在控制台右上角点击 Add New... -> Project。

  3. 在左侧的 "Import Git Repository" 列表中，找到你刚刚 Fork 的 iykyk 仓库，点击 Import。

- 第三步：配置与部署

  1. Configure Project (项目配置)
     Project Name: 可以自定义一个好听的名字（如 my-iykyk）。
     Framework Preset: 如果是纯 HTML 则无需修改；如果是 Vue/React，Vercel 通常会自动识别。
     Build and Output Settings: 保持默认即可。

  2. 点击下方的 Deploy 按钮。

  3. 等待大约 15~30 秒，看到满屏撒花的 Congratulations! 页面，说明部署成功！

## 🤝 贡献指南

我们非常欢迎互动的 PR 和 Issue！
如果你有更好的 UI 设计想法、想增加更有趣的动效，或者发现了 Bug，欢迎随时提 Issue 或提交 Pull Request。

## 📄 开源协议

本项目基于 MIT 协议开源。你可以自由地学习、复制、修改以及用于商业用途，只需保留原作者的版权声明即可。