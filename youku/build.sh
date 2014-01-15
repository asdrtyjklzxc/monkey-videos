#!/bin/sh

OUTPUT='youkuHTML5.user.js'

cat header.js > $OUTPUT
cat ../multiFiles.js >> $OUTPUT
cat youku.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
