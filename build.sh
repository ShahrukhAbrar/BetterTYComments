#!/usr/bin/env bash
# build.sh — Builds Firefox and Chrome distributions from src/
# Usage:
#   ./build.sh          → builds both
#   ./build.sh firefox  → builds Firefox only
#   ./build.sh chrome   → builds Chrome only

set -e

SRC="src"
SHARED_FILES=(
  "browser-polyfill.js"
  "content.js"
  "popup.js"
  "popup.html"
  "comments.css"
)

build() {
  local BROWSER=$1
  local DEST="dist-$BROWSER"

  echo "Building $BROWSER → $DEST/"
  mkdir -p "$DEST/icons"

  # Copy shared source files
  for f in "${SHARED_FILES[@]}"; do
    cp "$SRC/$f" "$DEST/$f"
  done

  # Copy icons
  cp "$SRC/icons/"* "$DEST/icons/"

  # Copy the correct manifest
  cp "$SRC/manifest.$BROWSER.json" "$DEST/manifest.json"

  echo "  ✓ $DEST ready"
}

if [[ "$1" == "firefox" ]]; then
  build firefox
elif [[ "$1" == "chrome" ]]; then
  build chrome
else
  build firefox
  build chrome
fi

echo "Done!"
