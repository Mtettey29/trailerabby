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

Without Redis credentials, data is stored in `.data/trailers.json` locally.

## Deploy to Vercel

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com), **Add New Project** and import the repo.
3. In the project, go to **Storage** → **Marketplace** → add **Upstash Redis**.
4. Connect the database to your project (Vercel injects `UPSTASH_REDIS_REST_URL`
   and `UPSTASH_REDIS_REST_TOKEN` automatically).
5. Deploy. Share the production URL with your team.

No login in v1 — keep the URL private to your dispatch team.

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
