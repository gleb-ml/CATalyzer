(function () {
  'use strict';

  // Запускаемся только в верхнем фрейме
  if (window !== window.top) return;

  // Определяем PDF-контекст (Chrome рендерит PDF нативно,
  // в этом случае window.getSelection() не видит выделенный текст)
  const isPDF = document.contentType === 'application/pdf' ||
                /\.pdf(\?.*)?$/i.test(window.location.pathname);

  // ── Конфиг провайдеров (зеркало sidepanel.js, минимум для инлайн-режима) ──
  const PROVIDERS = {
    groq:       { url: 'https://api.groq.com/openai/v1/chat/completions',      model: 'llama-3.3-70b-versatile' },
    openai:     { url: 'https://api.openai.com/v1/chat/completions',           model: 'gpt-4o-mini' },
    openrouter: { url: 'https://openrouter.ai/api/v1/chat/completions',        model: 'meta-llama/llama-3.3-70b-instruct:free' },
    custom:     { url: '', model: '' }
  };

  const LANGUAGE_NAMES = { ru: 'Russian', en: 'English', de: 'German', fr: 'French', es: 'Spanish', zh: 'Chinese', ja: 'Japanese', ar: 'Arabic', pt: 'Portuguese' };

  const SYSTEM_PROMPT =
    'Ты эксперт по объяснению сложных текстов. Твоя задача — сделать текст понятным для умного человека без специальных знаний в этой области.\n' +
    'ПРАВИЛА: Сохраняй все важные факты, цифры и нюансы. Не упрощай смысл, только язык. Не добавляй информацию которой нет в тексте. Не будь снисходительным — читатель умный, просто не знаком с темой.\n' +
    'ФОРМАТ: Будь краток. Начни с сути в 1-2 предложениях, затем при необходимости короткий список ключевых пунктов. Без вступлений вроде «этот текст о…».';

  // ── Стили виджета (живут внутри Shadow DOM, на страницу не влияют) ───────
  const CSS_TEXT = `
    .cz-root {
      all: initial;
      font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    }

    .cz-fab {
      position: fixed;
      z-index: 2147483647;
      display: none;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: #ffffff;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.22), 0 0 0 1px rgba(109,40,217,0.18);
      transition: transform 0.12s ease, box-shadow 0.12s ease;
      box-sizing: border-box;
    }
    .cz-fab:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 14px rgba(0,0,0,0.3), 0 0 0 1px rgba(109,40,217,0.35);
    }
    .cz-fab img { width: 20px; height: 20px; display: block; pointer-events: none; }

    .cz-card {
      position: fixed;
      z-index: 2147483647;
      display: none;
      width: 340px;
      max-width: calc(100vw - 24px);
      max-height: 340px;
      background: #ffffff;
      color: #1a0a3e;
      border: 1px solid #e7e1f7;
      border-radius: 12px;
      box-shadow: 0 10px 34px rgba(45,27,110,0.22), 0 2px 8px rgba(0,0,0,0.12);
      display: none;
      flex-direction: column;
      overflow: hidden;
      box-sizing: border-box;
      animation: cz-pop 0.16s ease;
    }
    @keyframes cz-pop {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .cz-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 8px 10px;
      border-bottom: 1px solid #f1edff;
      flex-shrink: 0;
    }
    .cz-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #6d28d9;
      letter-spacing: -0.2px;
    }
    .cz-title img { width: 16px; height: 16px; display: block; }

    .cz-close {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      background: #f1edff;
      color: #6d28d9;
      border-radius: 50%;
      font: 700 12px/18px system-ui, sans-serif;
      text-align: center;
      cursor: pointer;
      transition: background 0.12s ease;
    }
    .cz-close:hover { background: #e3d9fb; }

    .cz-body {
      padding: 11px 13px;
      font-size: 13px;
      line-height: 1.6;
      color: #1a0a3e;
      overflow-y: auto;
      word-break: break-word;
    }

    .cz-body p  { margin: 0 0 8px 0; }
    .cz-body p:last-child { margin-bottom: 0; }
    .cz-body ul { margin: 0 0 8px 0; padding-left: 18px; }
    .cz-body li { margin-bottom: 4px; }
    .cz-body h3 { font-size: 13px; font-weight: 700; color: #6d28d9; margin: 10px 0 6px; }
    .cz-body h3:first-child { margin-top: 0; }
    .cz-body strong { font-weight: 700; }
    .cz-body em { font-style: italic; }
    .cz-body code {
      font-family: "SF Mono", "Fira Code", monospace;
      font-size: 12px;
      background: #f3eeff;
      padding: 1px 5px;
      border-radius: 4px;
    }
    .cz-hint { color: #7a6e9a; font-size: 12.5px; }
    .cz-err  { color: #ef4444; font-size: 12.5px; }

    .cz-cursor {
      display: inline-block;
      width: 7px;
      height: 13px;
      margin-left: 1px;
      background: #6d28d9;
      vertical-align: text-bottom;
      animation: cz-blink 1s steps(1) infinite;
    }
    @keyframes cz-blink { 50% { opacity: 0; } }

    .cz-body::-webkit-scrollbar { width: 5px; }
    .cz-body::-webkit-scrollbar-thumb { background: #ddd6f3; border-radius: 4px; }
  `;

  // ── Состояние ────────────────────────────────────────────────────────────
  let host = null, shadow = null, root = null;   // Shadow DOM
  let fab = null, card = null, cardBody = null;
  let savedText = '';
  let lastRect = null;
  let currentController = null;                   // AbortController текущего стрима

  // Для PDF: отслеживаем был ли drag мышью (признак выделения)
  let mouseDownX = 0;
  let mouseDownY = 0;
  let mouseDragDist = 0;

  // ── Создание изолированного хоста (Shadow DOM, mode: 'closed') ────────────
  function ensureHost() {
    if (host) return;
    host = document.createElement('div');
    host.id = 'catalyze-shadow-host';
    host.style.cssText = 'all: initial;';

    // closed — наружу ссылку на shadowRoot не отдаём, держим только у себя
    shadow = host.attachShadow({ mode: 'closed' });

    root = document.createElement('div');
    root.className = 'cz-root';

    const style = document.createElement('style');
    style.textContent = CSS_TEXT;

    shadow.append(style, root);
    (document.documentElement || document.body).appendChild(host);
  }

  // ── Плавающая кнопка (FAB) ───────────────────────────────────────────────
  function createFab() {
    fab = document.createElement('div');
    fab.className = 'cz-fab';
    fab.title = 'CATalyze: объяснить';

    const img = document.createElement('img');
    img.src = chrome.runtime.getURL('icons/logo.png');
    img.alt = 'CATalyze';
    fab.appendChild(img);

    fab.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); });
    fab.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const text = savedText;
      hideFab();
      if (text) {
        // Фича 1: открываем инлайн-карточку прямо под выделением
        openCard(text);
      } else if (isPDF) {
        // PDF-режим: текст недоступен — открываем боковую панель (старое поведение)
        chrome.runtime.sendMessage({ type: 'openPanel' });
      }
    });

    root.appendChild(fab);
  }

  function showFab(rect) {
    ensureHost();
    if (!fab) createFab();

    const size = 28;
    const gap = 6;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // У конца выделения, чуть ниже
    let left = rect.right - size;
    let top  = rect.bottom + gap;

    if (left < 8)              left = 8;
    if (left + size > vw - 8)  left = vw - size - 8;
    if (top + size > vh - 8)   top = rect.top - size - gap;
    if (top < 8)               top = 8;

    fab.style.left    = left + 'px';
    fab.style.top     = top + 'px';
    fab.style.display = 'flex';
  }

  function hideFab() {
    if (fab) fab.style.display = 'none';
    mouseDragDist = 0;
  }

  // ── Карточка с объяснением ───────────────────────────────────────────────
  function createCard() {
    card = document.createElement('div');
    card.className = 'cz-card';

    const head = document.createElement('div');
    head.className = 'cz-head';

    const title = document.createElement('div');
    title.className = 'cz-title';
    const logo = document.createElement('img');
    logo.src = chrome.runtime.getURL('icons/logo.png');
    logo.alt = '';
    const titleText = document.createElement('span');
    titleText.textContent = 'CATalyze';
    title.append(logo, titleText);

    // Кнопка-крестик для закрытия карточки
    const close = document.createElement('div');
    close.className = 'cz-close';
    close.textContent = '×';
    close.title = 'Закрыть';
    close.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); });
    close.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      hideCard();
    });

    head.append(title, close);

    cardBody = document.createElement('div');
    cardBody.className = 'cz-body';

    card.append(head, cardBody);

    // Внутри карточки гасим всплытие, чтобы клики/выделение не трогали страницу
    card.addEventListener('mousedown', e => e.stopPropagation());

    root.appendChild(card);
  }

  function positionCard() {
    const margin = 12;
    const gap = 6;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const cw = Math.min(340, vw - 24);
    card.style.width = cw + 'px';

    let left = lastRect ? lastRect.left : margin;
    if (left + cw > vw - margin) left = vw - cw - margin;
    if (left < margin)           left = margin;

    let top = lastRect ? (lastRect.bottom + gap) : margin;
    const ch = card.offsetHeight || 120;
    // Если снизу не помещается — показываем над выделением
    if (top + ch > vh - margin && lastRect) {
      const above = lastRect.top - ch - gap;
      if (above >= margin) top = above;
      else top = Math.max(margin, vh - ch - margin);
    }

    card.style.left = left + 'px';
    card.style.top  = top + 'px';
  }

  function openCard(text) {
    ensureHost();
    if (!card) createCard();

    cardBody.innerHTML = '<span class="cz-hint">…</span>';
    card.style.display = 'flex';
    positionCard();

    streamExplain(text);
  }

  function hideCard() {
    if (currentController) { currentController.abort(); currentController = null; }
    if (card) card.style.display = 'none';
  }

  // ── Мини-парсер Markdown через Regex (с экранированием от XSS) ────────────
  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function inlineMd(s) {
    return escapeHtml(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_]+)__/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  }

  function miniMarkdown(md) {
    const lines = md.split('\n');
    let html = '';
    let inList = false;
    const closeList = () => { if (inList) { html += '</ul>'; inList = false; } };

    for (const raw of lines) {
      const line = raw.replace(/\s+$/, '');
      let m;

      if (/^\s*$/.test(line)) { closeList(); continue; }

      if ((m = line.match(/^\s*#{1,6}\s+(.*)$/))) {
        closeList();
        html += '<h3>' + inlineMd(m[1]) + '</h3>';
      } else if ((m = line.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)$/))) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += '<li>' + inlineMd(m[1]) + '</li>';
      } else {
        closeList();
        html += '<p>' + inlineMd(line) + '</p>';
      }
    }
    closeList();
    return html;
  }

  // ── Стриминг ответа ИИ через ReadableStream (SSE) ────────────────────────
  function streamExplain(text) {
    if (currentController) currentController.abort();
    currentController = new AbortController();
    const signal = currentController.signal;

    // Ключ читаем строго перед запросом, нигде не кэшируем
    chrome.storage.local.get(['apiKey', 'provider', 'customUrl', 'language', 'savedModel'], async (data) => {
      if (!data.apiKey) {
        cardBody.innerHTML = '<span class="cz-hint">⚙️ Сначала добавьте API-ключ в боковой панели.</span>';
        return;
      }

      const provider = data.provider || 'groq';
      const endpoint = provider === 'custom' ? (data.customUrl || '') : PROVIDERS[provider].url;
      const model    = data.savedModel || (PROVIDERS[provider] && PROVIDERS[provider].model) || '';
      const language = data.language;

      if (!endpoint) {
        cardBody.innerHTML = '<span class="cz-err">❌ Не задан URL провайдера.</span>';
        return;
      }

      const langRule = (!language || language === 'auto')
        ? 'Отвечай на том же языке что и исходный текст.'
        : `You MUST respond in ${LANGUAGE_NAMES[language]}, regardless of the source text language. This is mandatory.`;

      cardBody.innerHTML = '<span class="cz-cursor"></span>';
      let full = '';

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.apiKey}`
          },
          body: JSON.stringify({
            model,
            stream: true,
            messages: [
              { role: 'system', content: `${langRule}\n\n${SYSTEM_PROMPT}` },
              { role: 'user',   content: `${text}\n\n${langRule}` }
            ]
          }),
          signal
        });

        if (!response.ok) {
          cardBody.innerHTML = '<span class="cz-err">' + (
            response.status === 401 ? '❌ Неверный API-ключ' :
            response.status === 429 ? '❌ Превышен лимит запросов' :
            '❌ Ошибка: ' + response.status
          ) + '</span>';
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n');
          buffer = parts.pop();   // последняя (возможно неполная) строка остаётся в буфере

          for (const part of parts) {
            const lineStr = part.trim();
            if (!lineStr.startsWith('data:')) continue;
            const payload = lineStr.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;

            try {
              const json = JSON.parse(payload);
              const delta = json.choices && json.choices[0] && json.choices[0].delta
                ? (json.choices[0].delta.content || '') : '';
              if (delta) {
                full += delta;
                cardBody.innerHTML = miniMarkdown(full) + '<span class="cz-cursor"></span>';
                cardBody.scrollTop = cardBody.scrollHeight;
              }
            } catch (_) { /* неполный JSON — ждём следующий чанк */ }
          }
        }

        // Финал: убираем мигающий курсор
        cardBody.innerHTML = full ? miniMarkdown(full)
                                  : '<span class="cz-hint">Пустой ответ.</span>';
        cardBody.scrollTop = cardBody.scrollHeight;
      } catch (e) {
        if (e.name === 'AbortError') return;   // карточку закрыли — это не ошибка
        cardBody.innerHTML = '<span class="cz-err">❌ Нет соединения с сервером</span>';
      }
    });
  }

  // ── Определяем, относится ли событие к нашему виджету ─────────────────────
  // В closed Shadow DOM события извне ретаргетятся на host, поэтому сравнения
  // e.target === host достаточно, чтобы отличить «клик внутри виджета».
  function isOwnEvent(e) {
    return host && e.target === host;
  }

  // ── Слушатели выделения текста ───────────────────────────────────────────
  document.addEventListener('mousedown', e => {
    if (isOwnEvent(e)) return;
    mouseDownX    = e.clientX;
    mouseDownY    = e.clientY;
    mouseDragDist = 0;
  }, { passive: true });

  document.addEventListener('mouseup', e => {
    if (isOwnEvent(e)) return;

    const dx = e.clientX - mouseDownX;
    const dy = e.clientY - mouseDownY;
    mouseDragDist = Math.sqrt(dx * dx + dy * dy);

    // Небольшая задержка — ждём завершения выделения (важно для стабильности)
    setTimeout(() => {
      const sel  = window.getSelection();
      const text = sel ? sel.toString().trim() : '';

      if (text.length > 2 && sel.rangeCount > 0) {
        // Координаты выделения через Range.getBoundingClientRect()
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        savedText = text;
        lastRect  = rect;
        showFab(rect);
      } else if (isPDF && mouseDragDist > 25) {
        // PDF: getSelection() не работает — кнопка без текста, fallback на панель
        savedText = '';
        lastRect  = { left: e.clientX, right: e.clientX + 28, top: e.clientY, bottom: e.clientY, width: 0, height: 0 };
        showFab(lastRect);
      } else {
        hideFab();
      }
    }, 30);
  }, { passive: true });

  // Клик вне виджета — прячем кнопку и закрываем карточку
  document.addEventListener('mousedown', e => {
    if (isOwnEvent(e)) return;
    hideFab();
    hideCard();
  });

  // Прокрутка страницы — прячем кнопку (координаты выделения устаревают)
  document.addEventListener('scroll', () => {
    hideFab();
  }, { passive: true });

  // Escape — закрываем всё
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { hideFab(); hideCard(); }
  });

})();
