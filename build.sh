#!/bin/sh
# Minify the shared scripts: js/src/<name>.js (readable source, edit this)
# -> js/<name>.js (the URL pages load). Pinned esbuild so output is
# reproducible; the v3-sankhacooray-com copies of sankha-analytics.js and
# sankha-weather.js must come out byte-identical to these.
set -e
cd "$(dirname "$0")"
for name in sankha-analytics sankha-footer sankha-contact sankha-weather; do
  npx -y esbuild@0.24.0 "js/src/$name.js" --minify --target=es2017 --charset=utf8 --log-level=warning \
    --banner:js="/* $name.js — minified build; source: js/src/$name.js (edit there, then run ./build.sh) */" \
    --outfile="js/$name.js"
  node --check "js/$name.js"
done
ls -l js/*.js
