(function () {
  'use strict';

  let enabled = true;
  let mutationObserver = null;
  let commentsObserver = null;

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

  browser.storage.onChanged.addListener((changes) => {
    if (changes.enabled) {
      enabled = changes.enabled.newValue;
      enabled ? init() : destroy();
    }
  });

  function isWatchPage() {
    return window.location.pathname === '/watch';
  }

  function isShortsPage() {
    return window.location.pathname.startsWith('/shorts/');
  }

  function init() {
    if (!isWatchPage() || isShortsPage()) return;

    const existing = document.querySelector('ytd-comments#comments');
    if (existing) applyScrollable(existing);

    if (commentsObserver) commentsObserver.disconnect();
    commentsObserver = new MutationObserver(() => {
      const comments = document.querySelector('ytd-comments#comments');
      if (comments && !comments.dataset.ytscActive) {
        applyScrollable(comments);
      }
    });
    commentsObserver.observe(document.body, { childList: true, subtree: true });

    observeNavigation();
  }

  function applyScrollable(comments) {
    if (comments.dataset.ytscActive) return;
    if (isShortsPage()) return;

    comments.dataset.ytscActive = 'true';

    const wrapper = document.createElement('div');
    wrapper.id = 'ytsc-wrapper';
    comments.parentNode.insertBefore(wrapper, comments);
    wrapper.appendChild(comments);
  }

  function destroy() {
    if (commentsObserver) {
      commentsObserver.disconnect();
      commentsObserver = null;
    }

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
    if (mutationObserver) return;
    let lastUrl = location.href;
    mutationObserver = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        destroy();
        if (enabled) setTimeout(() => init(), 1500);
      }
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  observeNavigation();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { if (enabled) init(); });
  } else {
    if (enabled) init();
  }
})();
