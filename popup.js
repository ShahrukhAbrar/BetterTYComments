const toggle = document.getElementById('toggle');
const statusEl = document.getElementById('status');
const statusText = document.getElementById('status-text');
const reloadNote = document.getElementById('reload-note');

browser.storage.local.get('enabled').then(result => {
  const enabled = result.enabled !== false;
  toggle.checked = enabled;
  updateUI(enabled);
});

toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  browser.storage.local.set({ enabled });
  updateUI(enabled);

  browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    if (tabs[0]) {
      browser.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE', enabled }).catch(() => {
        reloadNote.classList.add('visible');
      });
    }
  });
});

function updateUI(enabled) {
  if (enabled) {
    statusEl.className = 'status-badge on';
    statusText.textContent = 'Active';
  } else {
    statusEl.className = 'status-badge off';
    statusText.textContent = 'Disabled';
  }
}
