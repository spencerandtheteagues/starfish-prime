#!/bin/bash
cd /Users/spencerteague/Silverguard-Eldercare
npx expo run:ios --device "iPhone 17 Pro Max" --no-build-cache > /Users/spencerteague/.gemini/tmp/a18f2235cff4b7c03fb2d563f06b9f867b3a2561dbd61a36c8ace1f2ada9bd92/build_log_script.txt 2>&1 &
echo "Build started in background with PID $!"
