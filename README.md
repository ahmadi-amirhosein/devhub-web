# DevHub web (Next.js 16 + React 19 + TypeScript (Node 20.9+))

```bash
npm install
cp .env.local.example .env.local      # API base URL (default http://localhost:8080)
npm run dev                           # http://localhost:3000
```

The Go backend must be running and `CORS_ORIGIN` there must equal `http://localhost:3000` (the default).

- `/` and `/projects/[id]` are server-rendered (indexable by search engines)
- `/login`, `/dashboard` are client components (token kept in localStorage; move to an httpOnly cookie for production)
- Developer role has no features yet: proposals and profiles are the next backend step

Not compiled or run in the environment it was written in: if `npm run build` reports type errors, send them back.
