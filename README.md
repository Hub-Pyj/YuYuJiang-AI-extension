# YuYuJiang-AI-extension
# AI 悬浮助手 · AI Floating Chat

一个 **Manifest V3 Chrome 扩展程序**，在任意网页上提供一个毛玻璃 / 液态玻璃风格的
AI 对话悬浮窗。它运行在隔离世界 + Shadow DOM 中，`z-index` 凌驾于网页之上，
不受页面刷新、卡顿影响。

> 注意：这是**浏览器扩展程序（Extension）**，不是网页内脚本 / 用户脚本，也不是
> 通过控制台粘贴运行的网页插件。请按下文“安装”步骤以“加载已解压的扩展程序”
> 方式载入。

---

## ✨ 功能一览

- **悬浮球 ↔ 对话框**：初始为右下角圆形悬浮球，点击展开为浏览器右侧靠边的
  长方形圆角对话框；点开后悬浮球隐藏；对话框右上角 `✕` 可缩小回悬浮球。
  两者均可自由拖动，位置会被记住。
- **状态持久 & 抗刷新**：所有设置、对话、位置、Token 用量都保存在
  `chrome.storage.local`，网页刷新 / 卡顿不会丢失；即使页面脚本移除 DOM，
  扩展也会自动把悬浮窗挂回页面。
- **二级菜单**（对话框左上角 `☰`）：新建对话、在已有对话间切换、删除对话；
  菜单底部进入三级“设置”。
- **三级设置 → 四级页面**：
  - **材质**：切换「毛玻璃 / 液态玻璃」，调节 **透明度 / 高斯模糊 / SVG 折射**，
    并可一键恢复本档默认；语言（中文 / English）切换也在此。
  - **配置大模型**：接口模板（**OpenAI 默认 / DeepSeek 默认 / 自定义**）、
    Base URL、对话路径、API Key、模型名称、附加请求头（JSON），以及 Token 用量与阈值。
- **未配置即禁用发送**：若未填写接口与 API Key，回车不会发送，输入框提示前往配置。
- **流式对话**：回复逐字流式渲染，支持 Markdown（代码块 / 行内代码 / 加粗）。
- **上传图片**：可附带多张图片（≤4MB/张），以 OpenAI 多模态 `image_url` 结构发送。
- **深度思考**：开关式按钮，开启后注入系统提示，并渲染模型返回的 `reasoning_content`。
- **多开对话**：可创建任意数量的独立会话。
- **Token 用量提醒**：默认阈值 **20,000,000**（2000 万）Token；达到 80% 变黄、
  超过变红并提示；支持自定义阈值与一键重置。若接口返回 `usage` 则按真实值累计，
  否则本地估算。
- **交互细节**：点击空白处可关闭菜单与设置；**点击空白不会关闭对话框**，
  对话框只能通过右上角 `✕` 手动缩回悬浮球。

---

## 🎨 UI 材质

参考同作者项目 `YuYuJiang-Translation` 的材质体系实现：

| 材质 | 效果 |
| --- | --- |
| 毛玻璃（默认） | 半透明 + `backdrop-filter: blur()` + 光泽渐变 |
| 液态玻璃 | 在上述基础上叠加 **SVG 折射滤镜**（`feTurbulence` + `feDisplacementMap`）+ 镜面高光层 |

两档材质各自保存 **透明度 / 高斯模糊 / SVG 折射** 三个参数，互不影响。
SVG 折射仅在液态玻璃下生效。

---

## 📦 安装方法

1. 下载并解压 `ai-floating-chat.zip`，得到 `ai-floating-chat/` 文件夹。
2. 打开 Chrome，访问 `chrome://extensions/`。
3. 打开右上角 **开发者模式**。
4. 点击 **加载已解压的扩展程序**，选择 `ai-floating-chat/` 文件夹。
5. 打开任意网页，右下角出现悬浮球即可使用。首次使用请先进入
   `☰ → 设置 → 配置大模型` 填写接口与 API Key。
   

> 也可通过扩展图标弹出的小面板popup.html快速查看配置状态并跳到配置页。

---

## 🔧 接口说明

请求统一由后台 Service Worker（`background.js`）发出，扩展拥有 `<all_urls>`
主机权限，因此**不受页面 CORS 限制**，可访问 OpenAI / DeepSeek / 自建兼容接口。

- **OpenAI 默认模板**：`https://api.openai.com/v1` + `/chat/completions`
- **DeepSeek 默认模板**：`https://api.deepseek.com/v1` + `/chat/completions`
  （DeepSeek 兼容 OpenAI 协议）
- **自定义模板**：自行填写 Base URL 与对话路径，适用于任何 OpenAI 兼容服务。

请求体遵循 OpenAI Chat Completions：`{ model, messages, stream: true, stream_options }`，
并解析 SSE `data:` 流。若接口返回非流式 JSON，也会自动兼容。

---

## 📁 目录结构

```
ai-floating-chat/
├── manifest.json      # MV3 清单
├── background.js      # Service Worker：代理大模型请求、SSE 流式解析
├── content.js         # 悬浮窗主体（Shadow DOM：UI / 材质 / 菜单 / 对话）
├── popup.html / popup.js  # 工具栏弹窗：配置状态与跳转
├── icons/             # 扩展图标
└── README.md
```

---

## ⚠️ 说明

- 所有数据仅保存在本地浏览器（`chrome.storage.local`），不会上传到第三方。
- API Key 以明文存储于本地扩展存储，请自行注意安全。
- Token 累计基于接口返回的 `usage` 或本地估算，仅供参考。

License: MIT
