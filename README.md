# Todo App

A reactive, real-time todo application built with Electric SQL + TanStack DB. Changes sync instantly across all connected clients via Postgres-backed Electric sync.

## Features

- Create, edit, and delete todos with title, description, priority, and due date
- Mark todos as complete with a single click
- Filter todos by status: All, Active, Completed
- Priority levels: Low, Medium, High with color-coded badges
- Optional due dates with calendar display
- Real-time sync — changes appear instantly across browser tabs and devices
- Optimistic mutations — UI updates immediately, syncs in background

## Tech Stack

- **[Electric SQL](https://electric-sql.com)** — Real-time Postgres sync to the client
- **[TanStack DB](https://tanstack.com/db)** — Reactive collections with live queries and optimistic mutations
- **[Drizzle ORM](https://orm.drizzle.team)** — Type-safe Postgres schema and migrations
- **[TanStack Start](https://tanstack.com/start)** — React meta-framework with SSR
- **[Radix UI Themes](https://www.radix-ui.com/themes)** — Accessible component library

## Running Locally

```bash
pnpm install && pnpm dev:start
```

Then open [http://localhost:5173](http://localhost:5173).

## Project Structure

```
src/
├── db/
│   ├── schema.ts          # Drizzle schema (todos table)
│   ├── zod-schemas.ts     # Zod schemas derived from Drizzle
│   └── collections/
│       └── todos.ts       # TanStack DB collection with Electric sync
├── routes/
│   ├── index.tsx          # Main todo page (ssr: false, preloads collection)
│   └── api/
│       ├── todos.ts       # Electric shape proxy route
│       └── mutations/
│           └── todos.ts   # CRUD mutation handlers (POST/PUT/DELETE)
```

## License

MIT
