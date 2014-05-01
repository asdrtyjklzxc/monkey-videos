#!/bin/sh

OUTPUT='funshionHTML5.user.js'

cat header.js > $OUTPUT
cat ../multiFiles.js >> $OUTPUT
cat funshion.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
