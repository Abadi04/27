#!/bin/sh
set -eu

cd "$(dirname "$0")"

xcodebuild archive \
  -project TheaterOfIdeas.xcodeproj \
  -scheme TheaterOfIdeas \
  -configuration Release \
  -destination "generic/platform=iOS" \
  -archivePath build/TheaterOfIdeas.xcarchive

xcodebuild -exportArchive \
  -archivePath build/TheaterOfIdeas.xcarchive \
  -exportPath build/ipa \
  -exportOptionsPlist exportOptions.plist
