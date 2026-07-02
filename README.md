<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/f7759f38-870d-44e3-b3b6-5bcc5019d633

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Migrate mock data to PostgreSQL (optional)

1. Start a local Postgres (Docker recommended):

```bash
docker run -d --name uisb-postgres -e POSTGRES_USER=hazriyatularsyad -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=uisb_assets -p 5432:5432 postgres:15
```

2. Create tables (psql or run the SQL file):

```bash
# using psql
psql -h localhost -U hazriyatularsyad -d uisb_assets -f migrations/create_tables.sql
```

3. Run the migration script (uses `tsx`):

```bash
npx tsx scripts/migrateMockToPostgres.ts
```

4. Verify data in the database or via the app (ensure `server.ts` is running).
