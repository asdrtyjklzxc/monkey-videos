#!/bin/sh

OUTPUT='cntvHTML5.user.js'

cat header.js > $OUTPUT
cat ../multiFiles.js >> $OUTPUT
cat cntv.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
