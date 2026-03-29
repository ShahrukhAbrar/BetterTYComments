# Better YouTube Portrait Comments — Cross-Browser Setup

Supports **Firefox** (Manifest V2) and **Chrome/Edge** (Manifest V3) from one shared codebase.

---

## Project Structure

```
BetterYTComments/
├── src/                        ← Edit your code here (shared)
│   ├── content.js
│   ├── popup.js
│   ├── popup.html
│   ├── comments.css
│   ├── browser-polyfill.js     ← Makes `browser.*` work in Chrome
│   ├── manifest.firefox.json   ← Firefox-specific manifest (MV2)
│   ├── manifest.chrome.json    ← Chrome-specific manifest (MV3)
│   └── icons/
├── dist-firefox/               ← Built output — load this in Firefox
├── dist-chrome/                ← Built output — load this in Chrome
├── build.sh                    ← Build script
└── README.md
```

---

## Workflow

### 1. Edit code
Make all changes inside `src/`. Never edit files inside `dist-*` directly.

### 2. Build
```bash
chmod +x build.sh

./build.sh           # builds both browsers
./build.sh firefox   # Firefox only
./build.sh chrome    # Chrome only
```

### 3. Load in browser

**Firefox:**
- Go to `about:debugging` → This Firefox → Load Temporary Add-on
- Select any file inside `dist-firefox/`

**Chrome / Edge:**
- Go to `chrome://extensions` → Enable Developer Mode
- Click "Load unpacked" → select the `dist-chrome/` folder

---

## How cross-browser compatibility works

All your JS uses the `browser.*` API (Firefox standard).
Chrome uses `chrome.*` instead.

`browser-polyfill.js` bridges the gap with two lines:
```js
if (typeof browser === 'undefined') {
  var browser = chrome;
}
```

It loads first (declared in both manifests before `content.js` / `popup.js`),
so your actual code never needs to change.

### Key manifest differences

| Feature            | Firefox (MV2)          | Chrome (MV3)       |
|--------------------|------------------------|--------------------|
| manifest_version   | 2                      | 3                  |
| Popup key          | `browser_action`       | `action`           |
| Permissions        | storage, activeTab     | + tabs             |
| Gecko block        | ✅ required             | ❌ omit             |
