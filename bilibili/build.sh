#!/bin/sh

OUTPUT='bilibiliHTML5.user.js'

cat header.js > $OUTPUT
cat ../singleFile.js >> $OUTPUT
cat bilibili.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
