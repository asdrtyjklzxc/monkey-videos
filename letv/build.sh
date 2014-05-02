#!/bin/sh

OUTPUT='letvHTML5.user.js'

cat header.js > $OUTPUT
cat ../multiFiles.js >> $OUTPUT
cat letv.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
