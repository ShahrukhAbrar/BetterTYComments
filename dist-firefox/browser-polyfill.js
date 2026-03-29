// Cross-browser shim: maps `browser` API → `chrome` on Chrome/Edge
// On Firefox, `browser` already exists so this is a no-op.
if (typeof browser === 'undefined') {
  var browser = chrome;
}
