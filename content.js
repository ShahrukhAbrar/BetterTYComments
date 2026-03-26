(function () {
  'use strict';

  let enabled = true;
  let mutationObserver = null;

  browser.storage.local.get('enabled').then(result => {
    enabled = result.enabled !== false;
    if (enabled) init();
  });

  browser.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'TOGGLE') {
      enabled = msg.enabled;
      enabled ? init() : destroy();
    }
  });

  function isWatchPage() {
    return window.location.pathname === '/watch';
  }

  function init() {
    if (!isWatchPage()) return;
    waitForElement('ytd-comments#comments', applyScrollable);
    observeNavigation();
  }

  function waitForElement(selector, callback, timeout = 15000) {
    const el = document.querySelector(selector);
    if (el) { callback(el); return; }
    const start = Date.now();
    const obs = new MutationObserver(() => {
      const found = document.querySelector(selector);
      if (found) { obs.disconnect(); callback(found); }
      else if (Date.now() - start > timeout) obs.disconnect();
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  function applyScrollable(comments) {
    if (comments.dataset.ytscActive) return;
    comments.dataset.ytscActive = 'true';

    const wrapper = document.createElement('div');
    wrapper.id = 'ytsc-wrapper';
    comments.parentNode.insertBefore(wrapper, comments);
    wrapper.appendChild(comments);
  }

  function destroy() {
    const wrapper = document.querySelector('#ytsc-wrapper');
    if (wrapper) {
      const comments = wrapper.querySelector('ytd-comments#comments');
      if (comments) {
        delete comments.dataset.ytscActive;
        wrapper.parentNode.insertBefore(comments, wrapper);
      }
      wrapper.remove();
    }
  }

  function observeNavigation() {
    let lastUrl = location.href;
    mutationObserver = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        destroy();
        if (enabled && isWatchPage()) {
          setTimeout(() => init(), 1500);
        }
      }
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { if (enabled) init(); });
  } else {
    if (enabled) init();
  }
})();
