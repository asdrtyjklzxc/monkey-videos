#!/bin/sh

OUTPUT='sohuHTML5.user.js'

cat header.js > $OUTPUT
cat ../multiFiles.js >> $OUTPUT
cat sohu.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
