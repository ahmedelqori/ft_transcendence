#!/bin/sh
set -e # Exit immediately if a command exits with a non-zero status

while ! grep -q "WRAPPED_TOKEN_GAME=" /app/temp_env/.temp.env; do
  echo "Waiting for WRAPPED_TOKEN_GAME environment variable to be set..."
  sleep 1
done

# npm run migrate
npm run generate
exec npm run start
