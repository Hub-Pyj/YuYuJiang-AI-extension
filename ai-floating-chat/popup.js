'use strict';
const STORAGE_KEY = 'aiFloatingChatState';

function isConfigured(s) {
  return !!(s && s.apiKey && s.apiKey.trim() && s.model && s.model.trim() && s.apiBase && s.apiBase.trim());
}

chrome.storage.local.get(STORAGE_KEY, (res) => {
  const st = res && res[STORAGE_KEY];
  const s = st && st.settings;
  const el = document.getElementById('status');
  if (isConfigured(s)) {
    el.className = 'status ok';
    el.innerHTML = '✔ 已配置接口<br>模型：' + (s.model || '-') + '<br>接口：' + (s.apiBase || '-');
  } else {
    el.className = 'status bad';
    el.innerHTML = '✖ 尚未配置接口与 API Key<br>请先完成「配置大模型」后再对话。';
  }
});

document.getElementById('open').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    if (!tab || tab.id == null) { window.close(); return; }
    chrome.tabs.sendMessage(tab.id, { type: 'ai-floating-open-settings' }, () => {
      void chrome.runtime.lastError;
      window.close();
    });
  });
});
