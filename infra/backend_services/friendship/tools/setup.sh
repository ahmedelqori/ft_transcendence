#!/bin/bash

mkdir /app/database 2>/dev/null

npx knex migrate:latest  --knexfile knexfile.cjs

exec nodejs server