#!/bin/bash
# Builds the image on this machine, pushes it to GHCR and makes the server pull it.
# The server never builds: the vite build doesn't fit next to everything else there.
#
# Usage: scripts/deploy.sh            (deploys the current HEAD, must be pushed)
# Needs: docker, gh (logged in, write:packages), ssh access to the server.
set -euo pipefail

SERVER="${SERVER:-root@vm737980.vps.masterhost.tech}"
APP_DIR="/var/www/confchair/main_site"
IMAGE="ghcr.io/efremovegor/confchair"

cd "$(dirname "$0")/.."
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
    echo "Commit your changes first: the image is tagged with the commit." >&2
    exit 1
fi
TAG="$(git rev-parse --short HEAD)"
git push origin HEAD:main

gh auth token | docker login ghcr.io -u "$(gh api user -q .login)" --password-stdin
docker build --platform linux/amd64 \
    --label "org.opencontainers.image.source=https://github.com/EfremovEgor/submission_system_v2" \
    -t "$IMAGE:$TAG" -t "$IMAGE:latest" .
docker push "$IMAGE:$TAG"
docker push "$IMAGE:latest"

ssh "$SERVER" "set -e
    cd $APP_DIR
    git pull --ff-only origin main
    CONFCHAIR_TAG=$TAG docker compose pull app
    CONFCHAIR_TAG=$TAG docker compose up -d app
    docker image prune -f >/dev/null"
echo "Deployed $IMAGE:$TAG"
