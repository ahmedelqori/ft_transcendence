#!/bin/sh
set -e # Exit immediately if a command exits with a non-zero status

npm install

npm run build

ls  /

ls /app

while true; do sleep 3600; done