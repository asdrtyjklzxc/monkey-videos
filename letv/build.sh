#!/bin/sh

OUTPUT='letvHTML5.user.js'

cat header.js > $OUTPUT
cat ../singleFile.js >> $OUTPUT
cat letv.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
