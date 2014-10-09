#!/bin/sh

OUTPUT='ifengHTML5.user.js'

cat header.js > $OUTPUT
cat ../singleFile.js >> $OUTPUT
cat ifeng.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
