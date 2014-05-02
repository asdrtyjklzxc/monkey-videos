#!/bin/sh

OUTPUT='ppsHTML5.user.js'

cat header.js > $OUTPUT
cat ../multiFiles.js >> $OUTPUT
cat pps.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
