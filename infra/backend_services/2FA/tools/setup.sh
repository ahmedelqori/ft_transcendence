#!/bin/bash

while ! grep -q "VAULT_WRAPPED_TOKEN=" /.temp.env; do
  echo "Waiting for VAULT_WRAPPED_TOKEN environment variable to be set..."
  sleep 2
done



echo "wrap token : $VAULT_WRAPPED_TOKEN"

echo "ROLE_ID : $ROLE_ID"
npx knex migrate:latest  --knexfile knexfile.cjs

exec nodejs server