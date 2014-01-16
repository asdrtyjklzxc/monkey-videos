#!/bin/sh

OUTPUT='youtubeHTML5.user.js'

cat header.js > $OUTPUT
cat ../singleFile.js >> $OUTPUT
cat youtube.js >> $OUTPUT

echo "$OUTPUT rebuilt"

exit 0
