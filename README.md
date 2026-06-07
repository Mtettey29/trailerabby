# Trailer Abby

Shared trailer tracking dashboard for logistics dispatch. Replace Excel copy/paste with
status-driven sections: **Outbound**, **Onsite**, and **In Shop**.

## Features

- Summary counts (total, outbound, onsite, in shop)
- Three tables filtered automatically by status
- Add / edit driver, location, notes
- Change status → trailer moves to the correct section
- Last updated timestamp on every row
- Auto-refresh every 30 seconds + manual refresh
- Shared board for your team via Vercel

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Redis credentials, data is stored in `.data/*.json` locally.

### Seed local data

```bash
npm run seed:all
```

That writes trailers (from the fixed-assets CSV), users, locations, drivers, alerts,
maintenance, and settings into `.data/`.

## Upstash Redis (production)

Production on Vercel **requires** Upstash — without it, serverless instances cannot
persist the shared board.

### 1. Connect Upstash on Vercel

1. Open [Vercel → trailerabby → Storage](https://vercel.com/dashboard).
2. **Create Database** → **Marketplace** → **Upstash Redis**.
3. Create a database (name e.g. `trailerabby`, region close to your users).
4. **Connect** it to the `trailerabby` project for **Production** (and Preview if you want).

Vercel adds `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` automatically.

### 2. Redeploy

Trigger a new production deploy so the new env vars are picked up.

### 3. Pull credentials locally (optional)

```bash
npx vercel env pull .env.local
```

Confirm `.env.local` has non-empty `UPSTASH_REDIS_REST_URL` and
`UPSTASH_REDIS_REST_TOKEN`.

### 4. Push local data to Redis

After `npm run seed:all` and Redis env vars are set:

```bash
npm run redis:check    # ping + show what's in Redis
npm run redis:push     # upload .data/*.json → Upstash (one-time bootstrap)
```

Use `npm run redis:push -- --force` to overwrite existing Redis keys.

Redis keys match the app: `trailers`, `users`, `locations`, `drivers`, `alerts`,
`maintenance`, `settings`.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo in [Vercel](https://vercel.com).
3. Connect **Upstash Redis** (see above).
4. Add Clerk env vars (`NEXT_PUBLIC_CLERK_*`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_APP_URL`).
5. Deploy and run `npm run redis:push` once to seed production data.

## AI development

See [AGENTS.md](AGENTS.md) for the master development prompt and links to the spec and main UI files.

## Spec Kit

This project uses [GitHub Spec Kit](https://github.github.io/spec-kit/) for spec-driven
development. Artifacts live in `.specify/` and `specs/001-trailer-dashboard/`.

## API

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/trailers` | List all trailers |
| POST | `/api/trailers` | Create trailer |
| PATCH | `/api/trailers/[id]` | Update trailer |
| DELETE | `/api/trailers/[id]` | Remove trailer |
