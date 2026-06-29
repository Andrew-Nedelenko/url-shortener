#!/bin/bash
set -euo pipefail

APP_NAME="url-shortener"
REPO_URL=""
DEPLOY_DIR="/opt/$APP_NAME"
DOMAIN="example.com"

echo "=== Installing Docker ==="
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
fi

echo "=== Installing Nginx ==="
if ! command -v nginx &> /dev/null; then
  sudo apt update && sudo apt install -y nginx
fi

echo "=== Installing Certbot ==="
if ! command -v certbot &> /dev/null; then
  sudo apt install -y certbot python3-certbot-nginx
fi

echo "=== Installing PostgreSQL ==="
if ! command -v psql &> /dev/null; then
  sudo apt install -y postgresql postgresql-contrib
fi

echo "=== Setting up PostgreSQL ==="
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='url_shortener'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER url_shortener WITH PASSWORD 'CHANGE_ME_TO_A_SECURE_PASSWORD';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='url_shortener'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE url_shortener OWNER url_shortener;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE url_shortener TO url_shortener;"

echo "=== Cloning / updating repo ==="
if [ -d "$DEPLOY_DIR" ]; then
  cd "$DEPLOY_DIR" && git pull
else
  sudo mkdir -p "$DEPLOY_DIR" && sudo chown "$USER":"$USER" "$DEPLOY_DIR"
  git clone "$REPO_URL" "$DEPLOY_DIR"
  cd "$DEPLOY_DIR"
fi

echo "=== Building and starting app ==="
cp .env.production .env
docker compose -f docker-compose.prod.yml up -d --build

echo "=== Running migrations ==="
docker compose -f docker-compose.prod.yml exec -T app sh -c \
  "node -e \"require('reflect-metadata');require('./dist/data-source').default.initialize().then(ds => ds.runMigrations()).then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); })\"" \
  || docker compose -f docker-compose.prod.yml exec -T app npx typeorm migration:run -d dist/data-source.js

echo "=== Configuring Nginx ==="
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf
sudo nginx -t && sudo systemctl reload nginx

echo "=== Setting up SSL ==="
sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "admin@$DOMAIN" || true

echo "=== Setting up certbot auto-renewal ==="
sudo bash -c '(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook \"systemctl reload nginx\"") | sort -u | crontab -'

echo "=== Done! ==="
echo "App running at https://$DOMAIN"
