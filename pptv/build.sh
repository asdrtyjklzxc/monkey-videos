#!/bin/sh

OUTPUT='pptvHTML5.user.js'

cat header.js > $OUTPUT
cat ../multiFiles.js >> $OUTPUT
cat pptv.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
