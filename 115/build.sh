#!/bin/sh

OUTPUT='115HTML5.user.js'

cat header.js > $OUTPUT
cat ../multiFiles.js >> $OUTPUT
cat 115.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
