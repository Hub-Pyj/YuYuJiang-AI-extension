'use strict';
const STORAGE_KEY = 'aiFloatingChatState';

function isConfigured(s) {
  return !!(s && s.apiKey && s.apiKey.trim() && s.model && s.model.trim() && s.apiBase && s.apiBase.trim());
}

const openBtn = document.getElementById('open');
let dialogOpen = false;

function applyOpenBtn() {
  openBtn.disabled = !!dialogOpen;
  openBtn.classList.toggle('disabled', !!dialogOpen);
  openBtn.textContent = dialogOpen ? '对话已打开' : '在页面中打开对话';
}

// 配置状态展示
chrome.storage.local.get(STORAGE_KEY, (res) => {
  const st = res && res[STORAGE_KEY];
  const s = st && st.settings;
  const el = document.getElementById('status');
  if (isConfigured(s)) {
    el.className = 'status ok';
    el.innerHTML = '\u2714 已配置接口<br>模型：' + (s.model || '-') + '<br>接口：' + (s.apiBase || '-');
  } else {
    el.className = 'status bad';
    el.innerHTML = '\u2716 尚未配置接口与 API Key<br>请先完成「配置大模型」后再对话。';
  }
});

// 通过 background 查询当前对话是否已展开（background 会确保脚本已注入）
function queryState() {
  chrome.runtime.sendMessage({ type: 'ai-floating-query-state' }, (resp) => {
    void chrome.runtime.lastError;
    dialogOpen = !!(resp && resp.ok && resp.expanded);
    applyOpenBtn();
  });
}

queryState();

// 点击：经 background 补注入后打开对话（等价于点小悬浮球）
openBtn.addEventListener('click', () => {
  if (dialogOpen) { window.close(); return; }
  openBtn.disabled = true;
  chrome.runtime.sendMessage({ type: 'ai-floating-open-dialog' }, () => {
    void chrome.runtime.lastError;
    window.close();
  });
});
