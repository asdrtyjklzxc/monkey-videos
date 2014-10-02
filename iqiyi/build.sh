#!/bin/sh

OUTPUT='iqiyiHTML5.user.js'

cat header.js > $OUTPUT
cat md5.js >> $OUTPUT
cat ../multiFiles.js >> $OUTPUT
cat iqiyi.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0

