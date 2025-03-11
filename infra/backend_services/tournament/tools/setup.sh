#!/bin/bash


npx knex migrate:latest  --knexfile knexfile.cjs

exec nodejs server