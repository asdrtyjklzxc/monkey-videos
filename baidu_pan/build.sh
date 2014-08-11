#!/bin/sh

OUTPUT='BaiduPanHTML5.user.js'

cat header.js > $OUTPUT
cat ../singleFile.js >> $OUTPUT
cat baidu_pan.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
