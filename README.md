# R1Parkings

Dashboard:

start timescaledb

put DATABASE_URL in .env

run
```bash
npx prisma generate
npx prisma migrate dev init
npx tsx prisma/seed.ts # seed the database
```

now start the webapp

```bash
npm run dev
# or
bun run dev
# or
pnpm run dev
```

Backend:

```bash
export DATABASE_URL=yourdburi
export PARKING_LOT_ID=dlf-mall # or ambience-mall
```
start the server

```bash
go run .
```
