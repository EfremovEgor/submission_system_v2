#!/bin/bash
# Deploys the current main: waits for the Image workflow to publish the image of
# this commit to GHCR, then makes the server pull and restart it.
# The server never builds: the vite build doesn't fit next to everything else there.
#
# Usage: scripts/deploy.sh
# Needs: gh (logged in), ssh access to the server.
set -euo pipefail

SERVER="${SERVER:-root@vm737980.vps.masterhost.tech}"
APP_DIR="/var/www/confchair/main_site"
REPO="EfremovEgor/submission_system_v2"

cd "$(dirname "$0")/.."
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
    echo "Commit your changes first: the image is built from the pushed commit." >&2
    exit 1
fi
git push origin HEAD:main
SHA="$(git rev-parse HEAD)"
TAG="sha-$(git rev-parse --short=7 HEAD)"

echo "Waiting for the image of $TAG..."
RUN=""
for _ in $(seq 1 30); do
    RUN="$(gh run list --repo "$REPO" --workflow image.yml --commit "$SHA" \
        --limit 1 --json databaseId -q '.[0].databaseId')"
    [ -n "$RUN" ] && break
    sleep 5
done
[ -n "$RUN" ] || { echo "No Image workflow run for $SHA" >&2; exit 1; }
gh run watch "$RUN" --repo "$REPO" --exit-status --interval 10 >/dev/null

ssh "$SERVER" "set -e
    cd $APP_DIR
    git pull --ff-only origin main
    CONFCHAIR_TAG=$TAG docker compose pull app
    CONFCHAIR_TAG=$TAG docker compose up -d app
    docker image prune -f >/dev/null"
echo "Deployed $TAG"
