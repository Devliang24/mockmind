#!/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "=== Pull latest ==="
git pull --rebase

echo "=== Build ==="
npm run build 2>&1 | tail -3

echo "=== Copy dist ==="
cp -r apps/server/dist/* dist/

echo "=== Deploy to server ==="
ssh root@10.201.0.20 "rm -rf /root/mockmind/dist"
scp -qr dist root@10.201.0.20:/root/mockmind/
scp -q mockmind.yaml root@10.201.0.20:/root/mockmind/mockmind.yaml
cd packages && tar czf - shared | ssh root@10.201.0.20 "rm -rf /root/mockmind/node_modules/@mockmind/shared && cd /root/mockmind/node_modules/@mockmind && tar xzf -" 2>/dev/null
cd ..

echo "=== Restart container ==="
ssh root@10.201.0.20 "docker rm -f mockmind 2>/dev/null; docker run -d --name mockmind \
  --restart unless-stopped \
  -p 31333:4000 \
  -v /root/mockmind/dist:/app/dist:ro \
  -v /root/mockmind/node_modules:/app/node_modules:ro \
  -v /root/mockmind/mockmind.yaml:/app/mockmind.yaml:ro \
  -v /root/mockmind/.mockmind:/app/.mockmind \
  node:20-slim \
  node /app/dist/cli/index.js start --config /app/mockmind.yaml --host 0.0.0.0 --port 4000"

sleep 3
ssh root@10.201.0.20 "docker ps --filter name=mockmind --format '{{.Names}} {{.Status}} {{.Ports}}' && curl -s --max-time 5 http://127.0.0.1:31333/health"
echo "=== Done ==="
