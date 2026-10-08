/* =========================================================================
 *  YuYuJiang-AI-extension · content.js (v8) —— 与 browser-scripts/ai-floating-chat.js 同源（自包含 Shadow DOM 组件）  YuYuJiang-AI-extension
 * ========================================================================= */
(function () {
  'use strict';
  if (window.__AI_FLOATING_CHAT_LOADED__) return;
  window.__AI_FLOATING_CHAT_LOADED__ = true;
/* =========================================================================
 *  YuYuJiang-AI-extension
 *  https://github.com/Hub-Pyj/YuYuJiang-AI-extension
 *  By:Hub-Pyj
 *  ---------------------------------------------------------------------
 *  · 点击右下角悬浮球 → 直接打开「聊天对话页面」（不是菜单！）
 *  · 对话框右上角汉堡菜单 ☰：新对话 / 对话记录 / 深度思考 / 模型名称 / 设置
 *  · 对话框仅通过右上角 ✕ 关闭；点击空白只关闭菜单与设置
 *  · 未配置大模型也能查看/切换对话，仅发送被禁用
 *  · 毛玻璃(默认) / 液态玻璃(SVG折射) 双材质，透明度·高斯模糊·SVG折射可调
 *  · 配置大模型：可自定义多个模型名称（列表），再到对话框菜单里选择
 *  · 中英文双语 · 多开对话 · 上传图片 · 深度思考 · Token 用量提醒(默认2000万)
 * ========================================================================= */
async function run(args) {
  const NS = "__AI_FLOATING_CHAT_V1__";
  const STORAGE_KEY = "aiFloatingChatState";
  const Z = 2147483600;
  const DIALOG_W = 400;
  const DIALOG_H = 620;

  try { const p = globalThis[NS]; if (p && p.destroy) p.destroy(); } catch (e) { /* ignore */ }

  /* ------------------------------------------------------------- 模板 */
  const TEMPLATES = {
    openai:   { apiBase: "https://api.openai.com/v1",   chatPath: "/chat/completions", models: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"] },
    deepseek: { apiBase: "https://api.deepseek.com", chatPath: "/chat/completions", models: ["deepseek-flash", "deepseek-v4-pro", "deepseek-chat"] },
    custom:   { apiBase: "",                            chatPath: "/chat/completions", models: [] }
  };
  const DEEP_THINK_PROMPT =
    "You are in deep-thinking mode. Reason carefully step by step before answering, then give a clear, well-structured final answer.";

  /* ------------------------------------------------------------- i18n */
  const I18N = {
    zh: {
      appName: "AI 助手", fabTitle: "打开 AI 助手", newChat: "＋ 新对话", chats: "对话记录",
      emptyChats: "暂无对话", settings: "设置", delete: "删除", confirmDelete: "确定删除该对话吗？",
      untitled: "新对话", material: "材质", modelConfig: "配置大模型", uiLang: "界面语言",
      uiLangZh: "中文", uiLangEn: "English", materialType: "UI 材质", matGlass: "毛玻璃", matLiquid: "液态玻璃",
      opacity: "透明度", blur: "高斯模糊", refraction: "SVG 折射", reset: "↺ 恢复本档默认",
      materialHint: "拖动滑杆即时预览。「SVG 折射」仅在液态玻璃下生效。",
      template: "接口模板", tplCustom: "自定义", apiBase: "接口地址（Base URL）", chatPath: "对话接口路径",
      apiKey: "API Key", modelName: "模型名称", extraHeaders: "附加请求头（可选，JSON）", fillDefault: "填入该模板默认值",
      modelsLabel: "模型列表（可添加多个，聊天时选择）", addModelPlaceholder: "输入模型名称，如 gpt-4o-mini",
      add: "添加", loadDefaults: "载入模板默认模型", currentMark: "当前", remove: "移除",
      noModels: "尚未添加模型，请先到「设置 → 配置大模型」添加并确定。",
      configured: "✔ 已配置，可以对话", notConfiguredTip: "未配置接口与 API Key，回车发送已禁用",
      tokenUsage: "Token 用量", tokenLimitLabel: "用量提醒阈值（Token）", resetUsage: "重置用量",
      tokenWarn: "Token 用量已接近提醒阈值", tokenOver: "Token 用量已超过提醒阈值",
      tokenOverBanner: "⚠️ 已超过指定 {limit} token 限制用量，请注意消耗",
      inputPlaceholder: "输入消息",
      inputPlaceholderLocked: "输入消息",
      needConfig: "尚未配置接口与 API Key，无法发送。请在「设置 → 配置大模型」中完成配置。",
      disclaimerTitle: "免责声明", disclaimerAccept: "接受", disclaimerReject: "拒绝", disclaimerBody: "【YuYuJiang AI 扩展 · 免责声明】\n\n本扩展程序（YuYuJiang AI extension）是开源学习项目，作者 Hub-Pyj。\n项目地址：https://github.com/Hub-Pyj/YuYuJiang-AI-extension\n开源协议：MIT License（可自由使用、修改、分发，但须保留版权声明）。\n本工具仅供学习与研究使用，严禁用于任何商业用途。\n\n使用须知与免责条款：\n1. 本扩展按「现状」提供，不附带任何明示或暗示的担保，包括但不限于适销性、特定用途适用性及不侵权担保。\n2. 使用前需自行配置第三方大模型 API（如 OpenAI、DeepSeek 等），相关账号、密钥与费用均由使用者自行承担，与本项目及作者无关。\n3. 你在本扩展中输入或上传的内容（文字、图片、文件）将发送至你自行配置的第三方接口，请勿上传涉密、敏感或侵犯他人权益的内容；由此产生的数据泄露、版权等风险由使用者自行承担。\n4. 联网搜索功能会向第三方搜索服务发起请求，结果仅供参考，作者不对其准确性、完整性、时效性负责。\n5. 作者不对因使用或无法使用本扩展而造成的任何直接或间接损失承担责任。\n6. 使用者应遵守所在地区法律法规及第三方服务的条款，因违规使用产生的一切后果由使用者自行承担。\n\n继续使用即表示你已阅读、理解并同意以上全部条款。若不同意，请点击「拒绝」。",
      darkMode: "深色模式", darkOnMsg: "深色模式已开启", darkOffMsg: "深色模式已关闭", darkLockHint: "深色模式下已锁定毛玻璃材质，可调节毛玻璃参数；关闭深色模式后可再次切换材质。",
      deepThink: "深度思考", upload: "上传文件", uploadImage: "上传图片", uploadFile: "上传文件", uploadLimitHint: "图片≤8MB最多10张 / 文件≤50MB仅限1个", send: "发送", stop: "停止", reasoning: "思考过程",
      webSearch: "联网搜索", searchingTip: "正在联网搜索…", searchSources: "联网来源", searchingNoResult: "未搜到有效结果，将基于已有知识回答", searchCtxOpened: "本轮回答已开启并执行联网搜索。", searchCtxNoResult: "本轮联网搜索已执行，但未返回可用结果，请基于你的知识回答并说明这一点。",
      searchOn: "联网搜索已开启", searchOff: "联网搜索已关闭", searchEmpty: "未找到联网结果，将直接作答",
      deepOnMsg: "深度思考已开启", deepOffMsg: "深度思考已关闭",
      you: "你", ai: "AI", imageTooLarge: "图片过大（单张请小于 8MB）", tooManyImages: "最多上传 10 张图片", fileTooLarge: "文件过大（单个请小于 50MB）", imageFormatOnly: "仅支持图片格式（PNG/JPG/GIF/WebP/BMP）", fileExtracting: "正在提取文件内容…", fileParseFail: "文件解析失败或内容为空", textOnlyNoFile: "当前模型为纯文本模型，不支持上传文件，请使用「上传图片」", requestError: "请求失败",
      templateCustomHint: "自定义模板：请填写完整 Base URL 与对话路径。",
      emptyTip: "👋 首次使用请先在 ☰ → 设置 → 配置大模型，填写你的接口地址与 API Key。\n\n⚠️ 默认的 OpenAI 接口地址仅为示例，不可直接使用，请替换为你自己的可用地址与密钥。\n\n配置完成后即可开始对话：Enter 换行，点击发送按钮发送；支持图片上传与深度思考。",
      emptyTipLocked: "⚠️ 尚未配置：请先在 ☰ → 设置 → 配置大模型，填写你的接口地址与 API Key。\n\n默认接口地址仅为示例，不可直接使用。",
      model: "模型", deepOn: "已开启", deepOff: "已关闭",
      testConn: "测试连通性", testing: "测试中…", testOk: "连通成功", testFail: "连接失败",
      testNeedConfig: "请先填写接口地址、API Key 并选择模型",
      copy: "复制", copied: "已复制", regen: "重新生成", codeCopy: "复制代码", showKey: "显示", hideKey: "隐藏"
    },
    en: {
      appName: "AI Assistant", fabTitle: "Open AI Assistant", newChat: "＋ New chat", chats: "Conversations",
      emptyChats: "No conversations", settings: "Settings", delete: "Delete", confirmDelete: "Delete this conversation?",
      untitled: "New chat", material: "Material", modelConfig: "Model Config", uiLang: "UI Language",
      uiLangZh: "中文", uiLangEn: "English", materialType: "UI Material", matGlass: "Frosted Glass", matLiquid: "Liquid Glass",
      opacity: "Opacity", blur: "Gaussian Blur", refraction: "SVG Refraction", reset: "↺ Reset this mode",
      materialHint: "Drag a slider to preview live. “SVG Refraction” works in Liquid Glass only.",
      template: "API Template", tplCustom: "Custom", apiBase: "Base URL", chatPath: "Chat path",
      apiKey: "API Key", modelName: "Model name", extraHeaders: "Extra headers (optional, JSON)", fillDefault: "Fill template defaults",
      modelsLabel: "Models (add several, pick when chatting)", addModelPlaceholder: "Model name, e.g. gpt-4o-mini",
      add: "Add", loadDefaults: "Load template default models", currentMark: "Current", remove: "Remove",
      noModels: "No models yet. Add & confirm them in Settings → Model Config first.",
      configured: "✔ Configured, ready to chat", notConfiguredTip: "No API key configured — Enter-to-send is disabled",
      tokenUsage: "Token usage", tokenLimitLabel: "Usage reminder threshold (tokens)", resetUsage: "Reset usage",
      tokenWarn: "Token usage is near the reminder threshold", tokenOver: "Token usage exceeded the reminder threshold",
      tokenOverBanner: "⚠️ Usage has exceeded the specified {limit}-token limit. Please watch your consumption.",
      inputPlaceholder: "Type a message",
      inputPlaceholderLocked: "Type a message",
      needConfig: "API & key not configured. Finish Settings → Model Config before sending.",
      disclaimerTitle: "Disclaimer", disclaimerAccept: "Accept", disclaimerReject: "Reject", disclaimerBody: "[YuYuJiang AI Extension · Disclaimer]\n\nThis extension (YuYuJiang AI extension) is an open-source learning project by Hub-Pyj.\nProject: https://github.com/Hub-Pyj/YuYuJiang-AI-extension\nLicense: MIT (free to use, modify and distribute, with the copyright notice retained).\nIt is intended for learning and research only; commercial use is strictly prohibited.\n\nTerms & Disclaimer:\n1. Provided “as is”, without any express or implied warranty, including merchantability, fitness for a particular purpose and non-infringement.\n2. You must configure a third-party LLM API (e.g. OpenAI, DeepSeek). Accounts, keys and fees are your sole responsibility and are unrelated to this project and its author.\n3. Text, images and files you enter or upload are sent to the third-party API you configured. Do not upload confidential, sensitive or infringing content; any data-leak or copyright risks are borne by you.\n4. Web search sends requests to third-party search services; results are for reference only and the author is not responsible for their accuracy, completeness or timeliness.\n5. The author is not liable for any direct or indirect loss arising from the use of, or inability to use, this extension.\n6. You must comply with local laws and the terms of third-party services; you bear all consequences of improper use.\n\nBy continuing you confirm that you have read, understood and accepted the terms above. If not, click “Reject”.",
      darkMode: "Dark mode", darkOnMsg: "Dark mode on", darkOffMsg: "Dark mode off", darkLockHint: "Material is locked to frosted glass in dark mode; turn off dark mode to switch again.",
      deepThink: "Deep Think", upload: "Upload file", uploadImage: "Upload image", uploadFile: "Upload file", uploadLimitHint: "Images ≤8MB (max 10) / File ≤50MB (1 only)", send: "Send", stop: "Stop", reasoning: "Reasoning",
      webSearch: "Web search", searchingTip: "Searching the web…", searchSources: "Web sources", searchingNoResult: "No results found; answering from existing knowledge", searchCtxOpened: "Live web search was enabled and executed for this reply.", searchCtxNoResult: "Live web search ran but returned no usable results; answer from your own knowledge and say so.",
      searchOn: "Web search on", searchOff: "Web search off", searchEmpty: "No web results found; answering directly",
      deepOnMsg: "Deep Think on", deepOffMsg: "Deep Think off",
      you: "You", ai: "AI", imageTooLarge: "Image too large (keep each under 8MB)", tooManyImages: "You can upload at most 10 images", fileTooLarge: "File too large (keep each under 50MB)", imageFormatOnly: "Images only (PNG/JPG/GIF/WebP/BMP)", fileExtracting: "Extracting file content…", fileParseFail: "Failed to parse file or file was empty", textOnlyNoFile: "This text-only model cannot upload files; use “Upload image” instead", requestError: "Request failed",
      templateCustomHint: "Custom template: provide a full Base URL and chat path.",
      emptyTip: "Start a conversation. Enter to send, Shift + Enter for newline.\nSupports image upload and Deep Think.",
      emptyTipLocked: "Fill API & key in 「☰ → Settings → Model Config」 first, then start chatting.",
      model: "Model", deepOn: "On", deepOff: "Off",
      testConn: "Test connection", testing: "Testing…", testOk: "Connected", testFail: "Failed",
      testNeedConfig: "Fill Base URL, API Key and pick a model first",
      copy: "Copy", copied: "Copied", regen: "Regenerate", codeCopy: "Copy code", showKey: "Show", hideKey: "Hide"
    }
  };

  /* ------------------------------------------------------- 默认 & 状态 */
  const DEFAULT_SETTINGS = {
    template: "openai", apiBase: TEMPLATES.openai.apiBase, chatPath: TEMPLATES.openai.chatPath,
    apiKey: "", extraHeaders: "",
    models: TEMPLATES.openai.models.slice(),
    model: TEMPLATES.openai.models[0],
    language: "zh", material: "glass", darkMode: false,
    params: { glass: { alpha: 30, blur: 15, refraction: 0 }, liquid: { alpha: 5, blur: 1, refraction: 1 } },
    tokenLimit: 20000000
  };

  const state = {
    settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
    tokenUsed: 0, conversations: [], activeConvId: null,
    ui: { fabPos: null, dialogPos: null, expanded: false, deepThink: false, webSearch: false, disclaimerAccepted: false }
  };

  /* ------------------------------------------------------------- 工具 */
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const uid = () => "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const alphaFactor = (v) => 0.04 + (clamp(Number(v) || 0, 0, 100) / 100) * 0.96;
  const refractScale = (v) => { v = Number(v) || 0; if (v <= 0) return 0; return Math.round(60 + (v - 1) * (600 - 60) / 99); };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtNum = (n) => { n = Number(n) || 0; if (n >= 1e9) return (n / 1e9).toFixed(2) + "B"; if (n >= 1e6) return (n / 1e6).toFixed(2) + "M"; if (n >= 1e3) return (n / 1e3).toFixed(2) + "K"; return String(Math.round(n)); };
  const estTokens = (s) => { if (!s) return 0; s = String(s); const cjk = (s.match(/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/g) || []).length; return Math.ceil(cjk + (s.length - cjk) / 4); };
  const deepMerge = (tg, src) => { if (!src || typeof src !== "object") return tg; Object.keys(src).forEach((k) => { const v = src[k]; if (v && typeof v === "object" && !Array.isArray(v) && tg[k] && typeof tg[k] === "object" && !Array.isArray(tg[k])) deepMerge(tg[k], v); else tg[k] = v; }); return tg; };
  const isConfigured = () => { const s = state.settings; return !!(s.apiKey && s.apiKey.trim() && s.model && s.model.trim() && s.apiBase && s.apiBase.trim()); };
  const t = (key) => { const l = state.settings.language === "en" ? "en" : "zh"; return (I18N[l] && I18N[l][key]) || I18N.zh[key] || key; };

  /* ----------------------------------------------------------- 持久 */
  let saveTimer = null;
  const snapshot = () => ({ settings: state.settings, tokenUsed: state.tokenUsed, conversations: state.conversations, activeConvId: state.activeConvId, ui: state.ui });
  function save() { if (saveTimer) clearTimeout(saveTimer); saveTimer = setTimeout(() => { saveTimer = null; try { localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot())); } catch (e) {} }, 200); }
  function saveNow() { if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; } try { localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot())); } catch (e) {} }
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const st = JSON.parse(raw);
        if (st.settings) deepMerge(state.settings, st.settings);
        if (typeof st.tokenUsed === "number") state.tokenUsed = st.tokenUsed;
        if (Array.isArray(st.conversations)) state.conversations = st.conversations;
        if (st.activeConvId) state.activeConvId = st.activeConvId;
        if (st.ui) deepMerge(state.ui, st.ui);
      }
    } catch (e) { /* ignore */ }
    if (!Array.isArray(state.settings.models)) state.settings.models = [];
    if (state.conversations.length && !state.activeConvId) state.activeConvId = state.conversations[0].id;
  }

  /* -------------------------------------------------------------- CSS */
  const CSS = `
  .root, .root * { box-sizing: border-box; }
  .root {
    --ai-alpha: 0.35; --ai-blur: 15px; --ai-refract: 0; --ai-fg: #0b1220;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Microsoft YaHei", "Segoe UI", system-ui, sans-serif;
    color: var(--ai-fg); line-height: 1.5; font-size: 14px; -webkit-font-smoothing: antialiased;
  }
  .root[data-mode="glass"] .glass {
    background-color: rgba(255,255,255, var(--ai-alpha));
    -webkit-backdrop-filter: blur(var(--ai-blur)) saturate(180%);
    backdrop-filter: blur(var(--ai-blur)) saturate(180%);
    background-image: linear-gradient(160deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.02) 62%, rgba(255,255,255,0.18) 100%);
    border: 1px solid rgba(255,255,255,0.62);
    box-shadow: 0 14px 38px rgba(10,20,40,0.22), 0 2px 8px rgba(10,20,40,0.10), inset 0 1px 0 rgba(255,255,255,0.82), inset 0 -14px 28px -20px rgba(160,185,235,0.45);
  }
  .root[data-mode="liquid"] .glass {
    background-color: rgba(255,255,255, var(--ai-alpha));
    -webkit-backdrop-filter: blur(var(--ai-blur)) saturate(190%) url(#ai-liquid-filter);
    backdrop-filter: blur(var(--ai-blur)) saturate(190%) url(#ai-liquid-filter);
    border: 1px solid rgba(255,255,255,0.72);
    box-shadow: 0 18px 48px rgba(10,20,40,0.26), 0 2px 10px rgba(10,20,40,0.12), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -22px 32px -22px rgba(255,255,255,0.75), inset 0 0 0 1px rgba(255,255,255,0.14);
  }
  .root[data-mode="liquid"] .glass::after {
    content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
    background: linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.12) 22%, rgba(255,255,255,0) 46%, rgba(170,200,255,0.14) 68%, rgba(255,255,255,0.45) 100%);
    mix-blend-mode: screen; opacity: calc(var(--ai-refract) * 0.9);
  }
  .root[data-mode="glass"] .glass::after { content: none; }
  .root[data-dark="1"] { --ai-fg: #eaf0fb; }
  .root[data-dark="1"][data-mode="glass"] .glass { background-color: rgba(18,22,32, calc(var(--ai-alpha) + 0.22)); border-color: rgba(255,255,255,0.14); background-image: linear-gradient(165deg, rgba(96,110,140,0.30) 0%, rgba(40,48,64,0.10) 42%, rgba(22,26,36,0.04) 66%, rgba(74,88,116,0.22) 100%); box-shadow: 0 16px 46px rgba(0,0,0,0.52), 0 2px 10px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.10); }
  .root[data-dark="1"] .msg.ai .bubble { color: #0b1220; }
  .root[data-dark="1"] .mini:not([aria-pressed="true"]) { color: #0b1220; }
  .root[data-dark="1"] .full-btn { color: #0b1220; }
  .root[data-dark="1"] .icon-btn { color: #0b1220; background: rgba(255,255,255,0.55); }
  .root[data-dark="1"] .icon-btn:hover { background: rgba(255,255,255,0.72); }
  .root[data-dark="1"] .seg > button[aria-pressed="true"] { color: #0b1220; }
  .root[data-dark="1"] .act-btn { color: #0b1220; }
  .root[data-dark="1"] .act-btn.done { color: #eafff1; }
  .root[data-dark="1"] .chip { color: #0b1220; }
  .root[data-dark="1"] .chip.active { color: #fff; background: linear-gradient(135deg, rgba(91,157,255,0.95), rgba(47,111,237,0.95)); }
  .root[data-dark="1"] .input, .root[data-dark="1"] .textarea, .root[data-dark="1"] .msg-input { color: #0b1220; background: rgba(255,255,255,0.92); border-color: rgba(255,255,255,0.22); box-shadow: inset 0 1px 3px rgba(0,0,0,0.30); }
  .root[data-dark="1"] .input::placeholder, .root[data-dark="1"] .textarea::placeholder, .root[data-dark="1"] .msg-input::placeholder { color: rgba(11,18,32,0.42); }
  .root[data-dark="1"] .input:focus, .root[data-dark="1"] .textarea:focus, .root[data-dark="1"] .msg-input:focus { background: rgba(255,255,255,1); border-color: rgba(120,160,255,0.85); }
  .root[data-dark="1"] .mini:not([aria-pressed="true"]), .root[data-dark="1"] .full-btn { background: rgba(255,255,255,0.86); border-color: rgba(255,255,255,0.18); box-shadow: 0 2px 8px rgba(0,0,0,0.38); }
  .root[data-dark="1"] .mini:hover, .root[data-dark="1"] .full-btn:hover { background: rgba(255,255,255,0.95); }
  .root[data-dark="1"] .seg-thumb { background: rgba(232,238,250,0.95); box-shadow: 0 2px 8px rgba(0,0,0,0.46); }
  .root[data-dark="1"] input[type="range"].range::-webkit-slider-thumb { box-shadow: 0 2px 8px rgba(0,0,0,0.5); }
  .root[data-dark="1"] .dlg-head, .root[data-dark="1"] .dlg-foot, .root[data-dark="1"] .set-head { border-color: rgba(255,255,255,0.12); }
  .root[data-dark="1"] .search-head, .root[data-dark="1"] .search-card:not(:has(.search-item)) { color: #8fb6ff; }
  .root[data-dark="1"] .token-warnbar { color: #ffb4ab; }
  .root[data-dark="1"] .err-bubble { color: #ffb4ab !important; }
  .root[data-dark="1"] .reasoning { background: rgba(120,150,255,0.14); border-color: rgba(140,170,255,0.45); }
  .root[data-dark="1"] .sub, .root[data-dark="1"] .hint { opacity: .68; }
  .seg.disabled { opacity: .5; }
  .seg.disabled > button { cursor: not-allowed; }
  .root .disclaimer.glass { inset: 0; width: auto; height: auto; background-color: rgba(8,12,20,0.5); border: 0; box-shadow: none; -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 24px; z-index: 2147483600; border-radius: 0; }
  .root .disc-card { width: min(580px, 92vw); max-height: 84vh; display: flex; flex-direction: column; padding: 22px 22px 18px; border-radius: 20px; background: rgba(255,255,255,0.9); color: #0b1220; box-shadow: 0 24px 60px rgba(10,20,40,0.36); border: 1px solid rgba(255,255,255,0.7); }
  .root[data-dark="1"] .disc-card { background: rgba(24,28,38,0.95); color: #eaf0fb; border-color: rgba(255,255,255,0.16); }
  .disc-title { font-size: 17px; font-weight: 700; margin-bottom: 6px; }
  .disc-lang { display: flex; gap: 6px; margin: 2px 0 12px; }
  .disc-lang-btn { -webkit-appearance: none; appearance: none; border: 1px solid rgba(120,130,150,0.4); background: transparent; color: inherit; font: inherit; font-size: 12px; padding: 4px 12px; border-radius: 9px; cursor: pointer; }
  .disc-lang-btn.on { background: rgba(120,150,255,0.24); border-color: rgba(120,150,255,0.55); }
  .disc-body { white-space: pre-wrap; font-size: 12.5px; line-height: 1.7; opacity: .92; overflow: auto; flex: 1 1 auto; min-height: 0; padding-right: 4px; }
  .disc-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; flex: 0 0 auto; }
  .disc-btn { -webkit-appearance: none; appearance: none; border: 0; font: inherit; font-size: 13px; padding: 9px 20px; border-radius: 11px; cursor: pointer; transition: background .18s ease; }
  .disc-btn.reject { background: rgba(120,130,150,0.22); color: inherit; }
  .disc-btn.reject:hover { background: rgba(120,130,150,0.34); }
  .disc-btn.accept { background: rgba(60,120,255,0.92); color: #fff; }
  .disc-btn.accept:hover { background: rgba(60,120,255,1); }
  .glass { position: fixed; }
  .anim { transform-origin: bottom right; transition: opacity .3s cubic-bezier(.22,1,.36,1), transform .44s cubic-bezier(.22,1,.36,1), visibility 0s linear .3s; will-change: transform, opacity; }
  .hidden { opacity: 0; transform: scale(.9) translateY(10px); pointer-events: none; visibility: hidden; }
  .shown { visibility: visible; transition: opacity .3s cubic-bezier(.22,1,.36,1), transform .46s cubic-bezier(.34,1.56,.64,1), visibility 0s linear 0s; }
  .btn { -webkit-appearance: none; appearance: none; border: 0; background: transparent; color: inherit; font: inherit; cursor: pointer; border-radius: 12px; padding: 8px 10px; margin: 2px 0; display: flex; align-items: center; gap: 8px; width: 100%; text-align: left; transition: background .18s ease, transform .16s ease; }
  .btn:hover { background: rgba(120,150,255,0.16); } .btn:active { transform: scale(.98); }
  .icon-btn { -webkit-appearance: none; appearance: none; border: 0; cursor: pointer; width: 30px; height: 30px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 15px; color: inherit; background: rgba(255,255,255,0.34); transition: transform .16s ease, background .2s ease; flex: 0 0 auto; }
  .icon-btn:hover { background: rgba(120,150,255,0.22); } .icon-btn:active { transform: scale(.92); }
  .sub { font-size: 12px; font-weight: 600; opacity: .82; margin: 12px 4px 6px; } .sub:first-of-type { margin-top: 2px; }
  .hint { font-size: 11px; opacity: .6; margin: 8px 2px 2px; line-height: 1.55; }
  .row { display: flex; align-items: center; justify-content: space-between; margin: 8px 2px 2px; font-size: 12px; opacity: .9; } .row.dim { opacity: .42; }
  .val { font-variant-numeric: tabular-nums; opacity: .7; }
  .seg { position: relative; display: flex; gap: 4px; padding: 4px; border-radius: 14px; margin: 2px 0 6px; background: rgba(120,130,150,0.18); }
  .seg > button { position: relative; z-index: 1; flex: 1; border: 0; background: transparent; color: inherit; font: inherit; cursor: pointer; padding: 7px 8px; border-radius: 11px; font-size: 12px; transition: color .25s ease, transform .16s ease; white-space: nowrap; }
  .seg > button:active { transform: scale(.97); } .seg > button[aria-pressed="true"] { font-weight: 700; }
  .seg-thumb { position: absolute; z-index: 0; top: 4px; left: 4px; width: 0; height: calc(100% - 8px); border-radius: 11px; background: rgba(255,255,255,0.94); box-shadow: 0 2px 8px rgba(10,20,40,0.18), inset 0 1px 0 rgba(255,255,255,0.9); transition: transform .42s cubic-bezier(.34,1.4,.5,1), width .42s cubic-bezier(.34,1.4,.5,1); pointer-events: none; }
  input[type="range"].range { -webkit-appearance: none; appearance: none; width: 100%; height: 22px; background: transparent; cursor: pointer; margin: 2px 0 6px; }
  input[type="range"].range::-webkit-slider-runnable-track { height: 6px; border-radius: 6px; background: rgba(120,130,150,0.3); }
  input[type="range"].range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; margin-top: -7px; border-radius: 50%; background: #fff; box-shadow: 0 2px 8px rgba(10,20,40,0.3), inset 0 1px 0 rgba(255,255,255,0.9); transition: transform .15s ease; }
  input[type="range"].range:disabled { opacity: .4; cursor: default; }
  .field { margin: 8px 2px; } .field > label { display: block; font-size: 11px; opacity: .72; margin: 0 0 5px 4px; }
  .input, .textarea { width: 100%; border: 1px solid rgba(255,255,255,0.7); background: rgba(255,255,255,0.5); border-radius: 12px; padding: 9px 11px; font: inherit; font-size: 12.5px; color: inherit; outline: none; box-shadow: inset 2px 2px 6px rgba(150,165,195,0.30), inset -2px -2px 6px rgba(255,255,255,0.85); transition: border .2s ease, background .2s ease; }
  .input:focus, .textarea:focus { border-color: rgba(90,140,255,0.75); background: rgba(255,255,255,0.72); }
  .textarea { resize: vertical; min-height: 54px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .add-row { display: flex; gap: 6px; } .add-row .input { flex: 1 1 auto; }
  .fab { width: 56px; height: 56px; border-radius: 50%; border: 0; cursor: grab; display: flex; align-items: center; justify-content: center; touch-action: none; user-select: none; padding: 0; color: #0b1220; transition: transform .3s cubic-bezier(.34,1.56,.64,1); }
  .fab:hover { transform: scale(1.08); } .fab:active { transform: scale(.93); }
  .fab-glyph { font-size: 24px; line-height: 1; filter: drop-shadow(0 1px 2px rgba(0,0,0,.15)); }
  .fab-dot { position: absolute; right: 2px; top: 2px; width: 12px; height: 12px; border-radius: 50%; background: #ff453a; border: 2px solid #fff; }
  .dialog { width: 400px; height: 620px; border-radius: 26px; overflow: hidden; display: flex; flex-direction: column; max-height: calc(100vh - 24px); max-width: calc(100vw - 24px); }
  .dlg-head { display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.5); cursor: grab; touch-action: none; user-select: none; flex: 0 0 auto; }
  .dlg-head .spacer { flex: 1; }
  .dlg-titles { display: flex; flex-direction: column; min-width: 0; }
  .dlg-title { font-size: 13.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
  .dlg-sub { font-size: 10.5px; opacity: .55; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
  .token-badge { font-size: 10.5px; padding: 3px 8px; border-radius: 999px; background: rgba(120,150,255,0.16); white-space: nowrap; font-variant-numeric: tabular-nums; }
  .token-badge.warn { background: rgba(255,159,10,0.22); } .token-badge.over { background: rgba(255,69,58,0.24); }
  .token-warnbar { display: none; margin: 0; padding: 7px 12px; font-size: 11.5px; line-height: 1.45; color: #7a1c12; background: rgba(255,69,58,0.16); border-bottom: 1px solid rgba(255,69,58,0.28); }
  .token-warnbar.on { display: block; }
  .token-warnbar b { font-weight: 700; }
  .dlg-body { flex: 1 1 auto; overflow-y: auto; overflow-x: hidden; padding: 12px; }
  .dlg-body::-webkit-scrollbar { width: 8px; } .dlg-body::-webkit-scrollbar-thumb { background: rgba(120,130,150,0.35); border-radius: 8px; }
  .msg { display: flex; flex-direction: column; margin: 0 0 12px; max-width: 100%; }
  .msg .who { font-size: 10.5px; opacity: .55; margin: 0 6px 4px; } .msg.user { align-items: flex-end; }
  .bubble { max-width: 84%; padding: 9px 12px; border-radius: 16px; font-size: 13.5px; white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere; background: rgba(255,255,255,0.66); border: 1px solid rgba(255,255,255,0.75); box-shadow: 0 4px 14px rgba(10,20,40,0.10); }
  .msg.user .bubble { background: linear-gradient(135deg, rgba(91,157,255,0.92), rgba(47,111,237,0.92)); color: #fff; border-color: rgba(255,255,255,0.4); border-bottom-right-radius: 6px; }
  .msg.ai .bubble { border-bottom-left-radius: 6px; }
  .bubble .code { background: rgba(20,28,45,0.86); color: #e6ecf7; padding: 9px 11px; border-radius: 10px; margin: 6px 0; overflow-x: auto; font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre; }
  .bubble code.inline { background: rgba(20,28,45,0.10); padding: 1px 5px; border-radius: 5px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
  .msg.user .bubble code.inline { background: rgba(255,255,255,0.24); }
  .thumb-row { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0 0; justify-content: flex-end; }
  .thumb-row img { width: 64px; height: 64px; object-fit: cover; border-radius: 10px; border: 1px solid rgba(255,255,255,0.6); }
  .reasoning { max-width: 84%; margin: 0 0 6px; border-radius: 12px; background: rgba(120,150,255,0.10); border: 1px dashed rgba(120,150,255,0.4); font-size: 12px; padding: 6px 10px; }
  .reasoning summary { cursor: pointer; opacity: .75; font-weight: 600; outline: none; } .reasoning .r-body { margin-top: 6px; white-space: pre-wrap; opacity: .85; }
  .typing { display: inline-flex; gap: 4px; align-items: center; padding: 4px 2px; }
  .typing i { width: 7px; height: 7px; border-radius: 50%; background: currentColor; opacity: .5; animation: aiblb 1.1s infinite ease-in-out; }
  .typing i:nth-child(2) { animation-delay: .18s; } .typing i:nth-child(3) { animation-delay: .36s; }
  @keyframes aiblb { 0%,80%,100% { opacity: .28; transform: translateY(0); } 40% { opacity: .9; transform: translateY(-3px); } }
  .err-bubble { background: rgba(255,69,58,0.14) !important; border-color: rgba(255,69,58,0.4) !important; color: #b3271d; }
  .empty-tip { text-align: center; opacity: .5; font-size: 12.5px; margin: 40px 10px; line-height: 1.8; white-space: pre-line; }
  .dlg-foot { flex: 0 0 auto; padding: 10px 12px 12px; border-top: 1px solid rgba(255,255,255,0.5); }
  .attach-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; } .attach-row:empty { display: none; }
  .attach { position: relative; width: 52px; height: 52px; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.6); }
  .attach img { width: 100%; height: 100%; object-fit: cover; }
  .attach .rm { position: absolute; right: 1px; top: 1px; width: 17px; height: 17px; border-radius: 50%; border: 0; background: rgba(10,20,40,0.6); color: #fff; font-size: 11px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .input-row { display: flex; align-items: flex-end; gap: 8px; }
  .msg-input { flex: 1 1 auto; resize: none; border: 1px solid rgba(255,255,255,0.72); background: rgba(255,255,255,0.5); border-radius: 16px; padding: 10px 12px; font: inherit; font-size: 13px; color: inherit; outline: none; min-height: 96px; max-height: 150px; box-shadow: inset 2px 2px 6px rgba(150,165,195,0.3), inset -2px -2px 6px rgba(255,255,255,0.85); line-height: 1.45; }
  .msg-input:focus { border-color: rgba(90,140,255,0.75); background: rgba(255,255,255,0.72); } .msg-input.locked { opacity: .7; }
  .side-btns { display: flex; flex-direction: column; gap: 5px; justify-content: flex-end; }
  .upload-menu { position: fixed; z-index: 2147483000; display: none; flex-direction: column; gap: 2px; padding: 6px; border-radius: 12px; min-width: 132px; }
  .upload-menu.shown { display: flex; }
  .upload-menu .um-item { -webkit-appearance: none; appearance: none; border: 0; background: transparent; color: inherit; font: inherit; font-size: 12px; text-align: left; padding: 7px 10px; border-radius: 8px; cursor: pointer; white-space: nowrap; }
  .upload-menu .um-item:hover { background: rgba(120,150,255,0.22); }
  .upload-menu .um-item.disabled { opacity: .45; cursor: not-allowed; }
  .attach.attach-file { width: auto; min-width: 52px; max-width: 160px; height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 4px 6px; background: rgba(255,255,255,0.32); }
  .attach .af-icon { font-size: 16px; line-height: 1; }
  .attach .af-name { font-size: 9px; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; opacity: .85; }
  .side-mini { padding: 5px 9px; font-size: 11px; border-radius: 10px; line-height: 1.1; }
  .mini { -webkit-appearance: none; appearance: none; border: 1px solid rgba(255,255,255,0.7); background: rgba(255,255,255,0.42); border-radius: 12px; cursor: pointer; color: inherit; font: inherit; font-size: 12px; padding: 7px 10px; white-space: nowrap; transition: background .2s ease, transform .16s ease; box-shadow: 3px 3px 8px rgba(150,165,195,0.32), -3px -3px 8px rgba(255,255,255,0.85); }
  .mini:hover { background: rgba(120,150,255,0.2); } .mini:active { transform: scale(.96); }
  .mini[aria-pressed="true"] { background: linear-gradient(135deg, rgba(91,157,255,0.92), rgba(47,111,237,0.92)); color: #fff; border-color: rgba(255,255,255,0.4); }
  .send-btn { width: 42px; height: 42px; border-radius: 14px; border: 0; cursor: pointer; background: linear-gradient(135deg, #5b9dff, #2f6fed); color: #fff; font-size: 17px; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 14px rgba(47,111,237,0.36); transition: transform .16s ease, opacity .2s ease; }
  .send-btn:active { transform: scale(.94); } .send-btn.stop { background: linear-gradient(135deg, #ff7a6b, #ff3b2f); }
  .menu { width: 264px; border-radius: 18px; padding: 10px; overflow: hidden; display: flex; flex-direction: column; max-height: min(72vh, 560px); }
  .menu .menu-head { font-size: 12px; font-weight: 700; opacity: .75; margin: 2px 4px 8px; }
  .conv-list { overflow-y: auto; flex: 1 1 auto; margin: 2px 0; max-height: 190px; } .conv-list::-webkit-scrollbar { width: 7px; } .conv-list::-webkit-scrollbar-thumb { background: rgba(120,130,150,0.3); border-radius: 8px; }
  .conv-item { display: flex; align-items: center; gap: 8px; border-radius: 12px; padding: 8px 10px; cursor: pointer; transition: background .16s ease; }
  .conv-item:hover { background: rgba(120,150,255,0.14); } .conv-item.active { background: rgba(120,150,255,0.22); }
  .conv-item .c-title { flex: 1 1 auto; font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .conv-item .c-del { opacity: 0; border: 0; background: transparent; cursor: pointer; color: inherit; font-size: 13px; padding: 2px 4px; border-radius: 7px; }
  .conv-item:hover .c-del { opacity: .65; } .conv-item .c-del:hover { opacity: 1; background: rgba(255,69,58,0.18); }
  .menu-sep { height: 1px; background: rgba(128,140,160,0.25); margin: 8px 2px; }
  .menu-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 4px; }
  .menu-row .mr-label { font-size: 12.5px; }
  .switch { width: 44px; height: 26px; border-radius: 999px; background: rgba(120,130,150,0.4); position: relative; cursor: pointer; flex: 0 0 auto; transition: background .25s ease; border: 0; }
  .switch > i { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.22); transition: transform .26s cubic-bezier(.34,1.4,.5,1); }
  .switch[aria-checked="true"] { background: linear-gradient(135deg,#5b9dff,#2f6fed); }
  .switch[aria-checked="true"] > i { transform: translateX(18px); }
  .model-list { display: flex; flex-direction: column; gap: 3px; margin: 2px 0; max-height: 170px; overflow-y: auto; }
  .model-item { display: flex; align-items: center; gap: 8px; border-radius: 11px; padding: 7px 10px; cursor: pointer; font-size: 12.5px; transition: background .16s ease; }
  .model-item:hover { background: rgba(120,150,255,0.14); } .model-item.active { background: rgba(120,150,255,0.22); }
  .model-item .m-name { flex: 1 1 auto; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .model-item .m-check { color: #2f6fed; font-size: 12px; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0; }
  .chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 999px; background: rgba(120,150,255,0.16); font-size: 12px; cursor: pointer; }
  .chip.active { background: linear-gradient(135deg, rgba(91,157,255,0.95), rgba(47,111,237,0.95)); color: #fff; }
  .chip .x { cursor: pointer; opacity: .7; font-size: 13px; } .chip .x:hover { opacity: 1; }
  .settings { width: 340px; border-radius: 22px; overflow: hidden; display: flex; flex-direction: column; max-height: min(76vh, 620px); }
  .set-head { display: flex; align-items: center; gap: 8px; padding: 11px 12px; border-bottom: 1px solid rgba(255,255,255,0.5); }
  .set-title { font-size: 13px; font-weight: 700; flex: 1 1 auto; }
  .set-body { overflow-y: auto; padding: 10px 12px 14px; } .set-body::-webkit-scrollbar { width: 7px; } .set-body::-webkit-scrollbar-thumb { background: rgba(120,130,150,0.3); border-radius: 8px; }
  .nav-row { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 14px; cursor: pointer; transition: background .16s ease; margin: 4px 0; }
  .nav-row:hover { background: rgba(120,150,255,0.14); }
  .nav-row .nr-icon { width: 34px; height: 34px; border-radius: 11px; display: flex; align-items: center; justify-content: center; background: rgba(120,150,255,0.18); font-size: 16px; }
  .nav-row .nr-text { flex: 1 1 auto; } .nav-row .nr-title { font-size: 13px; font-weight: 600; } .nav-row .nr-sub { font-size: 11px; opacity: .6; }
  .nav-row .nr-arrow { opacity: .5; font-size: 15px; }
  .progress-bar { height: 7px; border-radius: 6px; overflow: hidden; background: rgba(120,130,150,0.25); margin: 6px 2px; }
  .progress-bar > i { display: block; height: 100%; width: 0; border-radius: 6px; background: linear-gradient(90deg,#5b9dff,#2f6fed); transition: width .3s ease; }
  .progress-bar > i.warn { background: linear-gradient(90deg,#ffd24a,#ff9f0a); } .progress-bar > i.over { background: linear-gradient(90deg,#ff7a6b,#ff3b2f); }
  .full-btn { width: 100%; border: 1px solid rgba(255,255,255,0.7); border-radius: 12px; padding: 9px; background: rgba(255,255,255,0.42); cursor: pointer; color: inherit; font: inherit; font-size: 12.5px; box-shadow: 3px 3px 8px rgba(150,165,195,0.32), -3px -3px 8px rgba(255,255,255,0.85); transition: background .2s ease, transform .16s ease; margin-top: 6px; }
  .full-btn:hover { background: rgba(120,150,255,0.2); } .full-btn:active { transform: scale(.98); }
  .badge-ok { color: #1a7f4b; font-size: 11px; margin: 4px 2px; } .badge-bad { color: #c0392b; font-size: 11px; margin: 4px 2px; }
  .toast { position: fixed; left: 50%; bottom: 40px; transform: translateX(-50%) translateY(12px); background: rgba(20,28,45,0.92); color: #fff; padding: 9px 16px; border-radius: 12px; font-size: 12.5px; opacity: 0; transition: opacity .3s ease, transform .3s ease; pointer-events: none; z-index: 30; max-width: 80%; text-align: center; }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  .toast.ok { background: rgba(24,120,64,0.96); box-shadow: 0 8px 24px rgba(24,160,80,0.34); }
  .toast.bad { background: rgba(170,40,40,0.96); box-shadow: 0 8px 24px rgba(200,60,60,0.34); }
  .root[data-dark="1"] .toast.ok { background: rgba(30,150,80,0.97); box-shadow: 0 0 0 1px rgba(90,230,140,0.55), 0 8px 26px rgba(30,180,90,0.5); }
  .root[data-dark="1"] .toast.bad { background: rgba(190,50,50,0.97); box-shadow: 0 0 0 1px rgba(255,130,120,0.55), 0 8px 26px rgba(220,70,70,0.5); }
  .root[data-dark="1"] .badge-ok { color: #4ade80; }
  .root[data-dark="1"] .badge-bad { color: #ff6b6b; }
  .root.theming .glass { transition: background-color .5s ease, border-color .5s ease, box-shadow .5s ease, color .5s ease; }
  .root.theming .bubble, .root.theming .msg-input, .root.theming .mini, .root.theming .full-btn, .root.theming .seg, .root.theming .seg > button, .root.theming .disc-card, .root.theming .hint, .root.theming .sub, .root.theming .field label, .root.theming .icon-btn, .root.theming .act-btn, .root.theming .chip { transition: background-color .5s ease, color .5s ease, border-color .5s ease, box-shadow .5s ease, opacity .5s ease; }
  .code-block { margin: 8px 0; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.14); background: rgba(17,24,39,0.94); box-shadow: 0 6px 18px rgba(10,20,40,0.22); }
  .code-head { display: flex; align-items: center; gap: 8px; padding: 5px 10px; background: rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.10); }
  .code-lang { font-size: 10.5px; letter-spacing: .04em; text-transform: uppercase; color: #9fb3d1; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .code-spacer { flex: 1 1 auto; }
  .code-copy { -webkit-appearance: none; appearance: none; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.08); color: #d6e2f5; font: inherit; font-size: 11px; padding: 3px 9px; border-radius: 8px; cursor: pointer; transition: background .18s ease; }
  .code-copy:hover { background: rgba(255,255,255,0.18); } .code-copy.done { background: rgba(52,199,89,0.35); border-color: rgba(52,199,89,0.6); color: #eafff1; }
  .bubble .code { background: transparent; color: #e6ecf7; padding: 10px 12px; border-radius: 0; margin: 0; overflow-x: auto; font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre; }
  .hl-kw { color: #c792ea; } .hl-str { color: #a5e075; } .hl-num { color: #f2b36b; } .hl-com { color: #7d8aa3; font-style: italic; }
  .msg-actions { display: flex; gap: 6px; margin: 6px 4px 0; }
  .act-btn { -webkit-appearance: none; appearance: none; border: 1px solid rgba(255,255,255,0.5); background: rgba(255,255,255,0.34); color: inherit; font: inherit; font-size: 11px; padding: 4px 9px; border-radius: 9px; cursor: pointer; transition: background .18s ease, transform .16s ease; }
  .act-btn:hover { background: rgba(120,150,255,0.2); } .act-btn:active { transform: scale(.96); } .act-btn.done { background: rgba(52,199,89,0.28); border-color: rgba(52,199,89,0.5); }
  .search-card { margin: 6px 4px 0; border-radius: 12px; overflow: hidden; border: 1px solid rgba(120,150,255,0.3); background: rgba(120,150,255,0.08); font-size: 11.5px; padding: 0; }
  .search-card:not(:has(.search-item)) { padding: 8px 11px; color: #2f6fed; }
  .search-head { padding: 7px 11px; font-weight: 700; color: #2f6fed; cursor: pointer; user-select: none; display: flex; align-items: center; gap: 6px; list-style: none; outline: none; }
  .search-head::-webkit-details-marker { display: none; }
  .search-head::before { content: "▸"; font-size: 10px; transition: transform .18s ease; }
  .search-card[open] > .search-head::before { transform: rotate(90deg); }
  .search-card[open] > .search-head { border-bottom: 1px solid rgba(120,150,255,0.2); }
  .search-item { display: block; padding: 7px 11px; text-decoration: none; color: inherit; border-bottom: 1px solid rgba(120,150,255,0.12); transition: background .16s ease; }
  .search-item:last-child { border-bottom: 0; }
  .search-item:hover { background: rgba(120,150,255,0.14); }
  .search-title { font-size: 12px; font-weight: 600; margin-bottom: 2px; }
  .search-snip { opacity: .82; line-height: 1.42; max-height: 3.2em; overflow: hidden; }
  .search-src { font-size: 10px; opacity: .58; margin-top: 3px; word-break: break-all; }
  .input-wrap { display: flex; align-items: center; gap: 8px; }
  .input-wrap .input { flex: 1 1 auto; min-width: 0; }
  .eye-btn { -webkit-appearance: none; appearance: none; border: 1px solid rgba(255,255,255,0.5); background: rgba(255,255,255,0.28); color: inherit; font: inherit; font-size: 14px; line-height: 1; width: 36px; height: 34px; border-radius: 10px; cursor: pointer; flex: 0 0 auto; transition: background .18s ease, transform .16s ease; }
  .eye-btn:hover { background: rgba(120,150,255,0.22); } .eye-btn:active { transform: scale(.95); }
  `;

  /* -------------------------------------------------------------- DOM */
  const el = (tag, cls, css) => { const n = document.createElement(tag); if (cls) n.className = cls; if (css) n.style.cssText = css; return n; };
  const host = el("div");
  host.id = "ai-floating-chat-host";
  host.style.cssText = "position:fixed;left:0;top:0;width:0;height:0;z-index:" + Z + ";";
  const shadow = host.attachShadow({ mode: "open" });
  const styleEl = el("style"); styleEl.textContent = CSS; shadow.appendChild(styleEl);

  const SVGNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(SVGNS, "svg");
  svg.setAttribute("aria-hidden", "true"); svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
  const defs = document.createElementNS(SVGNS, "defs");
  const filter = document.createElementNS(SVGNS, "filter");
  filter.setAttribute("id", "ai-liquid-filter");
  filter.setAttribute("x", "-30%"); filter.setAttribute("y", "-30%"); filter.setAttribute("width", "160%"); filter.setAttribute("height", "160%");
  filter.setAttribute("color-interpolation-filters", "sRGB");
  const turb = document.createElementNS(SVGNS, "feTurbulence");
  turb.setAttribute("type", "fractalNoise"); turb.setAttribute("baseFrequency", "0.011 0.013"); turb.setAttribute("numOctaves", "2"); turb.setAttribute("seed", "9"); turb.setAttribute("result", "noise");
  const soft = document.createElementNS(SVGNS, "feGaussianBlur");
  soft.setAttribute("in", "noise"); soft.setAttribute("stdDeviation", "1.6"); soft.setAttribute("result", "soft");
  const disp = document.createElementNS(SVGNS, "feDisplacementMap");
  disp.setAttribute("in", "SourceGraphic"); disp.setAttribute("in2", "soft"); disp.setAttribute("scale", "0"); disp.setAttribute("xChannelSelector", "R"); disp.setAttribute("yChannelSelector", "G");
  filter.appendChild(turb); filter.appendChild(soft); filter.appendChild(disp);
  defs.appendChild(filter); svg.appendChild(defs); shadow.appendChild(svg);

  const rootEl = el("div", "root");
  rootEl.setAttribute("data-mode", state.settings.material === "liquid" ? "liquid" : "glass"); rootEl.setAttribute("data-dark", state.settings.darkMode ? "1" : "0");
  shadow.appendChild(rootEl);

  const thumbTargets = [];
  const segShown = {};
  const rangeShown = {};
  let currentStream = null;
  let pendingImages = [];
  let pendingFiles = [];
  let settingsPage = "root";
  let toastEl = null, toastTimer = null;
  function toast(msg, kind) { if (!toastEl) return; toastEl.textContent = msg; toastEl.classList.remove("ok", "bad"); if (kind) toastEl.classList.add(kind); toastEl.classList.add("show"); if (toastTimer) clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600); }
  function okColor() { return state.settings.darkMode ? "#4ade80" : "#1a7f4b"; }
  function badColor() { return state.settings.darkMode ? "#ff6b6b" : "#c0392b"; }
  let themeTimer = null;
  function themeTransition() { try { rootEl.classList.add("theming"); if (themeTimer) clearTimeout(themeTimer); themeTimer = setTimeout(() => { try { rootEl.classList.remove("theming"); } catch (e) {} }, 520); } catch (e) {} }
  function fallbackCopy(text) { try { const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.left = "-9999px"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.focus(); ta.select(); try { document.execCommand("copy"); } catch (e) {} document.body.removeChild(ta); } catch (e) {} }
  function copyText(text, btn, doneLabel) {
    const done = () => { if (!btn) return; const old = btn.textContent; btn.textContent = "\u2713 " + doneLabel; btn.classList.add("done"); toast(doneLabel, "ok"); setTimeout(() => { btn.textContent = old; btn.classList.remove("done"); }, 1200); };
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done).catch(() => { fallbackCopy(text); done(); }); } else { fallbackCopy(text); done(); } } catch (e) { fallbackCopy(text); done(); }
  }

  /* ---------------------------------------------------------- 构建 UI */
  const fabEl = el("button", "glass fab"); fabEl.type = "button";
  const fabGlyph = el("span", "fab-glyph"); fabGlyph.textContent = "💬"; fabEl.appendChild(fabGlyph);
  const fabDot = el("span", "fab-dot"); fabEl.appendChild(fabDot);
  rootEl.appendChild(fabEl);

  const dialogEl = el("div", "glass dialog anim hidden");
  const head = el("div", "dlg-head");
  const titles = el("div", "dlg-titles");
  const dlgTitle = el("div", "dlg-title"); titles.appendChild(dlgTitle);
  const dlgSub = el("div", "dlg-sub"); titles.appendChild(dlgSub);
  head.appendChild(titles);
  head.appendChild(el("div", "spacer"));
  const tokenBadge = el("div", "token-badge"); head.appendChild(tokenBadge);
  const darkBtn = el("button", "icon-btn"); darkBtn.type = "button"; darkBtn.textContent = "🌙"; head.appendChild(darkBtn);
  const menuBtn = el("button", "icon-btn"); menuBtn.type = "button"; menuBtn.textContent = "☰"; head.appendChild(menuBtn);
  const closeBtn = el("button", "icon-btn"); closeBtn.type = "button"; closeBtn.textContent = "✕"; head.appendChild(closeBtn);
  dialogEl.appendChild(head);
  const tokenWarnBar = el("div", "token-warnbar"); dialogEl.appendChild(tokenWarnBar);
  const dlgBody = el("div", "dlg-body"); dialogEl.appendChild(dlgBody);
  const foot = el("div", "dlg-foot");
  const attachRow = el("div", "attach-row"); foot.appendChild(attachRow);
  const inputRow = el("div", "input-row");
  const msgInput = el("textarea", "msg-input"); msgInput.rows = 1; inputRow.appendChild(msgInput);
  const sendBtn = el("button", "send-btn"); sendBtn.type = "button"; sendBtn.textContent = "➤"; inputRow.appendChild(sendBtn);
  const sideBtns = el("div", "side-btns");
  const uploadBtn = el("button", "mini side-mini"); uploadBtn.type = "button"; sideBtns.appendChild(uploadBtn);
  const deepBtn = el("button", "mini side-mini"); deepBtn.type = "button"; sideBtns.appendChild(deepBtn);
  const searchBtn = el("button", "mini side-mini"); searchBtn.type = "button"; sideBtns.appendChild(searchBtn);
  inputRow.appendChild(sideBtns); foot.appendChild(inputRow); dialogEl.appendChild(foot);
  rootEl.appendChild(dialogEl);

  /* ------------------------------------------------ 免责声明 首次 */
  const discEl = el("div", "disclaimer glass anim hidden");
  const discCard = el("div", "disc-card");
  const discTitle = el("div", "disc-title"); discCard.appendChild(discTitle);
  const discLangWrap = el("div", "disc-lang"); discCard.appendChild(discLangWrap);
  const discBody = el("div", "disc-body"); discCard.appendChild(discBody);
  const discActions = el("div", "disc-actions");
  const discReject = el("button", "disc-btn reject"); discReject.type = "button"; discActions.appendChild(discReject);
  const discAccept = el("button", "disc-btn accept"); discAccept.type = "button"; discActions.appendChild(discAccept);
  discCard.appendChild(discActions);
  discEl.appendChild(discCard);
  rootEl.appendChild(discEl);
  function renderDisclaimer() {
    discTitle.textContent = t("disclaimerTitle");
    discBody.textContent = t("disclaimerBody");
    discReject.textContent = t("disclaimerReject");
    discAccept.textContent = t("disclaimerAccept");
    discLangWrap.innerHTML = "";
    [["zh", t("uiLangZh")], ["en", t("uiLangEn")]].forEach((p) => {
      const b = el("button", "disc-lang-btn" + (state.settings.language === p[0] ? " on" : ""));
      b.type = "button"; b.textContent = p[1];
      b.addEventListener("click", () => { state.settings.language = p[0]; applyTexts(); renderDisclaimer(); save(); });
      discLangWrap.appendChild(b);
    });
  }
  function showDisclaimer() { renderDisclaimer(); discEl.classList.remove("hidden"); discEl.classList.add("shown"); }
  function hideDisclaimer() { discEl.classList.remove("shown"); discEl.classList.add("hidden"); }
  function acceptDisclaimer() { state.ui.disclaimerAccepted = true; hideDisclaimer(); save(); expandDialog(true); }
  function rejectDisclaimer() { state.ui.disclaimerAccepted = false; hideDisclaimer(); state.ui.expanded = false; collapseDialog(true); save(); }


  const fileInput = el("input"); fileInput.type = "file"; fileInput.accept = "image/png,image/jpeg,image/jpg,image/gif,image/webp,image/bmp"; fileInput.multiple = true; fileInput.style.display = "none"; rootEl.appendChild(fileInput);
  const docInput = el("input"); docInput.type = "file"; docInput.accept = ".pdf,.docx,.doc,.txt,.md,.csv,.tsv,.xlsx,.xls,.json,.log,.html,.htm,.xml,.yaml,.yml"; docInput.multiple = false; docInput.style.display = "none"; rootEl.appendChild(docInput);
  const uploadMenu = el("div", "upload-menu glass"); uploadMenu.style.display = "none";
  const umImage = el("button", "um-item"); umImage.type = "button"; uploadMenu.appendChild(umImage);
  const umFile = el("button", "um-item"); umFile.type = "button"; uploadMenu.appendChild(umFile);
  rootEl.appendChild(uploadMenu);

  // 汉堡菜单
  const menuEl = el("div", "glass menu anim hidden");
  const menuHead = el("div", "menu-head"); menuEl.appendChild(menuHead);
  const newBtn = el("button", "btn"); newBtn.type = "button"; menuEl.appendChild(newBtn);
  const convListEl = el("div", "conv-list"); menuEl.appendChild(convListEl);
  menuEl.appendChild(el("div", "menu-sep"));
  const deepRow = el("div", "menu-row");
  const deepLabel = el("div", "mr-label"); deepRow.appendChild(deepLabel);
  const deepSwitch = el("button", "switch"); deepSwitch.type = "button"; deepSwitch.setAttribute("role", "switch");
  const deepKnob = el("i"); deepSwitch.appendChild(deepKnob); deepRow.appendChild(deepSwitch);
  menuEl.appendChild(deepRow);
  const modelHead = el("div", "sub"); modelHead.style.margin = "10px 4px 4px"; menuEl.appendChild(modelHead);
  const modelListEl = el("div", "model-list"); menuEl.appendChild(modelListEl);
  menuEl.appendChild(el("div", "menu-sep"));
  const setBtn = el("button", "btn"); setBtn.type = "button"; menuEl.appendChild(setBtn);
  rootEl.appendChild(menuEl);

  // 设置面板
  const settingsEl = el("div", "glass settings anim hidden");
  const setHead = el("div", "set-head");
  const backBtn = el("button", "icon-btn"); backBtn.type = "button"; backBtn.textContent = "‹"; setHead.appendChild(backBtn);
  const setTitle = el("div", "set-title"); setHead.appendChild(setTitle);
  settingsEl.appendChild(setHead);
  const setBody = el("div", "set-body"); settingsEl.appendChild(setBody);
  rootEl.appendChild(settingsEl);

  toastEl = el("div", "toast"); rootEl.appendChild(toastEl);

  /* ------------------------------------------------------- 外观  文案 */
  function applyAppearance() {
    const mode = state.settings.material === "liquid" ? "liquid" : "glass";
    rootEl.setAttribute("data-mode", mode); rootEl.setAttribute("data-dark", state.settings.darkMode ? "1" : "0");
    const p = state.settings.params[mode] || state.settings.params.glass;
    rootEl.style.setProperty("--ai-alpha", alphaFactor(p.alpha).toFixed(3));
    rootEl.style.setProperty("--ai-blur", (p.blur || 0) + "px");
    rootEl.style.setProperty("--ai-refract", (mode === "liquid" ? (p.refraction / 100) : 0).toFixed(2));
    disp.setAttribute("scale", String(refractScale(mode === "liquid" ? p.refraction : 0)));
  }
  function applyTexts() {
    fabEl.title = t("fabTitle"); fabEl.setAttribute("aria-label", t("fabTitle"));
    msgInput.setAttribute("placeholder", t("inputPlaceholder"));
    deepBtn.textContent = t("deepThink"); uploadBtn.textContent = t("upload"); uploadBtn.title = t("upload");
    umImage.textContent = t("uploadImage"); umFile.textContent = t("uploadFile"); uploadMenu.title = t("uploadLimitHint");
    searchBtn.textContent = t("webSearch"); searchBtn.title = t("webSearch");
    darkBtn.textContent = state.settings.darkMode ? "☀️" : "🌙"; darkBtn.title = t("darkMode"); darkBtn.setAttribute("aria-pressed", String(!!state.settings.darkMode));
    if (discEl.classList.contains("shown")) renderDisclaimer();
    sendBtn.title = isStreaming() ? t("stop") : t("send");
    tokenBadge.title = t("tokenUsage");
    updateHeader(); renderMenuStatic(); renderSettings();
  }
  function updateHeader() {
    const conv = activeConversation();
    dlgTitle.textContent = conv ? convTitle(conv) : t("appName");
    const m = state.settings.model;
    dlgSub.textContent = t("model") + ": " + (m && m.trim() ? m : "—");
  }
  function renderTokenBadge() {
    const limit = Number(state.settings.tokenLimit) || 0, used = Number(state.tokenUsed) || 0;
    tokenBadge.textContent = fmtNum(used) + " / " + fmtNum(limit);
    tokenBadge.classList.remove("warn", "over");
    const over = limit > 0 && used >= limit;
    if (limit > 0) { if (over) tokenBadge.classList.add("over"); else if (used >= limit * 0.8) tokenBadge.classList.add("warn"); }
    tokenWarnBar.textContent = over ? t("tokenOverBanner").replace("{limit}", fmtNum(limit)) : "";
    tokenWarnBar.classList.toggle("on", over);
  }
  function renderInputState() {
    msgInput.classList.toggle("locked", !isConfigured());
    deepBtn.setAttribute("aria-pressed", String(!!state.ui.deepThink));
    searchBtn.setAttribute("aria-pressed", String(!!state.ui.webSearch));
    fabDot.style.display = isConfigured() ? "none" : "block";
    save();
  }

  /* ------------------------------------------------------------- 定位 */
  const setPos = (n, p) => { n.style.left = Math.round(p.left) + "px"; n.style.top = Math.round(p.top) + "px"; n.style.right = "auto"; n.style.bottom = "auto"; };
  function placeFab(init) {
    if (!state.ui.fabPos) state.ui.fabPos = { left: window.innerWidth - 56 - 22, top: window.innerHeight - 56 - 22 };
    const p = state.ui.fabPos; p.left = clamp(p.left, 6, window.innerWidth - 62); p.top = clamp(p.top, 6, window.innerHeight - 62);
    setPos(fabEl, p); if (!init) save();
  }
  function placeDialog(init) {
    if (!state.ui.dialogPos) { const w = dialogEl.offsetWidth || DIALOG_W, h = dialogEl.offsetHeight || DIALOG_H; state.ui.dialogPos = { left: window.innerWidth - w, top: Math.max(12, Math.round((window.innerHeight - h) / 2) - 40) }; }
    const p = state.ui.dialogPos, w = dialogEl.offsetWidth || DIALOG_W, h = dialogEl.offsetHeight || DIALOG_H;
    p.left = clamp(p.left, 6, Math.max(6, window.innerWidth - w - 6)); p.top = clamp(p.top, 6, Math.max(6, window.innerHeight - h - 6));
    setPos(dialogEl, p); if (!init) save();
  }
  function placeMenu() {
    const r = menuBtn.getBoundingClientRect(), w = menuEl.offsetWidth || 264, h = menuEl.offsetHeight || 320;
    let left = r.right - w, top = r.bottom + 8;
    if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 8);
    setPos(menuEl, { left: clamp(left, 8, window.innerWidth - w - 8), top: clamp(top, 8, window.innerHeight - h - 8) });
  }
  function placeSettings() {
    const base = isMenuOpen() ? menuEl.getBoundingClientRect() : (isDialogOpen() ? dialogEl.getBoundingClientRect() : fabEl.getBoundingClientRect());
    const w = settingsEl.offsetWidth || 340, h = settingsEl.offsetHeight || 420;
    let left = base.left - w - 12; if (left < 8) left = base.right + 12;
    setPos(settingsEl, { left: clamp(left, 8, window.innerWidth - w - 8), top: clamp(base.top, 8, Math.max(8, window.innerHeight - h - 8)) });
  }
  function relocate() { if (isMenuOpen()) placeMenu(); if (isSettingsOpen()) placeSettings(); }

  /* --------------------------------------------------------- 开关逻辑 */
  const isDialogOpen = () => dialogEl.classList.contains("shown");
  const isMenuOpen = () => menuEl.classList.contains("shown");
  const isSettingsOpen = () => settingsEl.classList.contains("shown");
  const show = (n) => { n.classList.remove("hidden"); n.classList.add("shown"); };
  const hide = (n) => { n.classList.remove("shown"); n.classList.add("hidden"); };

  function expandDialog(animate) {
    if (!state.ui.disclaimerAccepted) { showDisclaimer(); return; }
    state.ui.expanded = true; fabEl.style.display = "none"; placeDialog(true);
    if (animate === false) { dialogEl.classList.remove("hidden"); dialogEl.classList.add("shown"); } else show(dialogEl);
    updateHeader(); scrollToBottom(); setTimeout(scrollToBottom, 60); save();
  }
  function collapseDialog(animate) {
    state.ui.expanded = false; hideMenu(); hideSettings();
    if (animate === false) { dialogEl.classList.remove("shown"); dialogEl.classList.add("hidden"); } else hide(dialogEl);
    fabEl.style.display = "flex"; placeFab(true); save();
  }
  function openMenu() { renderMenu(); placeMenu(); show(menuEl); }
  function hideMenu() { hide(menuEl); }
  function toggleMenu() { if (isMenuOpen()) hideMenu(); else openMenu(); }
  function toggleDark() {
    state.settings.darkMode = !state.settings.darkMode;
    if (state.settings.darkMode && state.settings.material === "liquid") state.settings.material = "glass";
    themeTransition();
    applyAppearance(); applyTexts(); renderSettings(); renderInputState(); save();
    toast(state.settings.darkMode ? t("darkOnMsg") : t("darkOffMsg"));
  }
  function openSettings(page) { settingsPage = page || "root"; renderSettings(); placeSettings(); show(settingsEl); }
  function hideSettings() { hide(settingsEl); }

  function onDocPointerDown(e) {
    let path = []; try { path = e.composedPath ? e.composedPath() : [e.target]; } catch (err) { path = [e.target]; }
    const within = (n) => path.indexOf(n) >= 0;
    if (within(menuEl) || within(settingsEl) || within(menuBtn)) return;
    hideMenu(); hideSettings();
  }

  /* -------------------------------------------------------------- 菜单 */
  function renderMenuStatic() {
    menuHead.textContent = t("chats");
    newBtn.textContent = t("newChat");
    setBtn.textContent = "⚙  " + t("settings");
    deepLabel.textContent = t("deepThink");
    modelHead.textContent = t("modelName");
    deepSwitch.setAttribute("aria-checked", String(!!state.ui.deepThink));
  }
  function renderMenu() {
    renderMenuStatic();
    // 对话列表
    convListEl.innerHTML = "";
    if (!state.conversations.length) { const e = el("div", "hint"); e.textContent = t("emptyChats"); e.style.textAlign = "center"; convListEl.appendChild(e); }
    else state.conversations.slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).forEach((c) => {
      const item = el("div", "conv-item" + (c.id === state.activeConvId ? " active" : ""));
      const title = el("div", "c-title"); title.textContent = convTitle(c); item.appendChild(title);
      const del = el("button", "c-del"); del.type = "button"; del.textContent = "🗑"; del.title = t("delete");
      del.addEventListener("click", (e) => { e.stopPropagation(); if (window.confirm(t("confirmDelete"))) { deleteConversation(c.id); renderMenu(); updateHeader(); } });
      item.appendChild(del);
      item.addEventListener("click", () => { state.activeConvId = c.id; hideMenu(); renderMessages(); updateHeader(); save(); });
      convListEl.appendChild(item);
    });
    // 模型列表
    modelListEl.innerHTML = "";
    const models = state.settings.models || [];
    if (!models.length) { const e = el("div", "hint"); e.textContent = t("noModels"); modelListEl.appendChild(e); }
    else models.forEach((m) => {
      const item = el("div", "model-item" + (m === state.settings.model ? " active" : ""));
      const nm = el("div", "m-name"); nm.textContent = m; item.appendChild(nm);
      if (m === state.settings.model) { const ck = el("div", "m-check"); ck.textContent = "✓"; item.appendChild(ck); }
      item.addEventListener("click", () => { state.settings.model = m; updateHeader(); renderMenu(); renderInputState(); save(); });
      modelListEl.appendChild(item);
    });
  }

  /* -------------------------------------------------------------- 设置 */
  function tween(from, to, cb) {
    if (from === to) { cb(to); return; }
    const t0 = performance.now(), dur = 420;
    const step = (now) => { const k = Math.min(1, (now - t0) / dur); const e = 1 - Math.pow(1 - k, 3); cb(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function updateThumb(rec, animate) {
    const on = rec.seg.querySelector('button[data-key="' + rec.key + '"]');
    if (!on) return;
    const w = on.offsetWidth;
    if (!w) { requestAnimationFrame(() => updateThumb(rec, animate)); return; }
    const prevKey = segShown[rec.id];
    if (animate && prevKey != null && prevKey !== rec.key) {
      const pb = rec.seg.querySelector('button[data-key="' + prevKey + '"]');
      if (pb && pb.offsetWidth) {
        // 滑块修复
        rec.thumb.style.transition = "none";
        rec.thumb.style.width = pb.offsetWidth + "px";
        rec.thumb.style.transform = "translateX(" + (pb.offsetLeft - 4) + "px)";
        void rec.thumb.offsetWidth;
        requestAnimationFrame(() => {
          rec.thumb.style.transition = "";
          rec.thumb.style.width = w + "px";
          rec.thumb.style.transform = "translateX(" + (on.offsetLeft - 4) + "px)";
        });
        segShown[rec.id] = rec.key;
        return;
      }
    }
    rec.thumb.style.transition = "none";
    rec.thumb.style.width = w + "px";
    rec.thumb.style.transform = "translateX(" + (on.offsetLeft - 4) + "px)";
    void rec.thumb.offsetWidth;
    rec.thumb.style.transition = "";
    segShown[rec.id] = rec.key;
  }
  function makeSeg(id, items, currentKey, onPick, disabled) {
    const seg = el("div", "seg" + (disabled ? " disabled" : ""));
    items.forEach((it) => {
      const b = el("button"); b.type = "button"; b.textContent = it.text; b.setAttribute("data-key", it.key);
      b.setAttribute("aria-pressed", it.key === currentKey ? "true" : "false");
      if (disabled) b.disabled = true;
      b.addEventListener("click", () => {
        if (disabled) return;
        seg.querySelectorAll("button[data-key]").forEach((x) => x.setAttribute("aria-pressed", String(x.getAttribute("data-key") === it.key)));
        const rec = thumbTargets.find((r) => r.seg === seg); if (rec) { rec.key = it.key; updateThumb(rec, true); }
        setTimeout(() => onPick(it.key), 430);
      });
      seg.appendChild(b);
    });
    const thumb = el("span", "seg-thumb"); seg.appendChild(thumb);
    const rec = { id: id, seg: seg, thumb: thumb, key: currentKey };
    thumbTargets.push(rec); updateThumb(rec, true);
    return seg;
  }
  function updateAllThumbs() { thumbTargets.forEach((r) => updateThumb(r, false)); }

  function renderSettings() {
    thumbTargets.length = 0; setBody.innerHTML = "";
    if (settingsPage === "root") {
      setTitle.textContent = t("settings");
      setBody.appendChild(navRow("🎨", t("material"), t("materialType"), () => openSettings("material")));
      setBody.appendChild(navRow("⚙️", t("modelConfig"), t("apiBase"), () => openSettings("model")));
      setBody.appendChild(langRow());
      const sub = el("div", "sub"); sub.textContent = t("tokenUsage"); setBody.appendChild(sub);
      setBody.appendChild(usageBlock());
    } else if (settingsPage === "material") {
      setTitle.textContent = t("material");
      setBody.appendChild(langRow());
      setBody.appendChild(materialBlock());
    } else if (settingsPage === "model") {
      setTitle.textContent = t("modelConfig");
      setBody.appendChild(modelBlock());
      const sub = el("div", "sub"); sub.textContent = t("tokenUsage"); setBody.appendChild(sub);
      setBody.appendChild(usageBlock());
    }
    requestAnimationFrame(() => { updateAllThumbs(); if (isSettingsOpen()) placeSettings(); });
  }
  function navRow(icon, title, sub, onClick) {
    const r = el("div", "nav-row");
    const i = el("div", "nr-icon"); i.textContent = icon; r.appendChild(i);
    const tx = el("div", "nr-text");
    const tt = el("div", "nr-title"); tt.textContent = title;
    const ss = el("div", "nr-sub"); ss.textContent = sub;
    tx.appendChild(tt); tx.appendChild(ss); r.appendChild(tx);
    const ar = el("div", "nr-arrow"); ar.textContent = "›"; r.appendChild(ar);
    r.addEventListener("click", onClick); return r;
  }
  function langRow() {
    const box = el("div"); const sub = el("div", "sub"); sub.textContent = t("uiLang"); box.appendChild(sub);
    box.appendChild(makeSeg("language", [{ key: "zh", text: t("uiLangZh") }, { key: "en", text: t("uiLangEn") }], state.settings.language, (k) => { state.settings.language = k; applyTexts(); renderSettings(); save(); }));
    return box;
  }
  function sliderRow(id, label, min, max, value, onInput, unit, disabled, liveApply) {
    const wrap = el("div");
    const row = el("div", "row" + (disabled ? " dim" : ""));
    const lab = el("span"); lab.textContent = label;
    const val = el("span", "val");
    const setLabel = (v) => { val.textContent = v + (unit || ""); };
    setLabel(value);
    row.appendChild(lab); row.appendChild(val); wrap.appendChild(row);
    const rng = el("input", "range"); rng.type = "range"; rng.min = String(min); rng.max = String(max); rng.value = String(value);
    if (disabled) rng.disabled = true;
    rng.addEventListener("input", () => { const v = Number(rng.value); setLabel(v); onInput(v); });
    wrap.appendChild(rng);
    const prev = rangeShown[id];
    if (typeof prev === "number" && prev !== value) {
      rng.value = String(prev); setLabel(prev);
      tween(prev, value, (v) => { const rv = Math.round(v); rng.value = String(rv); setLabel(rv); if (liveApply) liveApply(rv); });
    }
    rangeShown[id] = value;
    return wrap;
  }
  function materialBlock() {
    const box = el("div");
    const sub1 = el("div", "sub"); sub1.textContent = t("materialType"); box.appendChild(sub1);
    box.appendChild(makeSeg("material", [{ key: "glass", text: t("matGlass") }, { key: "liquid", text: t("matLiquid") }], state.settings.material, (k) => { state.settings.material = k; themeTransition(); applyAppearance(); renderSettings(); save(); }, !!state.settings.darkMode));
    if (state.settings.darkMode) { const dh = el("div", "hint"); dh.textContent = t("darkLockHint"); box.appendChild(dh); }
    const mode = state.settings.material;
    const p = state.settings.params[mode];
    const liveAlpha = (v) => rootEl.style.setProperty("--ai-alpha", alphaFactor(v).toFixed(3));
    const liveBlur = (v) => rootEl.style.setProperty("--ai-blur", v + "px");
    const liveRefract = (v) => { rootEl.style.setProperty("--ai-refract", (mode === "liquid" ? (v / 100) : 0).toFixed(2)); disp.setAttribute("scale", String(refractScale(mode === "liquid" ? v : 0))); };
    box.appendChild(sliderRow("opacity", t("opacity"), 0, 100, p.alpha, (v) => { p.alpha = v; applyAppearance(); save(); }, "%", false, liveAlpha));
    box.appendChild(sliderRow("blur", t("blur"), 0, 40, p.blur, (v) => { p.blur = v; applyAppearance(); save(); }, "px", false, liveBlur));
    box.appendChild(sliderRow("refraction", t("refraction"), 0, 100, p.refraction, (v) => { p.refraction = v; applyAppearance(); save(); }, "%", mode !== "liquid", liveRefract));
    const hint = el("div", "hint"); hint.textContent = t("materialHint"); box.appendChild(hint);
    const reset = el("button", "full-btn"); reset.type = "button"; reset.textContent = t("reset");
    reset.addEventListener("click", () => { state.settings.params[mode] = JSON.parse(JSON.stringify(DEFAULT_SETTINGS.params[mode])); applyAppearance(); renderSettings(); save(); });
    box.appendChild(reset); return box;
  }
  function usageBlock() {
    const box = el("div"); const limit = Number(state.settings.tokenLimit) || 0, used = Number(state.tokenUsed) || 0;
    const row = el("div", "row"); const l = el("span"); l.textContent = fmtNum(used) + " / " + fmtNum(limit); row.appendChild(l);
    const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
    const r = el("span", "val"); r.textContent = (limit > 0 ? pct.toFixed(1) : "0") + "%"; row.appendChild(r); box.appendChild(row);
    const bar = el("div", "progress-bar"); const fill = el("i"); fill.style.width = pct + "%";
    if (limit > 0) { if (used >= limit) fill.classList.add("over"); else if (used >= limit * 0.8) fill.classList.add("warn"); }
    bar.appendChild(fill); box.appendChild(bar);
    if (limit > 0 && used >= limit * 0.8) { const w = el("div", "hint"); w.style.color = used >= limit ? "#c0392b" : "#b7791f"; w.textContent = used >= limit ? t("tokenOver") : t("tokenWarn"); box.appendChild(w); }
    const field = el("div", "field"); const lb = el("label"); lb.textContent = t("tokenLimitLabel"); field.appendChild(lb);
    const inp = el("input", "input"); inp.type = "number"; inp.min = "0"; inp.step = "1000"; inp.value = String(limit);
    inp.addEventListener("change", () => { state.settings.tokenLimit = Math.max(0, Number(inp.value) || 0); renderTokenBadge(); save(); });
    field.appendChild(inp); box.appendChild(field);
    const resetUsage = el("button", "full-btn"); resetUsage.type = "button"; resetUsage.textContent = t("resetUsage");
    resetUsage.addEventListener("click", () => { state.tokenUsed = 0; renderTokenBadge(); renderSettings(); save(); });
    box.appendChild(resetUsage); return box;
  }
  function fieldRow(label, value, placeholder, onChange, type) {
    const field = el("div", "field"); const lb = el("label"); lb.textContent = label; field.appendChild(lb);
    const wrap = el("div", "input-wrap");
    const inp = el("input", "input"); inp.type = type || "text"; inp.setAttribute("autocomplete", "off"); if (placeholder) inp.placeholder = placeholder; inp.value = value || "";
    inp.addEventListener("change", () => onChange(inp.value)); wrap.appendChild(inp);
    if (type === "password") {
      const tg = el("button", "eye-btn"); tg.type = "button"; tg.textContent = "👁"; tg.title = t("showKey"); tg.setAttribute("aria-pressed", "false");
      tg.addEventListener("click", () => {
        const shown = inp.type === "text";
        inp.type = shown ? "password" : "text";
        tg.textContent = shown ? "👁" : "🙈";
        tg.setAttribute("aria-pressed", String(!shown));
        tg.title = shown ? t("showKey") : t("hideKey");
      });
      wrap.appendChild(tg);
    }
    field.appendChild(wrap); return field;
  }
  function modelsEditor() {
    const box = el("div");
    const sub = el("div", "sub"); sub.textContent = t("modelsLabel"); box.appendChild(sub);
    const chips = el("div", "chips");
    const models = state.settings.models || [];
    if (!models.length) { const e = el("div", "hint"); e.textContent = t("noModels"); box.appendChild(e); }
    models.forEach((m) => {
      const chip = el("span", "chip" + (m === state.settings.model ? " active" : ""));
      const nm = el("span"); nm.textContent = m; chip.appendChild(nm);
      if (m === state.settings.model) { const c = el("span"); c.textContent = "✓"; chip.appendChild(c); }
      const x = el("span", "x"); x.textContent = "×"; x.title = t("remove");
      x.addEventListener("click", (e) => { e.stopPropagation(); state.settings.models = models.filter((y) => y !== m); if (state.settings.model === m) state.settings.model = state.settings.models[0] || ""; renderSettings(); updateHeader(); save(); });
      chip.appendChild(x);
      chip.addEventListener("click", () => { state.settings.model = m; renderSettings(); updateHeader(); renderInputState(); save(); });
      chips.appendChild(chip);
    });
    box.appendChild(chips);
    const addRow = el("div", "add-row");
    const inp = el("input", "input"); inp.type = "text"; inp.placeholder = t("addModelPlaceholder"); addRow.appendChild(inp);
    const addBtn = el("button", "mini"); addBtn.type = "button"; addBtn.textContent = t("add");
    const doAdd = () => { const v = (inp.value || "").trim(); if (!v) return; if (!Array.isArray(state.settings.models)) state.settings.models = []; if (state.settings.models.indexOf(v) < 0) state.settings.models.push(v); if (!state.settings.model) state.settings.model = v; inp.value = ""; renderSettings(); updateHeader(); renderInputState(); save(); };
    addBtn.addEventListener("click", doAdd);
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); doAdd(); } });
    addRow.appendChild(addBtn); box.appendChild(addRow);
    const load = el("button", "full-btn"); load.type = "button"; load.textContent = t("loadDefaults");
    load.addEventListener("click", () => {
      const tpl = state.settings.template;
      if (tpl !== "custom") {
        const defs = TEMPLATES[tpl].models.slice();
        const merged = (state.settings.models || []).slice();
        defs.forEach((d) => { if (merged.indexOf(d) < 0) merged.push(d); });
        state.settings.models = merged;
        if (!state.settings.model && merged.length) state.settings.model = merged[0];
      }
      renderSettings(); updateHeader(); renderInputState(); save();
    });
    box.appendChild(load);
    return box;
  }
  async function runConnectivityTest(btn, out) {
    const s = state.settings;
    if (!(s.apiBase && s.apiBase.trim() && s.apiKey && s.apiKey.trim() && s.model && s.model.trim())) {
      out.textContent = "✖ " + t("testNeedConfig"); out.style.color = badColor(); toast(t("testNeedConfig"), "bad"); return;
    }
    const url = joinUrl(s.apiBase, s.chatPath);
    const headers = { "Content-Type": "application/json" };
    headers["Authorization"] = "Bearer " + s.apiKey;
    Object.assign(headers, parseHeaders(s.extraHeaders));
    const body = { model: s.model, messages: [{ role: "user", content: "ping" }], max_tokens: 8, stream: false };
    btn.disabled = true; const old = btn.textContent; btn.textContent = t("testing"); out.textContent = ""; out.style.color = "";
    try {
      const controller = new AbortController(); const to = setTimeout(() => { try { controller.abort(); } catch (e) {} }, 15000);
      const res = await fetch(url, { method: "POST", headers: headers, body: JSON.stringify(body), signal: controller.signal });
      clearTimeout(to);
      const ctype = (res.headers.get("content-type") || "").toLowerCase();
      if (res.ok) {
        if (ctype.indexOf("application/json") >= 0) { let d = null; try { d = await res.json(); } catch (e) {} if (d && d.error) throw new Error(d.error.message || JSON.stringify(d.error)); }
        out.textContent = "✓ " + t("testOk") + " · " + s.model; out.style.color = okColor(); toast(t("testOk"), "ok");
      } else { let txt = ""; try { txt = await res.text(); } catch (e) {} throw new Error("HTTP " + res.status + " " + (txt || "").slice(0, 160)); }
    } catch (err) {
      out.textContent = "✖ " + t("testFail") + " · " + (err && err.name === "AbortError" ? "timeout" : (err && err.message ? err.message : "error")); out.style.color = badColor(); toast(t("testFail"), "bad");
    } finally { btn.disabled = false; btn.textContent = old; }
  }
  function modelBlock() {
    const box = el("div"); const s = state.settings;
    const sub1 = el("div", "sub"); sub1.textContent = t("template"); box.appendChild(sub1);
    box.appendChild(makeSeg("template", [{ key: "openai", text: "OpenAI" }, { key: "deepseek", text: "DeepSeek" }, { key: "custom", text: t("tplCustom") }], s.template, (k) => {
      s.template = k;
      if (k === "openai" || k === "deepseek") {
        s.apiBase = TEMPLATES[k].apiBase; s.chatPath = TEMPLATES[k].chatPath;
        s.models = TEMPLATES[k].models.slice(); s.model = s.models[0] || "";
      }
      renderSettings(); renderInputState(); renderTokenBadge(); updateHeader(); save();
    }));
    box.appendChild(fieldRow(t("apiBase"), s.apiBase, "https://api.example.com/v1", (v) => { s.apiBase = v.trim(); onSettingsChanged(); }));
    box.appendChild(fieldRow(t("chatPath"), s.chatPath, "/chat/completions", (v) => { s.chatPath = v.trim(); onSettingsChanged(); }));
    box.appendChild(fieldRow(t("apiKey"), s.apiKey, "sk-...", (v) => { s.apiKey = v.trim(); onSettingsChanged(); }, "password"));
    const hf = el("div", "field"); const hfl = el("label"); hfl.textContent = t("extraHeaders"); hf.appendChild(hfl);
    const ta = el("textarea", "textarea"); ta.value = s.extraHeaders || ""; ta.placeholder = '{ "X-Custom": "1" }';
    ta.addEventListener("change", () => { s.extraHeaders = ta.value; save(); }); hf.appendChild(ta); box.appendChild(hf);
    box.appendChild(modelsEditor());
    const testRow = el("div", "", "display:flex;align-items:center;gap:8px;margin:8px 2px 2px;");
    const testBtn = el("button", "mini"); testBtn.type = "button"; testBtn.textContent = "🔌 " + t("testConn");
    const testOut = el("div", ""); testOut.style.fontSize = "11.5px"; testOut.style.flex = "1 1 auto"; testOut.style.lineHeight = "1.4"; testOut.style.wordBreak = "break-word";
    testBtn.addEventListener("click", () => runConnectivityTest(testBtn, testOut));
    testRow.appendChild(testBtn); testRow.appendChild(testOut); box.appendChild(testRow);
    const st = el("div", isConfigured() ? "badge-ok" : "badge-bad"); st.textContent = isConfigured() ? t("configured") : "✖ " + t("notConfiguredTip"); box.appendChild(st);
    return box;
  }
  function onSettingsChanged() { applyTexts(); renderInputState(); renderTokenBadge(); updateHeader(); save(); }

  /* --------------------------------------------------------- 对话 消息 */
  function convTitle(c) { const f = (c.messages || []).find((m) => m.role === "user" && (m.content || "").trim()); if (f) { let s = f.content.trim().replace(/\s+/g, " "); return s.length > 22 ? s.slice(0, 22) + "…" : s; } return t("untitled"); }
  function activeConversation() { let c = state.conversations.find((x) => x.id === state.activeConvId); if (!c) { c = state.conversations[0]; if (c) state.activeConvId = c.id; } return c; }
  function ensureConversation() { let c = activeConversation(); if (!c) c = newConversation(); return c; }
  function newConversation() { const c = { id: uid(), messages: [], createdAt: Date.now(), updatedAt: Date.now() }; state.conversations.push(c); state.activeConvId = c.id; save(); return c; }
  function deleteConversation(id) { state.conversations = state.conversations.filter((c) => c.id !== id); if (state.activeConvId === id) state.activeConvId = state.conversations.length ? state.conversations[0].id : null; renderMessages(); save(); }

  function highlightCode(code, lang) {
    let h = esc(code);
    const pyLike = /^(py|python|sh|bash|shell|zsh|yaml|yml|rb|ruby|perl|r)$/i.test(lang || "");
    const kw = "(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|super|this|try|catch|finally|throw|async|await|yield|import|from|export|default|typeof|instanceof|in|of|void|delete|true|false|null|undefined|def|elif|lambda|None|True|False|and|or|not|print|self|public|private|protected|static|final|int|float|double|char|long|short|boolean|string|struct|enum|interface|implements|package|func|go|defer|chan|map|range|val|fun|object|override|suspend)";
    const re = new RegExp(
      "(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*" + (pyLike ? "|#[^\\n]*" : "") + ")" +
      "|(&quot;(?:[^&]|&(?!quot;))*?&quot;|&#39;(?:[^&]|&(?!#39;))*?&#39;|`[^`]*`)" +
      "|(\\b\\d+(?:\\.\\d+)?\\b)" +
      "|(\\b" + kw + "\\b)",
      "g");
    return h.replace(re, (m, com, str, num, k) => {
      if (com != null && com !== undefined) return '<span class="hl-com">' + com + '</span>';
      if (str) return '<span class="hl-str">' + str + '</span>';
      if (num) return '<span class="hl-num">' + num + '</span>';
      if (k) return '<span class="hl-kw">' + k + '</span>';
      return m;
    });
  }
  function renderInline(text) {
    let x = esc(text);
    x = x.replace(/`([^`\n]+)`/g, '<code class="inline">$1</code>');
    x = x.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
    x = x.replace(/\n/g, "<br>");
    return x;
  }
  function renderMarkdown(s) {
    const src = String(s == null ? "" : s);
    const out = [];
    const fence = /```([^\n`]*)\n?([\s\S]*?)```/g;
    let last = 0, m;
    while ((m = fence.exec(src)) !== null) {
      if (m.index > last) out.push({ type: "text", text: src.slice(last, m.index) });
      out.push({ type: "code", lang: (m[1] || "").trim(), code: m[2].replace(/\n$/, "") });
      last = m.index + m[0].length;
    }
    if (last < src.length) out.push({ type: "text", text: src.slice(last) });
    if (!out.length) out.push({ type: "text", text: src });
    let html = "";
    out.forEach((seg) => {
      if (seg.type === "code") {
        const lang = seg.lang || "code";
        html += '<div class="code-block"><div class="code-head"><span class="code-lang">' + esc(lang) + '</span><span class="code-spacer"></span><button type="button" class="code-copy" data-act="codecopy">' + esc(t("codeCopy")) + '</button></div><pre class="code"><code>' + highlightCode(seg.code, lang) + '</code></pre></div>';
      } else {
        html += renderInline(seg.text);
      }
    });
    return html;
  }
  function renderMessages() {
    dlgBody.innerHTML = ""; const conv = ensureConversation();
    if (!conv.messages.length) {
      const tip = el("div", "empty-tip");
      tip.textContent = isConfigured() ? t("emptyTip") : t("emptyTipLocked");
      dlgBody.appendChild(tip); return;
    }
    conv.messages.forEach((m, i) => dlgBody.appendChild(buildMessageEl(m, i)));
    scrollToBottom();
  }
  function buildMessageEl(m, idx) {
    const wrap = el("div", "msg " + (m.role === "user" ? "user" : "ai"));
    const who = el("div", "who"); who.textContent = m.role === "user" ? t("you") : (m.model || state.settings.model || t("ai")); wrap.appendChild(who);
    if (m.role === "assistant" && m.reasoning) {
      const det = el("details", "reasoning"); const sum = el("summary"); sum.textContent = t("reasoning"); det.appendChild(sum);
      const rb = el("div", "r-body"); rb.textContent = m.reasoning; det.appendChild(rb);
      m._reasonEl = det; m._reasonBodyEl = rb; wrap.appendChild(det);
    }
    const bubble = el("div", "bubble"); if (m.error) bubble.classList.add("err-bubble");
    if (m.role === "assistant") { bubble.innerHTML = renderMarkdown(m.content || ""); if (m.streaming && !m.content) bubble.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>'; }
    else bubble.textContent = m.content || "";
    m._bubbleEl = bubble;
    if (m.role === "user" && m.images && m.images.length) { const tr = el("div", "thumb-row"); m.images.forEach((src) => { const img = el("img"); img.src = src; tr.appendChild(img); }); wrap.appendChild(tr); }
    wrap.appendChild(bubble);
    if (m.role === "user" && (m.searching || (m.searchResults && m.searchResults.length))) {
      if (m.searching) { const sc = el("div", "search-card"); sc.textContent = "🔎 " + t("searchingTip"); wrap.appendChild(sc); }
      else {
        const sc = el("details", "search-card");
        const head = el("summary", "search-head"); head.textContent = "🔎 " + t("searchSources") + " · " + m.searchResults.length; sc.appendChild(head);
        m.searchResults.forEach((r) => {
          const row = el("a", "search-item"); row.href = r.url || "#"; row.target = "_blank"; row.rel = "noreferrer noopener";
          const tt = el("div", "search-title"); tt.textContent = r.title || r.url;
          const sn = el("div", "search-snip"); sn.textContent = r.snippet;
          const so = el("div", "search-src"); so.textContent = (r.src ? r.src + " · " : "") + (r.url || "");
          row.appendChild(tt); row.appendChild(sn); row.appendChild(so); sc.appendChild(row);
        });
        wrap.appendChild(sc);
      }
    }
    if (m.role === "assistant" && !m.streaming && !m.error) {
      const acts = el("div", "msg-actions");
      const cp = el("button", "act-btn"); cp.type = "button"; cp.textContent = "\u29c9 " + t("copy"); cp.setAttribute("data-act", "copy"); cp.setAttribute("data-idx", String(typeof idx === "number" ? idx : ""));
      const rg = el("button", "act-btn"); rg.type = "button"; rg.textContent = "\u21bb " + t("regen"); rg.setAttribute("data-act", "regen"); rg.setAttribute("data-idx", String(typeof idx === "number" ? idx : ""));
      acts.appendChild(cp); acts.appendChild(rg); wrap.appendChild(acts);
    }
    return wrap;
  }
  function scrollToBottom() { dlgBody.scrollTop = dlgBody.scrollHeight; }

  /* ------------------------------------------------------------ 图片 */
  const NL = String.fromCharCode(10);
  const IMAGE_TYPES = ["image/png","image/jpeg","image/jpg","image/gif","image/webp","image/bmp"];
  const MAX_IMAGES = 10, MAX_IMAGE_SIZE = 8 * 1024 * 1024, MAX_FILE_SIZE = 50 * 1024 * 1024;
  function humanSize(n) { n = Number(n) || 0; if (n < 1024) return n + " B"; if (n < 1048576) return (n / 1024).toFixed(1) + " KB"; return (n / 1048576).toFixed(2) + " MB"; }
  function isTextOnlyModel() {
    const m = (state.settings.model || "").trim().toLowerCase(); if (!m) return false;
    if (/(vision|vl|omni|gpt-4o|4\.1|gemini|claude|qwen.*vl|glm-4v|llava|pixtral|internvl)/i.test(m)) return false;
    if (/deepseek/.test(m)) return /(deepseek-chat|deepseek-reasoner|deepseek-r1)/.test(m);
    return /(text-only|o1-mini|o1-preview)/i.test(m);
  }
  function handleImageFiles(files) {
    const list = Array.prototype.slice.call(files);
    for (let k = 0; k < list.length; k++) {
      const f = list[k];
      if (pendingImages.length >= MAX_IMAGES) { toast(t("tooManyImages")); break; }
      const okType = IMAGE_TYPES.indexOf((f.type || "").toLowerCase()) !== -1 || /\.(png|jpe?g|gif|webp|bmp)$/i.test(f.name || "");
      if (!okType) { toast(t("imageFormatOnly")); continue; }
      if (f.size > MAX_IMAGE_SIZE) { toast(t("imageTooLarge")); continue; }
      const reader = new FileReader(); reader.onload = () => { pendingImages.push(reader.result); renderAttachRow(); }; reader.readAsDataURL(f);
    }
  }
  async function handleDocFiles(files) {
    const list = Array.prototype.slice.call(files);
    if (!list.length) return;
    if (isTextOnlyModel()) { toast(t("textOnlyNoFile")); return; }
    const f = list[0];
    if (f.size > MAX_FILE_SIZE) { toast(t("fileTooLarge")); return; }
    toast(t("fileExtracting"));
    let text = "";
    try { text = await extractAnyFile(f); } catch (e) { text = ""; }
    text = String(text || "").replace(/\r\n/g, NL).trim();
    if (!text) { toast(t("fileParseFail")); return; }
    pendingFiles = [{ name: f.name, size: f.size, text: text.slice(0, 300000) }];
    renderAttachRow();
  }
  const _libCache = {};
  function loadScriptOnce(urls) {
    const key = urls.join("|"); if (_libCache[key]) return _libCache[key];
    _libCache[key] = new Promise((resolve, reject) => {
      let i = 0;
      const next = () => {
        if (i >= urls.length) { reject(new Error("load fail")); return; }
        const url = urls[i++]; const s = document.createElement("script"); s.src = url; s.async = true;
        s.onload = () => resolve(url);
        s.onerror = () => { try { s.remove(); } catch (e) {} next(); };
        (document.head || document.documentElement).appendChild(s);
      };
      next();
    });
    return _libCache[key];
  }
  function readAsText(f) { return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result || "")); r.onerror = () => reject(new Error("read fail")); r.readAsText(f); }); }
  function readAsArrayBuffer(f) { return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = () => reject(new Error("read fail")); r.readAsArrayBuffer(f); }); }
  async function extractPdf(f) {
    await loadScriptOnce(["https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"]);
    const pdfjs = window.pdfjsLib; if (!pdfjs) throw new Error("no pdfjs");
    try { pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"; } catch (e) {}
    const buf = await readAsArrayBuffer(f);
    const doc = await pdfjs.getDocument({ data: buf }).promise;
    const out = [];
    for (let i = 1; i <= doc.numPages; i++) { const page = await doc.getPage(i); const tc = await page.getTextContent(); out.push(tc.items.map((it) => it.str).join(" ")); }
    return out.join(NL + NL);
  }
  async function extractDocx(f) {
    await loadScriptOnce(["https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"]);
    const m = window.mammoth; if (!m) throw new Error("no mammoth");
    const buf = await readAsArrayBuffer(f);
    const res = await m.extractRawText({ arrayBuffer: buf });
    return res && res.value ? res.value : "";
  }
  async function extractXlsx(f) {
    await loadScriptOnce(["https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"]);
    const XLSX = window.XLSX; if (!XLSX) throw new Error("no xlsx");
    const buf = await readAsArrayBuffer(f);
    const wb = XLSX.read(buf, { type: "array" });
    const out = [];
    wb.SheetNames.forEach((sn) => { out.push("\u3010" + sn + "\u3011"); out.push(XLSX.utils.sheet_to_csv(wb.Sheets[sn])); });
    return out.join(NL);
  }
  async function extractAnyFile(f) {
    const name = (f.name || "").toLowerCase();
    const ext = name.slice(name.lastIndexOf(".") + 1);
    if (ext === "pdf") return await extractPdf(f);
    if (ext === "docx") return await extractDocx(f);
    if (ext === "xlsx" || ext === "xls") return await extractXlsx(f);
    return await readAsText(f);
  }
  function renderAttachRow() {
    attachRow.innerHTML = "";
    pendingImages.forEach((src, i) => {
      const box = el("div", "attach"); const img = el("img"); img.src = src; box.appendChild(img);
      const rm = el("button", "rm"); rm.type = "button"; rm.textContent = "\u00d7"; rm.addEventListener("click", () => { pendingImages.splice(i, 1); renderAttachRow(); });
      box.appendChild(rm); attachRow.appendChild(box);
    });
    pendingFiles.forEach((f, i) => {
      const box = el("div", "attach attach-file");
      const ic = el("span", "af-icon"); ic.textContent = "\ud83d\udcc4"; box.appendChild(ic);
      const nm = el("span", "af-name"); nm.textContent = f.name; nm.title = f.name + " \u00b7 " + humanSize(f.size); box.appendChild(nm);
      const rm = el("button", "rm"); rm.type = "button"; rm.textContent = "\u00d7"; rm.addEventListener("click", () => { pendingFiles.splice(i, 1); renderAttachRow(); });
      box.appendChild(rm); attachRow.appendChild(box);
    });
  }
  function openUploadMenu() {
    uploadMenu.style.display = "flex"; uploadMenu.classList.add("shown");
    const r = uploadBtn.getBoundingClientRect();
    const mw = uploadMenu.offsetWidth || 150, mh = uploadMenu.offsetHeight || 70;
    let left = r.right - mw; if (left < 8) left = 8; if (left + mw > window.innerWidth - 8) left = window.innerWidth - mw - 8;
    let top = r.top - mh - 8; if (top < 8) top = r.bottom + 8;
    uploadMenu.style.left = Math.round(left) + "px"; uploadMenu.style.top = Math.round(top) + "px";
    const textOnly = isTextOnlyModel();
    umFile.classList.toggle("disabled", textOnly);
    umFile.title = textOnly ? t("textOnlyNoFile") : "";
  }
  function closeUploadMenu() { uploadMenu.classList.remove("shown"); uploadMenu.style.display = "none"; }
  /* --------------------------------------------------------- 发送/流 */
  const isStreaming = () => !!currentStream;
  function autoGrow() { msgInput.style.height = "auto"; msgInput.style.height = Math.min(140, msgInput.scrollHeight) + "px"; }
  function warnNotConfigured() { toast(t("needConfig")); if (!isDialogOpen()) expandDialog(true); if (!isSettingsOpen()) openSettings("model"); }
  function simplifyQuery(q) {
    return (q || "").replace(/[\uff1f?\u3002\uff0c,\uff01!\u3001\uff1b;\uff1a:\u201c\u201d"'\u2018\u2019\uff08\uff09()\u3010\u3011\[\]\u300a\u300b<>\u00b7]/g, " ").replace(/\s+/g, " ").trim()
      .split(" ").filter((w) => w && !/^(\u7684|\u4e86|\u662f|\u5728|\u548c|\u4e0e|\u8c01|\u4ec0\u4e48|\u54ea|\u54ea\u4e2a|\u90a3|\u8fd9|\u8bf7\u95ee|\u544a\u8bc9|\u6211|\u4f60|\u4e00\u4e0b|\u662f\u4e0d\u662f|\u5417|\u5462|\u554a|\u8bf7|\u5e2e)$/.test(w)).join(" ").trim() || (q || "").trim();
  }
  function keywordsOf(q) {
    const s = simplifyQuery(q); const words = s.split(" ").filter(Boolean);
    if (words.length <= 4) return s;
    return words.slice(0, 5).join(" ");
  }
  async function webSearchOne(q, push) {
    const query = (q || "").trim(); if (!query) return;
    try {
      const r = await fetch("https://api.duckduckgo.com/?q=" + encodeURIComponent(query) + "&format=json&no_html=1&skip_disambig=1");
      if (r.ok) {
        const d = await r.json();
        if (d.AbstractText) push(d.Heading || query, d.AbstractText, d.AbstractURL, "DuckDuckGo");
        if (d.Answer) push(d.Heading || query, d.Answer, d.AbstractURL, "DuckDuckGo");
        (d.RelatedTopics || []).forEach((t) => {
          if (Array.isArray(t.Topics)) t.Topics.forEach((x) => push(x.Text, x.Text, x.FirstURL, "DuckDuckGo"));
          else push(t.Text, t.Text, t.FirstURL, "DuckDuckGo");
        });
      }
    } catch (e) {}
    try {
      const wl = state.settings.language === "en" ? "en" : "zh";
      const r2 = await fetch("https://" + wl + ".wikipedia.org/w/api.php?action=query&list=search&srsearch=" + encodeURIComponent(query) + "&format=json&origin=*&srlimit=5");
      if (r2.ok) {
        const d2 = await r2.json();
        ((d2.query && d2.query.search) || []).forEach((x) => {
          const snip = (x.snippet || "").replace(/<[^>]+>/g, "");
          push(x.title, snip, "https://" + wl + ".wikipedia.org/wiki/" + encodeURIComponent(x.title), "Wikipedia");
        });
      }
    } catch (e) {}
  }
  async function runWebSearch(query) {
    const q = (query || "").trim(); if (!q) return [];
    const results = []; const seen = {};
    const push = (title, snippet, url, src) => {
      const key = String(title || snippet || "").replace(/\s+/g, " ").trim().slice(0, 80);
      if (!key || seen[key]) return; seen[key] = 1;
      results.push({ title: String(title || "").trim(), snippet: String(snippet || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(), url: url || "", src: src || "web" });
    };
    const queries = [];
    [q, simplifyQuery(q), keywordsOf(q)].forEach((x) => { if (x && queries.indexOf(x) === -1) queries.push(x); });
    for (let i = 0; i < queries.length; i++) { await webSearchOne(queries[i], push); if (results.length >= 6) break; }
    return results.slice(0, 6);
  }
  function buildApiMessages(conv) {
    const out = []; if (state.ui.deepThink) out.push({ role: "system", content: DEEP_THINK_PROMPT });
    const lastUserMsg = conv.messages.slice().reverse().find((m) => m.role === "user");
    if (lastUserMsg && (lastUserMsg.searchEnabled || lastUserMsg.searching || (lastUserMsg.searchResults && lastUserMsg.searchResults.length))) {
      const list = lastUserMsg.searchResults || [];
      if (list.length) {
        out.push({ role: "system", content: t("searchCtxOpened") + " \u4ee5\u4e0b\u662f\u9488\u5bf9\u7528\u6237\u6700\u65b0\u95ee\u9898\u7684\u8054\u7f51\u5b9e\u65f6\u641c\u7d22\u7ed3\u679c\uff08\u8bf7\u4f18\u5148\u7ed3\u5408\uff0c\u5e76\u6807\u6ce8\u6765\u6e90\u94fe\u63a5\uff09\uff1a" + NL + list.map((r, i) => (i + 1) + ". " + (r.title || "") + " \u2014 " + (r.snippet || "") + " (" + (r.url || "") + ")").join(NL) });
      } else {
        out.push({ role: "system", content: t("searchCtxOpened") + " " + t("searchCtxNoResult") });
      }
    }
    conv.messages.forEach((m) => {
      if (m.error || m.streaming) return;
      let text = m.content || "";
      if (m.role === "user" && m.files && m.files.length) {
        const ft = m.files.map((f) => "\u3010\u6587\u4ef6\uff1a" + f.name + "\u3011" + NL + (f.text || "")).join(NL + NL);
        text = (text ? text + NL + NL : "") + "\u4ee5\u4e0b\u662f\u7528\u6237\u4e0a\u4f20\u6587\u4ef6\u7684\u5185\u5bb9\uff08\u9644\u4ef6\uff09\uff0c\u8bf7\u7ed3\u5408\u5176\u5185\u5bb9\u56de\u7b54\uff1a" + NL + ft;
      }
      if (m.role === "user" && m.images && m.images.length) { const parts = [{ type: "text", text: text }]; m.images.forEach((u) => parts.push({ type: "image_url", image_url: { url: u } })); out.push({ role: "user", content: parts }); }
      else out.push({ role: m.role, content: text });
    });
    return out;
  }
  function joinUrl(base, path) { base = (base || "").trim(); path = (path || "").trim(); if (!base) return path; if (!path) return base; return base.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, ""); }
  function parseHeaders(extra) { const out = {}; if (!extra) return out; try { const o = JSON.parse(extra); if (o && typeof o === "object") Object.assign(out, o); } catch (e) {} return out; }

  async function startAssistant(conv) {
    const apiMessages = buildApiMessages(conv);
    const aiMsg = { role: "assistant", content: "", reasoning: "", ts: Date.now(), streaming: true, model: state.settings.model };
    conv.messages.push(aiMsg);
    const wrapEl = buildMessageEl(aiMsg, conv.messages.length - 1); dlgBody.appendChild(wrapEl); scrollToBottom();

    const s = state.settings;
    const url = joinUrl(s.apiBase, s.chatPath);
    const headers = { "Content-Type": "application/json" };
    if (s.apiKey) headers["Authorization"] = "Bearer " + s.apiKey;
    Object.assign(headers, parseHeaders(s.extraHeaders));
    const body = { model: s.model, messages: apiMessages, stream: true, stream_options: { include_usage: true } };

    let estIn = 0; apiMessages.forEach((m) => { if (typeof m.content === "string") estIn += estTokens(m.content); else if (Array.isArray(m.content)) m.content.forEach((c) => { if (c.type === "text") estIn += estTokens(c.text); }); });
    const lastUser = conv.messages.slice().reverse().find((m) => m.role === "user"); if (lastUser && lastUser.images && lastUser.images.length) estIn += lastUser.images.length * 800;

    const controller = new AbortController();
    currentStream = { aiMsg: aiMsg, wrapEl: wrapEl, abort: controller, serverUsage: 0, estIn: estIn, conv: conv };
    sendBtn.classList.add("stop"); sendBtn.textContent = "\u25a0"; sendBtn.title = t("stop");

    try {
      const res = await fetch(url, { method: "POST", headers: headers, body: JSON.stringify(body), signal: controller.signal });
      if (!res.ok) { let txt = ""; try { txt = await res.text(); } catch (e) {} throw new Error("HTTP " + res.status + " " + (txt || "").slice(0, 500)); }
      const ctype = (res.headers.get("content-type") || "").toLowerCase();
      if (ctype.indexOf("application/json") >= 0 && ctype.indexOf("event-stream") < 0) {
        const data = await res.json();
        if (data.usage) applyUsage(data.usage);
        const ch = data.choices && data.choices[0];
        if (ch) { const mm = ch.message || {}; if (mm.reasoning_content) { aiMsg.reasoning += mm.reasoning_content; paintReasoning(); } if (typeof mm.content === "string") { aiMsg.content += mm.content; paintStreaming(); } }
      } else {
        const reader = res.body.getReader(); const dec = new TextDecoder("utf-8"); let buf = "";
        while (true) {
          const rd = await reader.read(); if (rd.done) break;
          buf += dec.decode(rd.value, { stream: true });
          let idx;
          while ((idx = buf.indexOf("\n")) >= 0) {
            let line = buf.slice(0, idx); buf = buf.slice(idx + 1); line = line.replace(/\r$/, "");
            if (!line || line.charAt(0) === ":") continue;
            if (line.indexOf("data:") === 0) line = line.slice(5).trim();
            if (line === "[DONE]") { buf = ""; break; }
            let json; try { json = JSON.parse(line); } catch (e) { continue; }
            if (json.usage) applyUsage(json.usage);
            const ch = json.choices && json.choices[0]; if (!ch) continue;
            const d = ch.delta || {};
            if (d.reasoning_content) { aiMsg.reasoning += d.reasoning_content; paintReasoning(); }
            if (d.content) { aiMsg.content += d.content; paintStreaming(); }
          }
        }
      }
      finishStream(null);
    } catch (err) {
      if (err && err.name === "AbortError") finishStream(null);
      else finishStream(err || new Error("error"));
    }
  }
  async function send() {
    if (isStreaming()) return;
    if (!isConfigured()) { warnNotConfigured(); return; }
    const text = (msgInput.value || "").trim();
    if (!text && pendingImages.length === 0 && pendingFiles.length === 0) return;
    const conv = ensureConversation();
    const userMsg = { role: "user", content: text, images: pendingImages.slice(), files: pendingFiles.slice(), ts: Date.now() };
    const useSearch = !!(state.ui.webSearch && text);
    if (useSearch) userMsg.searching = true;
    conv.messages.push(userMsg); conv.updatedAt = Date.now();
    msgInput.value = ""; pendingImages = []; pendingFiles = []; renderAttachRow(); autoGrow(); renderMessages(); updateHeader(); save();
    if (useSearch) {
      let results = [];
      try { results = await runWebSearch(text); } catch (e) { results = []; }
      userMsg.searching = false; userMsg.searchResults = results || []; userMsg.searchEnabled = true;
      renderMessages(); save();
      if (!results || !results.length) toast(t("searchingNoResult"));
    }
    await startAssistant(conv);
  }
  async function regenerate(idx) {
    if (isStreaming()) return;
    if (!isConfigured()) { warnNotConfigured(); return; }
    const conv = activeConversation(); if (!conv) return;
    if (!(idx >= 0 && idx < conv.messages.length)) return;
    conv.messages = conv.messages.slice(0, idx);
    conv.updatedAt = Date.now();
    renderMessages(); updateHeader(); save();
    await startAssistant(conv);
  }
  function applyUsage(u) { const total = u.total_tokens || ((u.prompt_tokens || 0) + (u.completion_tokens || 0)); if (total) { state.tokenUsed += total; if (currentStream) currentStream.serverUsage = total; renderTokenBadge(); save(); } }
  function paintStreaming() { const m = currentStream.aiMsg; if (m._bubbleEl) { m._bubbleEl.innerHTML = renderMarkdown(m.content || ""); scrollToBottom(); } }
  function paintReasoning() {
    const m = currentStream.aiMsg; let det = m._reasonEl;
    if (!det) { det = el("details", "reasoning"); det.open = true; const sum = el("summary"); sum.textContent = t("reasoning"); det.appendChild(sum); const rb = el("div", "r-body"); det.appendChild(rb); m._reasonEl = det; m._reasonBodyEl = rb; currentStream.wrapEl.insertBefore(det, currentStream.wrapEl.querySelector(".bubble")); }
    m._reasonBodyEl.textContent = m.reasoning; scrollToBottom();
  }
  function stopStream() { if (currentStream && currentStream.abort) { try { currentStream.abort.abort(); } catch (e) {} } }
  function finishStream(err) {
    if (!currentStream) return; const cs = currentStream; const m = cs.aiMsg; m.streaming = false; currentStream = null;
    if (err) { if (!m.content) { m.error = true; m.content = t("requestError") + ": " + err.message; } else m.content += "\n\n[" + t("requestError") + ": " + err.message + "]"; if (m._bubbleEl) { m._bubbleEl.classList.add("err-bubble"); m._bubbleEl.innerHTML = renderMarkdown(m.content); } }
    else { if (!cs.serverUsage) { const total = (cs.estIn || 0) + estTokens(m.content) + estTokens(m.reasoning); if (total > 0) { state.tokenUsed += total; renderTokenBadge(); } } if (!m.content && !m.reasoning) m.content = "(empty)"; if (m._bubbleEl) m._bubbleEl.innerHTML = renderMarkdown(m.content); }
    sendBtn.classList.remove("stop"); sendBtn.textContent = "➤"; sendBtn.title = t("send");
    cs.conv.updatedAt = Date.now(); renderTokenBadge(); updateHeader(); renderMessages(); save();
  }

  /* ------------------------------------------------------------- 拖动 */
  function makeDraggable(target, opt) {
    opt = opt || {}; const handle = opt.handle || target;
    let sx = 0, sy = 0, ol = 0, ot = 0, dragging = false, moved = false, pid = null;
    function down(e) {
      if (e.button !== 0) return;
      if (opt.ignore && e.target && e.target.closest && e.target.closest(opt.ignore)) return;
      dragging = true; moved = false; const r = target.getBoundingClientRect();
      sx = e.clientX; sy = e.clientY; ol = r.left; ot = r.top; pid = e.pointerId;
      try { handle.setPointerCapture(pid); } catch (err) {} handle.style.cursor = "grabbing"; e.preventDefault();
    }
    function move(e) {
      if (!dragging) return; const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
      const w = target.offsetWidth, h = target.offsetHeight;
      target.style.left = clamp(ol + dx, 6, Math.max(6, window.innerWidth - w - 6)) + "px";
      target.style.top = clamp(ot + dy, 6, Math.max(6, window.innerHeight - h - 6)) + "px";
      target.style.right = "auto"; target.style.bottom = "auto"; if (opt.onMove) opt.onMove();
    }
    function up(e) {
      if (!dragging) return; dragging = false; try { handle.releasePointerCapture(pid); } catch (err) {} handle.style.cursor = "grab";
      const r = target.getBoundingClientRect();
      if (target === fabEl) state.ui.fabPos = { left: r.left, top: r.top }; else if (target === dialogEl) state.ui.dialogPos = { left: r.left, top: r.top };
      save(); if (!moved && typeof opt.onClick === "function") opt.onClick(e);
    }
    handle.addEventListener("pointerdown", down); handle.addEventListener("pointermove", move); handle.addEventListener("pointerup", up);
  }

  /* ------------------------------------------------------------- 绑定 */
  // 悬浮球逻辑
  makeDraggable(fabEl, { onClick: () => expandDialog(true) });
  makeDraggable(dialogEl, { handle: head, ignore: ".icon-btn, .token-badge, .btn, input, textarea, .switch", onMove: relocate });
  menuBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleMenu(); });
  closeBtn.addEventListener("click", () => collapseDialog(true));
  newBtn.addEventListener("click", () => { newConversation(); hideMenu(); renderMessages(); updateHeader(); });
  setBtn.addEventListener("click", () => { openSettings("root"); });
  backBtn.addEventListener("click", () => { if (settingsPage !== "root") openSettings("root"); else hideSettings(); });
  sendBtn.addEventListener("click", () => { if (isStreaming()) stopStream(); else send(); });
  // 发送仅通过发送按钮；Enter 保留为换行
  msgInput.addEventListener("input", () => { autoGrow(); save(); });
  deepBtn.addEventListener("click", () => { state.ui.deepThink = !state.ui.deepThink; deepBtn.setAttribute("aria-pressed", String(state.ui.deepThink)); deepSwitch.setAttribute("aria-checked", String(state.ui.deepThink)); toast(state.ui.deepThink ? t("deepOnMsg") : t("deepOffMsg")); save(); });
  deepSwitch.addEventListener("click", () => { state.ui.deepThink = !state.ui.deepThink; deepSwitch.setAttribute("aria-checked", String(state.ui.deepThink)); deepBtn.setAttribute("aria-pressed", String(state.ui.deepThink)); toast(state.ui.deepThink ? t("deepOnMsg") : t("deepOffMsg")); save(); });
  searchBtn.addEventListener("click", () => { state.ui.webSearch = !state.ui.webSearch; searchBtn.setAttribute("aria-pressed", String(state.ui.webSearch)); renderInputState(); toast(state.ui.webSearch ? t("searchOn") : t("searchOff")); save(); });
  darkBtn.addEventListener("click", (ev) => { ev.stopPropagation(); toggleDark(); });
  discAccept.addEventListener("click", () => acceptDisclaimer());
  discReject.addEventListener("click", () => rejectDisclaimer());
  uploadBtn.addEventListener("click", (ev) => { ev.stopPropagation(); if (uploadMenu.classList.contains("shown")) closeUploadMenu(); else openUploadMenu(); });
  umImage.addEventListener("click", (ev) => { ev.stopPropagation(); closeUploadMenu(); fileInput.click(); });
  umFile.addEventListener("click", (ev) => { ev.stopPropagation(); if (isTextOnlyModel()) { toast(t("textOnlyNoFile")); return; } closeUploadMenu(); docInput.click(); });
  fileInput.addEventListener("change", (e) => { handleImageFiles(e.target.files); fileInput.value = ""; });
  docInput.addEventListener("change", (e) => { handleDocFiles(e.target.files); docInput.value = ""; });
  document.addEventListener("pointerdown", (e) => {
    if (!uploadMenu.classList.contains("shown")) return;
    let path = []; try { path = e.composedPath ? e.composedPath() : [e.target]; } catch (err) {}
    if (path.indexOf(uploadMenu) !== -1 || path.indexOf(uploadBtn) !== -1) return;
    closeUploadMenu();
  }, true);
  dlgBody.addEventListener("click", (e) => {
    const tgt = e.target; const btn = tgt && tgt.closest ? tgt.closest("[data-act]") : null; if (!btn) return;
    const act = btn.getAttribute("data-act");
    if (act === "codecopy") { const block = btn.closest(".code-block"); const codeEl = block ? block.querySelector("pre code") : null; copyText(codeEl ? codeEl.textContent : "", btn, t("copied")); return; }
    const conv = activeConversation(); const idx = Number(btn.getAttribute("data-idx"));
    if (!conv || !Number.isFinite(idx)) return; const msg = conv.messages[idx]; if (!msg) return;
    if (act === "copy") copyText(msg.content || "", btn, t("copied"));
    else if (act === "regen") regenerate(idx);
  });
  document.addEventListener("pointerdown", onDocPointerDown, true);
  const onResize = () => { placeFab(false); if (isDialogOpen()) placeDialog(false); relocate(); };
  window.addEventListener("resize", onResize);

  const mo = new MutationObserver(() => { if (!document.getElementById("ai-floating-chat-host")) { try { document.documentElement.appendChild(host); } catch (e) {} } });
  try { mo.observe(document.documentElement, { childList: true }); } catch (e) {}

  /* ------------------------------------------------------------- 启动 */
  function dialogVisible() {
    try { return dialogEl.classList.contains("shown") || discEl.classList.contains("shown"); } catch (e) { return false; }
  }
  function wantsDialog() {
    if (!state.ui.disclaimerAccepted) { showDisclaimer(); return; }
    expandDialog(true);
  }
  function runtimeListen() {
    try {
      if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.onMessage) return;
      chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        if (!msg || !msg.type) return;
        if (msg.type === "ai-floating-ping") { if (sendResponse) sendResponse({ ok: true }); }
        else if (msg.type === "ai-floating-open-dialog") { wantsDialog(); if (sendResponse) sendResponse({ ok: true, expanded: true }); }
        else if (msg.type === "ai-floating-query-state") { if (sendResponse) sendResponse({ expanded: dialogVisible() }); }
        else if (msg.type === "ai-floating-open-settings") { wantsDialog(); if (sendResponse) sendResponse({ ok: true }); }
      });
    } catch (e) {}
  }
  runtimeListen();
  load();
  applyAppearance(); applyTexts(); placeFab(true); placeDialog(true);
  if (state.ui.expanded && state.ui.disclaimerAccepted) expandDialog(false); else collapseDialog(false);
  renderTokenBadge(); renderMessages(); renderInputState(); updateHeader();
  document.documentElement.appendChild(host);

  function destroy() {
    try { document.removeEventListener("pointerdown", onDocPointerDown, true); } catch (e) {}
    try { window.removeEventListener("resize", onResize); } catch (e) {}
    try { mo.disconnect(); } catch (e) {}
    try { if (host.parentNode) host.parentNode.removeChild(host); } catch (e) {}
    try { delete globalThis[NS]; } catch (e) {}
  }
  globalThis[NS] = { destroy: destroy, state: state, send: send, renderMessages: renderMessages, renderMenu: renderMenu, regenerate: regenerate, openMenu: openMenu, openSettings: openSettings };

  return {
    ok: true,
    summary: "AI floating chat widget injected. Click ball → chat dialog opens directly; hamburger (top-right) holds chat list, deep-think, model picker, settings; model list is user-defined.",
    changed_count: 1,
    data: { mounted: true, material: state.settings.material, language: state.settings.language, configured: isConfigured(), models: state.settings.models, model: state.settings.model, tokenLimit: state.settings.tokenLimit, conversations: state.conversations.length },
    warnings: isConfigured() ? [] : ["API/Key 未配置：可查看对话，但发送被禁用。请到 ☰ → 设置 → 配置大模型 填写。"]
  };
}

  Promise.resolve()
    .then(function () { return run({}); })
    .catch(function (e) { try { console.error('[AI floating chat]', e); } catch (x) {} });
})();
