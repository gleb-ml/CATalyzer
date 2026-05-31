// Сообщаем background о закрытии панели (в т.ч. крестиком)
const _lifecyclePort = chrome.runtime.connect({ name: 'sidepanel' });
chrome.windows.getCurrent((win) => {
  if (win) _lifecyclePort.postMessage({ type: 'init', windowId: win.id });
});

const LANGUAGE_NAMES = { ru: 'Russian', en: 'English', de: 'German', fr: 'French', es: 'Spanish', zh: 'Chinese', ja: 'Japanese', ar: 'Arabic', pt: 'Portuguese' };

const UI_STRINGS = {
  en: {
    title: 'CATalyze',
    hint: 'Select text on any page and choose ✨ Explain with AI',
    settings: 'Settings',
    saveBtn: 'Save API Key',
    languageLabel: 'Response language',
    uiLanguageLabel: 'Interface language',
    providerLabel: 'Provider',
    apiKeyPlaceholder: 'Paste your API key',
    customUrlPlaceholder: 'https://...',
    loading: '⏳ Analyzing...',
    noKey: '⚙️ Enter your API key first',
    saved: '✅ Saved',
    errNoKey: 'Please enter an API key',
    errNoUrl: 'Please enter a URL',
    err401: '❌ Invalid API key',
    err429: '❌ Rate limit exceeded',
    errNet: '❌ No server connection',
    errCode: '❌ Error: ',
    copy: '📋 Copy',
    copied: '✅ Copied',
    modelLabel: 'Model',
    tagline: 'CATalyze any text into plain language',
    pastePlaceholder: 'Paste or type text here...',
    analyzeBtn: 'Analyze',
    historyTitle: 'Recent',
    historyEmpty: 'No history yet',
    ytBtn: '▶ Summarize video',
    ytNoCaptions: 'No captions available for this video',
    ytError: 'Could not extract transcript. Try reloading the page.',
    ytNoData: 'Could not read video data. Try reloading the page.'
  },
  ru: {
    title: 'CATalyze',
    hint: 'Выделите текст на любой странице и выберите ✨ Объяснить через AI',
    settings: 'Настройки',
    saveBtn: 'Сохранить ключ',
    languageLabel: 'Язык ответа',
    uiLanguageLabel: 'Язык интерфейса',
    providerLabel: 'Провайдер',
    apiKeyPlaceholder: 'Вставьте API-ключ',
    customUrlPlaceholder: 'https://...',
    loading: '⏳ Анализирую текст...',
    noKey: '⚙️ Сначала введите API-ключ',
    saved: '✅ Сохранено',
    errNoKey: 'Введите API-ключ',
    errNoUrl: 'Введите URL',
    err401: '❌ Неверный API-ключ',
    err429: '❌ Превышен лимит запросов',
    errNet: '❌ Нет соединения с сервером',
    errCode: '❌ Ошибка: ',
    copy: '📋 Скопировать',
    copied: '✅ Скопировано',
    modelLabel: 'Модель',
    tagline: 'Превращает сложный текст в понятный',
    pastePlaceholder: 'Вставьте или введите текст...',
    analyzeBtn: 'Анализировать',
    historyTitle: 'История',
    historyEmpty: 'История пуста',
    ytBtn: '▶ Конспект видео',
    ytNoCaptions: 'У этого видео нет субтитров',
    ytError: 'Не удалось извлечь субтитры. Попробуйте перезагрузить страницу.',
    ytNoData: 'Не удалось прочитать данные видео. Попробуйте перезагрузить страницу.'
  },
  de: {
    title: 'CATalyze',
    hint: 'Text markieren und ✨ Mit AI erklären wählen',
    settings: 'Einstellungen',
    saveBtn: 'Schlüssel speichern',
    languageLabel: 'Antwortsprache',
    uiLanguageLabel: 'Oberflächensprache',
    providerLabel: 'Anbieter',
    apiKeyPlaceholder: 'API-Schlüssel einfügen',
    customUrlPlaceholder: 'https://...',
    loading: '⏳ Analysiere...',
    noKey: '⚙️ Bitte zuerst API-Schlüssel eingeben',
    saved: '✅ Gespeichert',
    errNoKey: 'API-Schlüssel eingeben',
    errNoUrl: 'URL eingeben',
    err401: '❌ Ungültiger API-Schlüssel',
    err429: '❌ Anfragelimit überschritten',
    errNet: '❌ Keine Serververbindung',
    errCode: '❌ Fehler: ',
    copy: '📋 Kopieren',
    copied: '✅ Kopiert',
    modelLabel: 'Modell',
    tagline: 'Verwandelt komplexe Texte in verständliche',
    pastePlaceholder: 'Text hier einfügen oder tippen...',
    analyzeBtn: 'Analysieren',
    historyTitle: 'Verlauf',
    historyEmpty: 'Keine Einträge',
    ytBtn: '▶ Video zusammenfassen',
    ytNoCaptions: 'Keine Untertitel für dieses Video verfügbar',
    ytError: 'Transkript konnte nicht extrahiert werden. Seite neu laden.',
    ytNoData: 'Videodaten konnten nicht gelesen werden. Seite neu laden.'
  },
  es: {
    title: 'CATalyze',
    hint: 'Selecciona texto y elige ✨ Explicar con AI',
    settings: 'Configuración',
    saveBtn: 'Guardar clave',
    languageLabel: 'Idioma de respuesta',
    uiLanguageLabel: 'Idioma de interfaz',
    providerLabel: 'Proveedor',
    apiKeyPlaceholder: 'Pega tu clave API',
    customUrlPlaceholder: 'https://...',
    loading: '⏳ Analizando...',
    noKey: '⚙️ Primero introduce la clave API',
    saved: '✅ Guardado',
    errNoKey: 'Introduce la clave API',
    errNoUrl: 'Introduce la URL',
    err401: '❌ Clave API incorrecta',
    err429: '❌ Límite de solicitudes superado',
    errNet: '❌ Sin conexión al servidor',
    errCode: '❌ Error: ',
    copy: '📋 Copiar',
    copied: '✅ Copiado',
    modelLabel: 'Modelo',
    tagline: 'Convierte texto complejo en lenguaje claro',
    pastePlaceholder: 'Pega o escribe texto aquí...',
    analyzeBtn: 'Analizar',
    historyTitle: 'Historial',
    historyEmpty: 'Sin historial',
    ytBtn: '▶ Resumir video',
    ytNoCaptions: 'No hay subtítulos disponibles para este video',
    ytError: 'No se pudo extraer la transcripción. Recarga la página.',
    ytNoData: 'No se pudieron leer los datos del video. Recarga la página.'
  },
  fr: {
    title: 'CATalyze',
    hint: 'Sélectionnez du texte et choisissez ✨ Expliquer avec AI',
    settings: 'Paramètres',
    saveBtn: 'Enregistrer la clé',
    languageLabel: 'Langue de réponse',
    uiLanguageLabel: "Langue de l'interface",
    providerLabel: 'Fournisseur',
    apiKeyPlaceholder: 'Collez votre clé API',
    customUrlPlaceholder: 'https://...',
    loading: '⏳ Analyse en cours...',
    noKey: "⚙️ Entrez d'abord la clé API",
    saved: '✅ Enregistré',
    errNoKey: 'Entrez la clé API',
    errNoUrl: "Entrez l'URL",
    err401: '❌ Clé API invalide',
    err429: '❌ Limite de requêtes dépassée',
    errNet: '❌ Pas de connexion au serveur',
    errCode: '❌ Erreur : ',
    copy: '📋 Copier',
    copied: '✅ Copié',
    modelLabel: 'Modèle',
    tagline: 'Transforme les textes complexes en langage clair',
    pastePlaceholder: 'Collez ou tapez du texte ici...',
    analyzeBtn: 'Analyser',
    historyTitle: 'Historique',
    historyEmpty: 'Aucun historique',
    ytBtn: '▶ Résumer la vidéo',
    ytNoCaptions: 'Aucun sous-titre disponible pour cette vidéo',
    ytError: "Impossible d'extraire la transcription. Rechargez la page.",
    ytNoData: 'Impossible de lire les données vidéo. Rechargez la page.'
  }
};

const PROVIDERS = {
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    modelsUrl: 'https://api.groq.com/openai/v1/models',
    model: 'llama-3.3-70b-versatile',
    filterModels: (models) => models.filter(m => !m.id.includes('whisper'))
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    modelsUrl: 'https://api.openai.com/v1/models',
    model: 'gpt-4o-mini',
    filterModels: (models) => models.filter(m => m.id.startsWith('gpt-'))
  },
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    modelsUrl: 'https://openrouter.ai/api/v1/models',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    filterModels: (models) => models.filter(m => m.id.endsWith(':free'))
  },
  custom: { url: '', model: '' }
};

let currentUiLang = 'en';

// QW6: глобальный флаг — идёт ли сейчас запрос к LLM (защита от двойного анализа)
let isAnalyzing = false;

function showEmptyState() {
  document.getElementById('empty-state').style.display = 'flex';
  document.getElementById('result-container').style.display = 'none';
  document.getElementById('copy-btn').style.display = 'none';
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = '☀';
  } else {
    document.documentElement.removeAttribute('data-theme');
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = '☽';
  }
}

function applyUI(lang) {
  currentUiLang = lang;
  const s = UI_STRINGS[lang] || UI_STRINGS['en'];
  const el = (id) => document.getElementById(id);

  if (el('title'))            el('title').textContent = s.title;
  if (el('hint'))             el('hint').textContent = s.hint;
  if (el('settings-heading')) el('settings-heading').textContent = s.settings;
  if (el('save-key-btn'))     el('save-key-btn').textContent = s.saveBtn;
  if (el('api-key-input'))    el('api-key-input').placeholder = s.apiKeyPlaceholder;
  if (el('custom-url-input')) el('custom-url-input').placeholder = s.customUrlPlaceholder;
  if (el('label-language'))   el('label-language').textContent = s.languageLabel;
  if (el('label-ui-language')) el('label-ui-language').textContent = s.uiLanguageLabel;
  if (el('label-provider'))   el('label-provider').textContent = s.providerLabel;
  if (el('label-model'))      el('label-model').textContent = s.modelLabel;
  if (el('tagline'))          el('tagline').textContent = s.tagline;
  if (el('paste-input'))      el('paste-input').placeholder = s.pastePlaceholder;
  if (el('paste-btn'))        el('paste-btn').textContent = s.analyzeBtn;
  if (el('yt-summarize-btn')) el('yt-summarize-btn').textContent = s.ytBtn;

  const copyBtn = el('copy-btn');
  if (copyBtn && !copyBtn.classList.contains('copied')) copyBtn.textContent = s.copy;
}

async function fetchModels(provider, apiKey) {
  try {
    const response = await fetch(PROVIDERS[provider].modelsUrl, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!response.ok) return null;
    const data = await response.json();
    let models = data.data || [];
    models = PROVIDERS[provider].filterModels(models);
    if (!models.length) return null;
    return models.map(m => m.id).sort();
  } catch (e) {
    return null;
  }
}

function updateProviderUI(provider) {
  const modelSelect      = document.getElementById("model-select");
  const modelCustomInput = document.getElementById("model-custom-input");
  const customUrlInput   = document.getElementById("custom-url-input");

  const modelLabel = document.getElementById("label-model");
  if (provider === "custom") {
    customUrlInput.style.display = "block";
    modelSelect.style.display = "none";
    modelCustomInput.style.display = "block";
    if (modelLabel) modelLabel.style.display = "none";
  } else {
    customUrlInput.style.display = "none";
    modelCustomInput.style.display = "none";
    modelSelect.style.display = "block";
    if (modelLabel) modelLabel.style.display = "block";
  }
}

async function loadModelsIntoSelect(provider, apiKey, savedModel) {
  const modelSelect = document.getElementById("model-select");

  modelSelect.innerHTML = '<option disabled>Loading models...</option>';
  modelSelect.style.display = "block";

  const models = await fetchModels(provider, apiKey);
  if (!models) {
    modelSelect.innerHTML = '<option disabled>Failed to load models</option>';
    return;
  }

  modelSelect.innerHTML = '';
  models.forEach(id => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = id;
    modelSelect.appendChild(opt);
  });

  const preferred = (savedModel && models.includes(savedModel))
    ? savedModel
    : PROVIDERS[provider].model;

  modelSelect.value = models.includes(preferred) ? preferred : models[0];
}

document.addEventListener("DOMContentLoaded", () => {
  const settingsBlock     = document.getElementById("settings-block");
  const providerSelect    = document.getElementById("provider-select");
  const customUrlInput    = document.getElementById("custom-url-input");
  const modelSelect       = document.getElementById("model-select");
  const languageSelect    = document.getElementById("language-select");
  const uiLanguageSelect  = document.getElementById("ui-language-select");
  const apiKeyInput       = document.getElementById("api-key-input");
  const saveKeyBtn        = document.getElementById("save-key-btn");
  const toggleSettings    = document.getElementById("toggle-settings");
  const resultContainer   = document.getElementById("result-container");
  const copyBtn           = document.getElementById("copy-btn");

  // Инициализация
  chrome.storage.local.get(["apiKey", "selectedText", "provider", "customUrl", "language", "settingsOpen", "savedModel", "uiLanguage", "theme", "openedVia", "openedViaTime"], (data) => {
    // Theme
    const theme = data.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(theme);

    // UI language
    let uiLang = data.uiLanguage;
    if (!uiLang) {
      const browserLang = navigator.language.slice(0, 2);
      uiLang = UI_STRINGS[browserLang] ? browserLang : 'en';
    }
    uiLanguageSelect.value = uiLang;
    applyUI(uiLang);

    // Settings visibility
    if (typeof data.settingsOpen === "undefined") {
      settingsBlock.style.display = "block";
      chrome.storage.local.set({ settingsOpen: true });
    } else {
      settingsBlock.style.display = data.settingsOpen ? "block" : "none";
    }

    const provider = data.provider || "groq";
    providerSelect.value = provider;
    updateProviderUI(provider);

    if (data.customUrl) customUrlInput.value = data.customUrl;
    if (data.language)  languageSelect.value = data.language;

    if (data.apiKey && provider !== "custom") {
      loadModelsIntoSelect(provider, data.apiKey, data.savedModel);
    }

    // QW7: если ключа нет — раскрываем настройки и ставим фокус на поле ключа
    if (!data.apiKey) {
      settingsBlock.style.display = "block";
      apiKeyInput.focus();
    }

    // Проверяем свежесть флага openedVia (не старше 8 секунд)
    // Устаревший флаг из предыдущих сессий игнорируем
    const flagAge = Date.now() - (data.openedViaTime || 0);
    const freshFlag = data.openedVia && flagAge < 8000;

    if (freshFlag && data.openedVia === 'icon') {
      // Открыто кликом по иконке — всегда главный экран
      showEmptyState();
    } else if (data.selectedText) {
      // Есть текст (из контекстного меню или плавающей кнопки) — анализируем
      processText(data.selectedText);
    } else {
      showEmptyState();
    }

    // Очищаем флаги после использования
    chrome.storage.local.remove(['openedVia', 'openedViaTime']);
  });

  // Смена модели
  modelSelect.addEventListener("change", () => {
    chrome.storage.local.set({ savedModel: modelSelect.value });
  });

  // Смена провайдера
  providerSelect.addEventListener("change", () => {
    const provider = providerSelect.value;
    updateProviderUI(provider);
    if (provider !== "custom") {
      // QW4: чистим кастомные поля URL и модели, чтобы не тащить мусор от Custom
      customUrlInput.value = "";
      document.getElementById("model-custom-input").value = "";
      chrome.storage.local.set({ provider, savedModel: null, customUrl: "" });
      chrome.storage.local.get(["apiKey"], (data) => {
        if (data.apiKey) loadModelsIntoSelect(provider, data.apiKey, null);
      });
    } else {
      chrome.storage.local.set({ provider, savedModel: null });
    }
  });

  // Смена языка ответа
  languageSelect.addEventListener("change", () => {
    chrome.storage.local.set({ language: languageSelect.value }, () => {
      const hint = document.getElementById("language-saved-hint");
      if (hint) {
        hint.style.opacity = "1";
        clearTimeout(hint._timer);
        hint._timer = setTimeout(() => { hint.style.opacity = "0"; }, 1000);
      }
    });
  });

  // Смена языка интерфейса
  uiLanguageSelect.addEventListener("change", () => {
    const lang = uiLanguageSelect.value;
    chrome.storage.local.set({ uiLanguage: lang });
    applyUI(lang);
  });

  // Save — только API-ключ
  saveKeyBtn.addEventListener("click", () => {
    const s             = UI_STRINGS[currentUiLang] || UI_STRINGS['en'];
    const apiKeyFromField = apiKeyInput.value.trim();
    const provider        = providerSelect.value;
    const customUrl       = customUrlInput.value.trim();

    if (provider === "custom" && !customUrl) {
      resultContainer.className = "error-text";
      resultContainer.textContent = s.errNoUrl;
      return;
    }

    const showSaved = () => {
      const indicator = document.getElementById("save-indicator");
      if (indicator) {
        indicator.style.display = "inline";
        setTimeout(() => { indicator.style.display = "none"; }, 2000);
      }
    };

    const doSave = (apiKey) => {
      chrome.storage.local.set({ apiKey, customUrl, savedModel: null }, () => {
        if (provider !== "custom") loadModelsIntoSelect(provider, apiKey, null);
        showSaved();
        apiKeyInput.value = "";   // QW7: не держим введённый ключ в видимом поле
      });
    };

    if (apiKeyFromField) {
      doSave(apiKeyFromField);
    } else {
      chrome.storage.local.get(["apiKey"], (data) => {
        if (!data.apiKey) {
          resultContainer.className = "error-text";
          resultContainer.textContent = s.errNoKey;
          return;
        }
        chrome.storage.local.set({ customUrl }, () => {
          showSaved();
        });
      });
    }
  });

  // Кнопка копирования
  copyBtn.addEventListener("click", () => {
    const s = UI_STRINGS[currentUiLang] || UI_STRINGS['en'];
    navigator.clipboard.writeText(document.getElementById("result-container").innerText).then(() => {
      copyBtn.classList.add("copied");
      copyBtn.textContent = s.copied;
      setTimeout(() => {
        copyBtn.classList.remove("copied");
        copyBtn.textContent = s.copy;
      }, 2000);
    });
  });

  // Переключение темы
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
    chrome.storage.local.set({ theme: newTheme });
  });

  // Переключение настроек
  toggleSettings.addEventListener("click", () => {
    const visible = settingsBlock.style.display === "block";
    settingsBlock.style.display = visible ? "none" : "block";
    chrome.storage.local.set({ settingsOpen: !visible });
  });

  // Новый текст от background.js
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.selectedText) processText(changes.selectedText.newValue);
  });

  // ── Вставка текста вручную ───────────────────────────────────────────────
  const pasteInput = document.getElementById('paste-input');
  const pasteBtn   = document.getElementById('paste-btn');

  pasteBtn.addEventListener('click', () => {
    const text = pasteInput.value.trim();
    if (text) { processText(text); pasteInput.blur(); }
  });

  pasteInput.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const text = pasteInput.value.trim();
      if (text) { processText(text); pasteInput.blur(); }
    }
  });

  // QW5: Enter в поле ключа = клик по кнопке «Сохранить»
  apiKeyInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); saveKeyBtn.click(); }
  });

  // ── Автоопределение провайдера по API-ключу ──────────────────────────────
  apiKeyInput.addEventListener('input', () => {
    const key = apiKeyInput.value.trim();
    const detected = detectProviderFromKey(key);
    const badge = document.getElementById('key-detect-badge');

    if (detected && key.length > 15) {
      if (providerSelect.value !== detected) {
        providerSelect.value = detected;
        providerSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const names = { groq: 'Groq', openai: 'OpenAI', openrouter: 'OpenRouter' };
      if (badge) { badge.textContent = `✓ ${names[detected]} detected`; badge.className = 'visible'; }
      if (key.length > 20) loadModelsIntoSelect(detected, key, null);
    } else {
      if (badge) badge.className = '';
    }
  });

  // ── История ─────────────────────────────────────────────────────────────
  const historyBtn   = document.getElementById('history-btn');
  const historyBlock = document.getElementById('history-block');

  historyBtn.addEventListener('click', () => {
    const isOpen = historyBlock.style.display === 'block';
    if (isOpen) {
      historyBlock.style.display = 'none';
      historyBtn.classList.remove('active');
    } else {
      // Закрываем настройки если открыты
      settingsBlock.style.display = 'none';
      historyBlock.style.display = 'block';
      historyBtn.classList.add('active');
      renderHistoryList();
    }
  });

  // ── YouTube: определение страницы и кнопка конспекта ─────────────────────
  function checkYouTube() {
    const section = document.getElementById('yt-section');
    if (!section) return;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const isYt = tabs[0] && /^https?:\/\/(www\.)?youtube\.com\/watch/.test(tabs[0].url);
      section.style.display = isYt ? '' : 'none';
    });
  }

  checkYouTube();
  chrome.tabs.onActivated.addListener(() => checkYouTube());
  chrome.tabs.onUpdated.addListener((_tabId, info) => {
    if (info.url || info.status === 'complete') checkYouTube();
  });

  document.getElementById('yt-summarize-btn').addEventListener('click', () => {
    if (isAnalyzing) return;

    const resultContainer = document.getElementById('result-container');
    const s = UI_STRINGS[currentUiLang] || UI_STRINGS['en'];

    // Подготовка UI: скелетон-загрузка, сброс состояния
    document.getElementById('empty-state').style.display = 'none';
    resultContainer.style.display = 'block';
    resultContainer.className = '';
    resultContainer.innerHTML =
      '<div class="skeleton-line" style="width:92%"></div>' +
      '<div class="skeleton-line" style="width:100%"></div>' +
      '<div class="skeleton-line" style="width:78%"></div>';
    document.getElementById('copy-btn').style.display = 'none';
    document.getElementById('settings-block').style.display = 'none';
    const hb = document.getElementById('history-block');
    const hBtn = document.getElementById('history-btn');
    if (hb)   hb.style.display = 'none';
    if (hBtn) hBtn.classList.remove('active');
    window.scrollTo({ top: 0 });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        resultContainer.className = 'error-text';
        resultContainer.textContent = s.ytError;
        return;
      }

      chrome.storage.local.get(['apiKey', 'provider', 'customUrl', 'language', 'savedModel'], (data) => {
        if (!data.apiKey) {
          resultContainer.className = '';
          resultContainer.textContent = s.noKey;
          document.getElementById('settings-block').style.display = 'block';
          return;
        }

        // Отправляем запрос на парсинг субтитров в content.js
        chrome.tabs.sendMessage(tabs[0].id, { type: 'yt_parse_request', lang: data.language }, (response) => {
          if (chrome.runtime.lastError || !response) {
            resultContainer.className = 'error-text';
            resultContainer.textContent = s.ytError;
            return;
          }
          if (!response.ok) {
            resultContainer.className = 'error-text';
            resultContainer.textContent =
              response.error === 'no_captions'    ? s.ytNoCaptions :
              response.error === 'no_player_data' ? s.ytNoData     :
                                                    s.ytError;
            return;
          }

          // Формируем запрос к LLM с контекстом видео
          const userContent = response.title
            ? 'Видео: "' + response.title + '"\n\nТранскрипт:\n' + response.text
            : response.text;

          const ytPrompt =
            'Ты эксперт-аналитик. Составь подробный, структурированный конспект следующего видео. ' +
            'Выдели главные мысли, ключевые аргументы и инсайты. Используй форматирование Markdown.';

          fetchFromAI(
            userContent,
            data.apiKey,
            data.provider || 'groq',
            data.customUrl,
            data.language,
            data.savedModel,
            ytPrompt
          );
        });
      });
    });
  });

  initCustomSelects();
});

// ── Custom animated dropdowns ─────────────────────────────────────────────

function initCustomSelects() {
  ['provider-select', 'model-select', 'language-select', 'ui-language-select']
    .forEach(id => {
      const sel = document.getElementById(id);
      if (sel) buildCustomSelect(sel);
    });
}

function buildCustomSelect(sel) {
  // Wrap
  const wrap = document.createElement('div');
  wrap.className = 'cs-wrap';
  if (sel.style.display === 'none') wrap.style.display = 'none';

  // Trigger button
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'cs-trigger';

  const valSpan = document.createElement('span');
  valSpan.className = 'cs-value';

  const arrow = document.createElement('span');
  arrow.className = 'cs-arrow';
  arrow.innerHTML = '<svg width="11" height="7" viewBox="0 0 12 8" fill="none"><path d="M1 1l5 5 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  btn.append(valSpan, arrow);

  // Dropdown list
  const list = document.createElement('div');
  list.className = 'cs-list';

  wrap.append(btn, list);
  sel.insertAdjacentElement('afterend', wrap);
  sel.classList.add('cs-native-hidden');

  function renderList() {
    list.innerHTML = '';
    Array.from(sel.options).forEach(opt => {
      const item = document.createElement('div');
      item.className = 'cs-item'
        + (opt.disabled            ? ' cs-item-disabled'  : '')
        + (opt.value === sel.value ? ' cs-item-active'    : '');
      item.textContent = opt.text;
      item.dataset.value = opt.value;
      if (!opt.disabled) {
        item.addEventListener('click', e => {
          e.stopPropagation();
          sel.value = opt.value;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          syncVal();
          close();
        });
      }
      list.appendChild(item);
    });
  }

  function syncVal() {
    const cur = sel.options[sel.selectedIndex];
    valSpan.textContent = cur ? cur.text : '';
    list.querySelectorAll('.cs-item').forEach(item =>
      item.classList.toggle('cs-item-active', item.dataset.value === sel.value)
    );
  }

  function open() {
    document.querySelectorAll('.cs-wrap.cs-open').forEach(w => {
      if (w !== wrap) w.classList.remove('cs-open');
    });
    renderList();
    syncVal();
    wrap.classList.add('cs-open');
  }

  function close() { wrap.classList.remove('cs-open'); }

  btn.addEventListener('click', e => {
    e.stopPropagation();
    wrap.classList.contains('cs-open') ? close() : open();
  });
  document.addEventListener('click', close);

  // Watch option changes (model list loads dynamically)
  new MutationObserver(() => {
    if (wrap.classList.contains('cs-open')) renderList();
    syncVal();
  }).observe(sel, { childList: true });

  // Mirror display:none/block from native → custom wrap
  new MutationObserver(() => {
    wrap.style.display = sel.style.display === 'none' ? 'none' : '';
    if (sel.style.display !== 'none') syncVal();
  }).observe(sel, { attributes: true, attributeFilter: ['style'] });

  // Poll for value changes set programmatically (sel.value = x without change event)
  let prev = sel.value;
  setInterval(() => {
    if (sel.value !== prev) { prev = sel.value; syncVal(); }
  }, 150);

  syncVal();
}

// ── Определение провайдера по ключу ──────────────────────────────────────

function detectProviderFromKey(key) {
  if (!key) return null;
  if (key.startsWith('sk-or-')) return 'openrouter';
  if (key.startsWith('gsk_'))   return 'groq';
  if (key.startsWith('sk-'))    return 'openai';
  return null;
}

// ── История ──────────────────────────────────────────────────────────────

function saveToHistory(input, output) {
  chrome.storage.local.get(['history'], (data) => {
    const history = data.history || [];
    history.unshift({ input, output, timestamp: Date.now() });
    if (history.length > 10) history.length = 10;
    chrome.storage.local.set({ history });
  });
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return mins + 'm ago';
  if (hours < 24) return hours + 'h ago';
  if (days === 1) return 'yesterday';
  return days + 'd ago';
}

function renderHistoryList() {
  const list = document.getElementById('history-list');
  if (!list) return;
  const s = UI_STRINGS[currentUiLang] || UI_STRINGS['en'];
  list.innerHTML = '';

  // Заголовок
  const heading = document.createElement('div');
  heading.className = 'history-heading';
  heading.textContent = s.historyTitle;
  list.appendChild(heading);

  chrome.storage.local.get(['history'], (data) => {
    const history = data.history || [];
    if (history.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'history-empty';
      empty.textContent = s.historyEmpty;
      list.appendChild(empty);
      return;
    }

    history.forEach(item => {
      const el = document.createElement('div');
      el.className = 'history-item';

      const preview = document.createElement('div');
      preview.className = 'history-preview';
      const previewText = (item.input || '').substring(0, 120);
      preview.textContent = previewText + (item.input && item.input.length > 120 ? '…' : '');

      const time = document.createElement('div');
      time.className = 'history-time';
      time.textContent = timeAgo(item.timestamp);

      el.append(preview, time);

      el.addEventListener('click', () => {
        // Показываем сохранённый результат
        const rc = document.getElementById('result-container');
        rc.className = '';
        rc.innerHTML = marked.parse(item.output || '');
        rc.style.display = 'block';
        document.getElementById('empty-state').style.display = 'none';
        document.getElementById('copy-btn').style.display = 'block';
        // Закрываем историю
        document.getElementById('history-block').style.display = 'none';
        document.getElementById('history-btn').classList.remove('active');
      });

      list.appendChild(el);
    });
  });
}

// ── processText ───────────────────────────────────────────────────────────

function processText(text) {
  if (isAnalyzing) return;   // QW6: не запускаем новый анализ, пока идёт текущий

  const resultContainer = document.getElementById("result-container");
  const settingsBlock   = document.getElementById("settings-block");
  const s = UI_STRINGS[currentUiLang] || UI_STRINGS['en'];

  chrome.storage.local.get(["apiKey", "provider", "customUrl", "language", "savedModel"], (data) => {
    if (!data.apiKey) {
      resultContainer.className = "";
      resultContainer.textContent = s.noKey;
      settingsBlock.style.display = "block";
      document.getElementById("copy-btn").style.display = "none";
      return;
    }

    document.getElementById('empty-state').style.display = 'none';
    resultContainer.style.display = 'block';
    resultContainer.className = "";

    // QW3: скелетон-загрузка вместо простой строки текста
    resultContainer.innerHTML =
      '<div class="skeleton-line" style="width:92%"></div>' +
      '<div class="skeleton-line" style="width:100%"></div>' +
      '<div class="skeleton-line" style="width:78%"></div>';

    document.getElementById("copy-btn").style.display = "none";

    // QW2: сброс скролла наверх и закрытие настроек/истории при новом тексте
    window.scrollTo({ top: 0 });
    settingsBlock.style.display = "none";
    const historyBlock = document.getElementById('history-block');
    const historyBtn   = document.getElementById('history-btn');
    if (historyBlock) historyBlock.style.display = 'none';
    if (historyBtn)   historyBtn.classList.remove('active');

    fetchFromAI(text, data.apiKey, data.provider || "groq", data.customUrl, data.language, data.savedModel);
  });
}

async function fetchFromAI(text, apiKey, provider, customUrl, language, savedModel, customSystemPrompt) {
  const resultContainer = document.getElementById("result-container");
  const s = UI_STRINGS[currentUiLang] || UI_STRINGS['en'];

  // QW6: помечаем начало запроса и блокируем кнопки
  isAnalyzing = true;
  const pasteBtn = document.getElementById('paste-btn');
  const ytBtn    = document.getElementById('yt-summarize-btn');
  if (pasteBtn) pasteBtn.disabled = true;
  if (ytBtn)    ytBtn.disabled = true;

  const endpoint  = provider === "custom" ? customUrl : PROVIDERS[provider].url;
  const modelName = savedModel || PROVIDERS[provider].model;

  const langRule = (!language || language === "auto")
    ? "Отвечай на том же языке что и исходный текст."
    : `You MUST respond in ${LANGUAGE_NAMES[language]}, regardless of the source text language. This is mandatory.`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "system",
            content: customSystemPrompt
              ? `${langRule}\n\n${customSystemPrompt}`
              : `${langRule}\n\nТы эксперт по объяснению сложных текстов. Твоя задача — сделать текст понятным для умного человека без специальных знаний в этой области.\nПРАВИЛА: Сохраняй все важные факты, цифры и нюансы. Не упрощай смысл, только язык. Не добавляй информацию которой нет в тексте. Не будь снисходительным — читатель умный, просто не знаком с темой.\nСТРУКТУРА ОТВЕТА: Начни с главного за 2-3 предложения. Затем список ключевых пунктов. В конце — что конкретно это значит для читателя, только если применимо.`
          },
          {
            role: "user",
            content: `${text}\n\n${langRule}`
          }
        ]
      })
    });

    if (response.ok) {
      const data = await response.json();
      const aiOutput = data.choices[0].message.content;
      resultContainer.className = "";
      resultContainer.innerHTML = marked.parse(aiOutput);
      document.getElementById("copy-btn").style.display = "block";
      saveToHistory(text, aiOutput);
    } else if (response.status === 401) {
      resultContainer.className = "error-text";
      resultContainer.textContent = s.err401;
      document.getElementById("copy-btn").style.display = "none";
    } else if (response.status === 429) {
      resultContainer.className = "error-text";
      resultContainer.textContent = s.err429;
      document.getElementById("copy-btn").style.display = "none";
    } else {
      resultContainer.className = "error-text";
      resultContainer.textContent = s.errCode + response.status;
      document.getElementById("copy-btn").style.display = "none";
    }
  } catch (e) {
    resultContainer.className = "error-text";
    resultContainer.textContent = s.errNet;
    document.getElementById("copy-btn").style.display = "none";
  } finally {
    // QW6: снимаем блокировку после завершения запроса (успех или ошибка)
    isAnalyzing = false;
    if (pasteBtn) pasteBtn.disabled = false;
    if (ytBtn)    ytBtn.disabled = false;
  }
}
