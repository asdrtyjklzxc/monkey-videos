#!/bin/sh

OUTPUT='wasuHTML5.user.js'

cat header.js > $OUTPUT
cat ../multiFiles.js >> $OUTPUT
cat wasu.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
