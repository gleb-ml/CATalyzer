// Отслеживаем окна с открытой панелью
const openWindows = new Set();

// Когда панель закрывается (крестик или любой другой способ) — порт рвётся
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'sidepanel') return;
  let windowId = null;
  port.onMessage.addListener((msg) => {
    if (msg.type === 'init') windowId = msg.windowId;
  });
  port.onDisconnect.addListener(() => {
    if (windowId) openWindows.delete(windowId);
  });
});

// Регистрируем контекстное меню надёжно: onInstalled срабатывает один раз при
// установке, но service worker может стартовать «холодным» (после выгрузки или
// при запуске профиля), и тогда onInstalled НЕ вызывается. Поэтому создаём меню
// и на onStartup. removeAll перед create защищает от ошибки «duplicate id».
function ensureContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "simplify-text",
      title: "✨ Объяснить через AI",
      contexts: ["selection"]
    });
  });
}

chrome.runtime.onInstalled.addListener(ensureContextMenu);
chrome.runtime.onStartup.addListener(ensureContextMenu);

// Клик по иконке расширения.
// ВАЖНО: НЕ используем async/await — sidePanel.open() требует
// синхронного вызова внутри обработчика жеста пользователя.
chrome.action.onClicked.addListener((tab) => {
  const windowId = tab.windowId;

  if (openWindows.has(windowId)) {
    // Закрываем панель
    openWindows.delete(windowId);
    chrome.sidePanel.setOptions({ enabled: false }, () => {
      chrome.sidePanel.setOptions({ enabled: true, path: 'sidepanel.html' });
    });
  } else {
    // Открываем — помечаем что открыто через иконку (главный экран)
    // Метка времени нужна чтобы устаревший флаг из старых сессий не влиял
    chrome.storage.local.set({ openedVia: 'icon', openedViaTime: Date.now() });
    chrome.sidePanel.open({ windowId }); // вызов синхронно, жест ещё активен
    openWindows.add(windowId);
  }
});

// Контекстное меню
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const text = info.selectionText;
  chrome.storage.local.set({
    selectedText: text,
    timestamp: Date.now(),
    openedVia: 'menu',
    openedViaTime: Date.now()
  }, () => {
    chrome.sidePanel.open({ windowId: tab.windowId });
    openWindows.add(tab.windowId);
  });
});

// Плавающая кнопка на странице
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (!sender.tab) return;
  const windowId = sender.tab.windowId;

  if (msg.type === 'floatBtnClick') {
    // ВАЖНО: sidePanel.open() обязан вызываться СИНХРОННО внутри обработчика,
    // пока ещё активен жест пользователя (он прокидывается из content.js через
    // sendMessage). Если спрятать его в callback storage.set — жест теряется и
    // открытие падает с "may only be called in response to a user gesture".
    chrome.sidePanel.open({ windowId });
    openWindows.add(windowId);
    // Текст сохраняем после — панель подхватит его через storage.onChanged
    // (timestamp гарантирует срабатывание onChanged даже при том же тексте).
    chrome.storage.local.set({
      selectedText: msg.text,
      timestamp: Date.now(),
      openedVia: 'float',
      openedViaTime: Date.now()
    });
  } else if (msg.type === 'openPanel') {
    // PDF-режим: открываем панель без текста (пользователь вставит вручную)
    chrome.storage.local.set({ openedVia: 'float', openedViaTime: Date.now() });
    chrome.sidePanel.open({ windowId });
    openWindows.add(windowId);
  }
});
