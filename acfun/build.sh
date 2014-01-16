#!/bin/sh

OUTPUT='acfunHTML5.user.js'

cat header.js > $OUTPUT
cat ../singleFile.js >> $OUTPUT
cat acfun.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
