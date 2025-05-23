#!/bin/bash

# while ! grep -q "WRAPPED_TOKEN_TOURNAMENT=" /app/temp_env/.temp.env; do
#   echo "Waiting for WRAPPED_TOKEN_TOURNAMENT environment variable to be set..."
#   sleep 1
# done

mkdir /app/database 2>/dev/null

npx knex migrate:latest  --knexfile knexfile.cjs

exec npx nodemon server
