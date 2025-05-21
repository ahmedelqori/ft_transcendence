#!/bin/bash

while ! grep -q "WRAPPED_TOKEN_2FA=" /.temp.env; do
  echo "Waiting for WRAPPED_TOKEN_2FA environment variable to be set..."
  sleep 1
done

mkdir /app/database 2>/dev/null

npx knex migrate:latest  --knexfile knexfile.cjs

exec nodejs server