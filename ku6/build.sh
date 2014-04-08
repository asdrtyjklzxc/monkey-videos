#!/bin/sh

OUTPUT='ku6HTML5.user.js'

cat header.js > $OUTPUT
cat ../multiFiles.js >> $OUTPUT
cat ku6.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
