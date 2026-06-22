# ProfRanker Environments

This project is configured for two environments:

1. Development (local)
2. Production

## Architecture

### Development
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Storage: local filesystem (inside server/media)
- DB: Neon
- RQ worker: local worker + Redis on Docker Desktop

### Production
- Frontend: https://profrankerapp.com
- Backend: https://profranker-api.onrender.com
- Storage: local for now (R2 can be enabled later)
- DB: Neon
- RQ worker: disabled for now

## Environment Files

Create local env files by copying examples:

1. Backend development:
	- Copy server/.env.development.example -> server/.env.development
2. Backend production profile:
	- Copy server/.env.production.example -> server/.env.production
3. Frontend development:
	- Copy client/.env.development.example -> client/.env.development
4. Frontend production build:
	- Copy client/.env.production.example -> client/.env.production

Important:
- Real env files are git-ignored.
- Fill DATABASE_URL with your Neon connection string.

## Run Development

Use these 4 scripts at root:

1. run-dev.cmd
2. run-back-dev.cmd
3. run-front-dev.cmd
4. run-host-dev.cmd

What each script does:

- run-dev.cmd: starts Redis (Docker) + frontend + backend + RQ worker
- run-back-dev.cmd: starts backend + RQ worker only
- run-front-dev.cmd: starts frontend only
- run-host-dev.cmd: starts Cloudflare tunnel only

## Run Production Profile Locally

From repository root:

1. run-prod-local.cmd

This starts backend with APP_ENV=production and does not start the RQ worker.

## Render Production Variables (backend)

Set these in Render service environment variables:

- APP_ENV=production
- DJANGO_DEBUG=false
- DJANGO_SECRET_KEY=<strong-secret>
- DATABASE_URL=<neon-url-with-sslmode=require>
- CLIENT_URL=https://profrankerapp.com
- ALLOWED_HOSTS=profranker-api.onrender.com
- USE_S3_MEDIA=false (change to true when R2 is ready)
- RQ_ENABLED=false

Optional HTTPS hardening:

- SECURE_SSL_REDIRECT=true
- SESSION_COOKIE_SECURE=true
- CSRF_COOKIE_SECURE=true
- SECURE_HSTS_SECONDS=31536000
- SECURE_HSTS_INCLUDE_SUBDOMAINS=true
- SECURE_HSTS_PRELOAD=true

## Frontend Production Build Variable

Set for production build/deploy:

- REACT_APP_API_URL=https://profranker-api.onrender.com

## R2 Later

When you are ready for Cloudflare R2 in production:

1. Set USE_S3_MEDIA=true
2. Add AWS_S3_ENDPOINT_URL
3. Add AWS_ACCESS_KEY_ID
4. Add AWS_SECRET_ACCESS_KEY
5. Add AWS_STORAGE_BUCKET_NAME
6. Optionally set AWS_S3_CUSTOM_DOMAIN
