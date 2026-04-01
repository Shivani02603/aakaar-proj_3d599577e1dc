#!/bin/bash
set -e
npx prisma migrate deploy || true
exec node backend/server.js