#!/bin/bash

while ! grep -q "WRAPPED_TOKEN_USER_MANAGEMENT=" /.temp.env; do
  echo "Waiting for WRAPPED_TOKEN_USER_MANAGEMENT environment variable to be set..."
  sleep 1
done

npx knex migrate:latest  --knexfile knexfile.cjs

exec nodejs server