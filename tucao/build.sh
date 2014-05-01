#!/bin/sh

OUTPUT='tucaoHTML5.user.js'

cat header.js > $OUTPUT
cat ../multiFiles.js >> $OUTPUT
cat tucao.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
