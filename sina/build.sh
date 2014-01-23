#!/bin/sh

OUTPUT='sinaHTML5.user.js'

cat header.js > $OUTPUT
cat ../multiFiles.js >> $OUTPUT
cat md5.js >> $OUTPUT
cat sina.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
