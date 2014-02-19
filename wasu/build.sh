#!/bin/sh

OUTPUT='wasuHTML5.user.js'

cat header.js > $OUTPUT
cat ../singleFile.js >> $OUTPUT
cat wasu.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
