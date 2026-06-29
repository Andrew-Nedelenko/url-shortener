## Url shortener Project setup

```bash
$ pnpm install
```

## Run docker (docker compose up for local development)

```bash

## Compile and run the project

```bash
# watch mode
$ pnpm start:dev

# production mode
$ pnpm start:prod
```

## Run migrations

```bash

## Run migrations

```bash
$ pnpm migrate:up | Runs all pending migrations
$ pnpm migrate:down | Reverts the latest migration
$ pnpm migrate:make | Creates a new migration file | pnpm migrate:make src/migrations/
```

## Run tests (No need to run separate docker-compose.tests, it runs automatically)

```bash
# e2e tests
$ pnpm run test:e2e


## Production initial setup

```bash
**Before deploying — on the VPS:**

1. Edit `scripts/deploy.sh` — set `REPO_URL` and `DOMAIN`
2. Edit `.env.production` — set `DB_PASSWORD`
3. Edit `nginx/nginx.conf` — replace `example.com` with real domain
4. Run: `bash scripts/deploy.sh`

The script installs Docker, Nginx, PostgreSQL, Certbot; creates the DB user and database; builds the app; runs migrations; configures SSL with auto-renewal.

```