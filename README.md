# DevHub web

The web client for [DevHub](https://github.com/ahmadi-amirhosein/devhub), a marketplace for specialized programming work. Clients describe a project, get an AI-structured spec, and review proposals. Developers keep a profile and send proposals.

Built with Next.js 16 (App Router), React 19 and TypeScript, with plain CSS and no UI library.

> **Status:** working prototype and portfolio project. It needs the DevHub API from the [backend repository](https://github.com/ahmadi-amirhosein/devhub) running.

## Pages

| Route | Rendering | Purpose |
|---|---|---|
| `/` | server | open projects, `?category=` filter |
| `/projects/[id]` | server | project page with the AI spec; developers can send a proposal here |
| `/login` | client | log in or register as client or developer |
| `/dashboard` | client | clients: create, analyze, publish, review and accept proposals. Developers: profile and my proposals |

The public pages are rendered on the server, so search engines can index projects and the page metadata is generated per project. The dashboard talks to the API from the browser.

## Run it

Requirements: Node.js 20.9 or newer, and the backend running on `http://localhost:8080`.

```powershell
npm install
copy .env.local.example .env.local     # NEXT_PUBLIC_API_URL, default http://localhost:8080
npm run dev                            # http://localhost:3000
```

The backend's `CORS_ORIGIN` must match the origin of this app (default `http://localhost:3000`).

## Structure

```
src/app            routes (App Router)
src/components     NavBar, ProjectCard, ClientDashboard, DeveloperDashboard, ProposalForm
src/lib/api.ts     typed fetch wrapper and API types
src/lib/auth.tsx   auth context (token and role)
```

## Notes

- **Next.js 16 and async params.** `params` and `searchParams` are promises in the App Router and are awaited in the server pages.
- **Token storage is a known limitation.** The JWT is kept in `localStorage`, which any injected script could read. For production it should move to an httpOnly cookie set by the API.
- **No tests yet.**

## Roadmap

- httpOnly cookie authentication.
- AI-suggested developers for each project, and suggested projects for developers (needs the backend matching work).
- Messaging and milestones.
- Screenshots and a short demo recording in this README.

## License

MIT
