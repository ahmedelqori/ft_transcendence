#!/bin/sh
set -e # Exit immediately if a command exits with a non-zero status
npm run migrate
npm run generate
exec npm run dev
