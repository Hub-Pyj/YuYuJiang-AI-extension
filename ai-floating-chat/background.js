/* =========================================================================
 *  AI 悬浮助手 · background service worker
 *  作用：所有对大模型接口的网络请求都在这里发起。
 *  - 扩展拥有 host_permissions(<all_urls>)，service worker 的 fetch
 *    不受页面 CORS 限制，因此可以自由访问 OpenAI / DeepSeek / 自建接口。
 *  - 通过长连接 Port 把流式内容实时回传给页面里的悬浮窗。
 * ========================================================================= */
'use strict';

function joinUrl(base, path) {
  base = (base || '').trim();
  path = (path || '').trim();
  if (!base) return path;
  if (!path) return base;
  return base.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
}

function parseHeaders(extra) {
  const out = {};
  if (!extra) return out;
  if (typeof extra === 'object') return Object.assign(out, extra);
  try {
    const obj = JSON.parse(extra);
    if (obj && typeof obj === 'object') Object.assign(out, obj);
  } catch (e) { /* ignore bad JSON */ }
  return out;
}

async function handleChat(port, msg) {
  const id = msg.id;
  const p = msg.payload || {};
  const post = (o) => {
    try { port.postMessage(Object.assign({ id: id }, o)); } catch (e) { /* port closed */ }
  };

  const url = joinUrl(p.apiBase, p.chatPath);
  if (!url) { post({ type: 'error', message: 'API URL is empty' }); return; }

  const headers = { 'Content-Type': 'application/json' };
  if (p.apiKey) headers['Authorization'] = 'Bearer ' + p.apiKey;
  Object.assign(headers, parseHeaders(p.extraHeaders));

  const body = {
    model: p.model,
    messages: p.messages,
    stream: true,
    stream_options: { include_usage: true }
  };

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });
  } catch (err) {
    post({ type: 'error', message: 'Request failed: ' + (err && err.message ? err.message : String(err)) });
    return;
  }

  if (!res.ok) {
    let txt = '';
    try { txt = await res.text(); } catch (e) { /* ignore */ }
    post({ type: 'error', message: 'HTTP ' + res.status + ' ' + (txt || '').slice(0, 800) });
    return;
  }

  const ctype = (res.headers.get('content-type') || '').toLowerCase();

  // 非流式回退：某些自建接口直接返回整段 JSON
  if (ctype.indexOf('application/json') >= 0 && ctype.indexOf('event-stream') < 0) {
    let data;
    try { data = await res.json(); } catch (e) {
      post({ type: 'error', message: 'Invalid JSON response' });
      return;
    }
    if (data && data.usage) post({ type: 'usage', usage: data.usage });
    const ch = data && data.choices && data.choices[0];
    if (ch) {
      const m = ch.message || {};
      if (m.reasoning_content) post({ type: 'reasoning', text: m.reasoning_content });
      if (typeof m.content === 'string') post({ type: 'delta', text: m.content });
      else if (Array.isArray(m.content)) {
        m.content.forEach((seg) => { if (seg && seg.text) post({ type: 'delta', text: seg.text }); });
      }
    }
    post({ type: 'done' });
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buf = '';
  let sawDone = false;

  try {
    while (true) {
      const r = await reader.read();
      if (r.done) break;
      buf += decoder.decode(r.value, { stream: true });
      let idx;
      while ((idx = buf.indexOf('\n')) >= 0) {
        let line = buf.slice(0, idx);
        buf = buf.slice(idx + 1);
        line = line.replace(/\r$/, '');
        if (!line) continue;
        if (line.charAt(0) === ':') continue;
        if (line.indexOf('data:') === 0) line = line.slice(5).trim();
        if (line === '[DONE]') { sawDone = true; break; }
        let json;
        try { json = JSON.parse(line); } catch (e) { continue; }
        if (json.usage) post({ type: 'usage', usage: json.usage });
        const choice = json.choices && json.choices[0];
        if (!choice) continue;
        const delta = choice.delta || {};
        if (delta.reasoning_content) post({ type: 'reasoning', text: delta.reasoning_content });
        if (delta.content) post({ type: 'delta', text: delta.content });
      }
      if (sawDone) break;
    }
  } catch (err) {
    post({ type: 'error', message: 'Stream error: ' + (err && err.message ? err.message : String(err)) });
    return;
  }
  post({ type: 'done' });
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'ai-chat') return;
  port.onMessage.addListener((msg) => {
    if (msg && msg.type === 'chat') handleChat(port, msg);
  });
});
