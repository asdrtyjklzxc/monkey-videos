#!/bin/sh

OUTPUT='justingHTML5.user.js'

cat header.js > $OUTPUT
cat ../singleFile.js >> $OUTPUT
cat justing.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
