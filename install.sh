#!/bin/bash
set -e
echo "Running custom npm install..."
npm config set registry https://registry.npmjs.org/
npm config delete //registry.npmjs.org/:_authToken 2>/dev/null || true
npm install --verbose
