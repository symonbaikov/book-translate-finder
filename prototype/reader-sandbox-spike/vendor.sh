#!/usr/bin/env bash
# Fetch the copy of foliate-js this spike measures.
#
# Pinned, and fetched rather than committed: the real vendoring happens in Phase 11.2 under
# packages/reader/vendor, and carrying two copies of somebody else's renderer in one repository is
# how the wrong one gets patched. The SHA is the whole point — an unpinned spike measures whatever
# upstream looked like on the day it ran, which makes its findings unfalsifiable.
set -euo pipefail

COMMIT=78914aef4466eb960965702401634c2cb348e9b1 # 2026-05-01, main
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="$HERE/vendor/foliate"

rm -rf "$TARGET"
mkdir -p "$TARGET"
git clone --quiet https://github.com/johnfactotum/foliate-js.git "$TARGET.tmp"
git -C "$TARGET.tmp" checkout --quiet "$COMMIT"
rm -rf "$TARGET.tmp/.git"
mv "$TARGET.tmp"/* "$TARGET/"
rm -rf "$TARGET.tmp"

# PDF.js is ~4 MB of a second engine, and Phase 11 excludes PDF (docs/plan.md).
rm -rf "$TARGET/vendor/pdfjs" "$TARGET/pdf.js"

echo "foliate-js @ $COMMIT → $TARGET"
