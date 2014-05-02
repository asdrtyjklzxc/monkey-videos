#!/bin/sh

OUTPUT='neteaseHTML5.user.js'

cat header.js > $OUTPUT
cat ../multiFiles.js >> $OUTPUT
cat netease.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
