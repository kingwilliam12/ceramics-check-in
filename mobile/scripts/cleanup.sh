#!/bin/bash

# Clean npm cache
npm cache clean --force

# Clean watchman
watchman watch-del-all 2>/dev/null || echo "Watchman not installed, skipping"

# Remove node modules and lock files
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock

# Remove iOS build files
rm -rf ios/build 2>/dev/null || true
rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null || true

# Remove Android build files
rm -rf android/build 2>/dev/null || true
rm -rf android/app/build 2>/dev/null || true
rm -rf android/app/debug 2>/dev/null || true

# Remove temp files
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/react-* 2>/dev/null || true
rm -rf $TMPDIR/haste-* 2>/dev/null || true
rm -rf $TMPDIR/npm-* 2>/dev/null || true

# Remove expo files
rm -rf .expo 2>/dev/null || true
rm -rf .expo-shared 2>/dev/null || true

# Remove Metro bundler cache
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-* 2>/dev/null || true
rm -rf $TMPDIR/react-* 2>/dev/null || true

# Remove watchman temp files
rm -rf $TMPDIR/react-native-packager-cache-* 2>/dev/null || true
rm -rf $TMPDIR/metro-cache 2>/dev/null || true

echo "Cleanup complete!"
