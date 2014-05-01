#!/bin/sh

OUTPUT='56HTML5.user.js'

cat header.js > $OUTPUT
cat ../multiFiles.js >> $OUTPUT
cat 56.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
