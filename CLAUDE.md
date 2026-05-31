# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Loading the Extension

No build step. Load directly into Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `ai simplifier/` folder

After editing JS/CSS files, click **Reload** on the extension card. After editing `manifest.json`, remove and re-add the extension.

## Architecture

Three independent JS execution contexts that communicate exclusively via `chrome.storage.local`:

**`background.js`** — Service worker (MV3). Manages the context menu, toolbar icon clicks, and side panel open/close tracking via a runtime port named `'sidepanel'`. Contains no UI logic. `sidePanel.open()` **must be called synchronously** inside a user-gesture handler — never inside an async callback or after `await`, or Chrome will throw "may only be called in response to a user gesture".

**`sidepanel.js`** — All side panel UI. On `DOMContentLoaded`, reads state from `chrome.storage.local` and then listens for `storage.onChanged` to receive new text from background. Makes non-streaming `fetch` calls to the LLM. Uses `marked.min.js` (bundled locally) to render Markdown. Manages settings, history (last 10), theme, and multi-language UI strings inline.

**`content.js`** — Injected into every page. Renders a floating action button (FAB) and an inline explanation card using a **closed Shadow DOM** (`mode: 'closed'`) so extension styles never leak into host pages. Makes **streaming SSE** `fetch` calls directly (bypassing the side panel). Has its own minimal Markdown renderer (`miniMarkdown`) using regex + `escapeHtml` — does not use `marked.min.js`.

### Storage keys used as shared state

| Key | Writer | Reader |
|---|---|---|
| `selectedText`, `timestamp` | `background.js` | `sidepanel.js` |
| `openedVia`, `openedViaTime` | `background.js` | `sidepanel.js` |
| `apiKey`, `provider`, `customUrl`, `savedModel`, `language` | `sidepanel.js` | `sidepanel.js`, `content.js` |
| `history` | `sidepanel.js` | `sidepanel.js` |
| `theme`, `uiLanguage`, `settingsOpen` | `sidepanel.js` | `sidepanel.js` |

### Supported LLM providers

`groq`, `openai`, `openrouter`, `custom` — defined in `PROVIDERS` objects in both `sidepanel.js` and `content.js` (duplicated, keep in sync).

## Critical Invariants

**Timestamp on every storage write of selected text.** `chrome.storage.onChanged` does not fire if the value didn't change. Always write `{ selectedText: text, timestamp: Date.now() }` together so repeated selection of the same text still triggers the listener.

**API key fetched immediately before each fetch call.** Never cache the key in a global variable. Read it from `chrome.storage.local` directly before the `fetch` call in `fetchFromAI` and `streamExplain`.

**XSS safety.** `content.js` uses its own `escapeHtml` + `miniMarkdown` — never use `innerHTML` with raw LLM output. `sidepanel.js` uses `marked.parse()` from a locally-bundled file — never load scripts from CDN (MV3 blocks remote code).

**Race condition guard in sidepanel.js.** `isAnalyzing` flag prevents starting a new LLM request while one is in flight. `fetchFromAI` sets it on entry and clears it in `finally`.

**`openedVia` flag freshness.** The flag is only trusted if less than 8 seconds old (`flagAge < 8000`). Stale flags from previous sessions are ignored to avoid showing wrong initial state.

**`sidePanel.open()` before `storage.set` in `floatBtnClick`.** The gesture is still active at the point `onMessage` fires, but it expires during async operations. Open the panel first, then save the text.

## Provider Auto-Detection

`detectProviderFromKey(key)` in `sidepanel.js` identifies the provider from API key prefix: `sk-or-` → OpenRouter, `gsk_` → Groq, `sk-` → OpenAI.
