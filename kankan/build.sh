#!/bin/sh

OUTPUT='kankanHTML5.user.js'

cat header.js > $OUTPUT
cat ../singleFile.js >> $OUTPUT
cat kankan.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
