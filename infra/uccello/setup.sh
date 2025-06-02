#!/bin/sh
set -e # Exit immediately if a command exits with a non-zero status

npm install

npm run build

while true; do sleep 3600; done