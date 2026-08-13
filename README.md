# HRIS — Frontend-Only Edition

A self-contained Human Resource Information System — **no backend, no server,
no database to set up.** Built with React 18 + TypeScript + Vite + Tailwind
CSS, in the same maroon / black / gold / white theme.

All data lives in your browser's `localStorage` via a small mock-database
module (`src/lib/db.ts`) that stands in for a real API. It's seeded with
demo employees, departments, and leave requests on first load, and
everything you add (new employees, departments, leave requests, clock
in/out) persists across refreshes until you clear site data.

## Modules included

- Login (client-side only — see demo accounts below)
- Dashboard (headcount, pending leave, today's attendance snapshot)
- Employee management (list, search, add)
- Department management (list, add, live headcounts)
- Leave requests (submit, approve/reject)
- Attendance (clock in/out, today's log)

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Demo accounts

Any password works as long as it's literally `password` (this is a demo —
there's no real auth, just a stand-in so the login screen behaves like a
real app):

```
admin@hris.test       (admin)
jamie.chen@hris.test  (employee)
```

## How the "backend" works

`src/lib/db.ts` is the entire data layer. It:

- Seeds demo data into `localStorage` the first time the app loads
- Exposes plain functions (`listEmployees`, `createEmployee`,
  `approveLeaveRequest`, `clockIn`, etc.) that the pages call directly —
  no `fetch`/`axios`, no network tab activity
- Resolves relationships (employee → department, leave request → employee,
  etc.) the same way the API version did, so the page components are
  nearly identical to the full-stack build

To reset the demo data at any point, open your browser console and run:

```js
localStorage.removeItem('hris_demo_db_v1');
localStorage.removeItem('hris_session_user_id');
location.reload();
```

## Project structure

```
src/
├── lib/db.ts          the mock "database" (seed data + CRUD)
├── types/              shared TypeScript interfaces
├── context/             AuthContext (session state)
├── components/         Layout, ProtectedRoute, shared UI (Button, Card, Modal…)
└── pages/                Dashboard, Employees, Departments, LeaveRequests, Attendance
```

## Swapping in a real backend later

Because all the data access is centralized in `src/lib/db.ts`, moving to a
real API later mostly means rewriting that one file to call `fetch`/`axios`
instead of `localStorage`, and making its functions `async`. The pages
themselves would need only minor changes (adding `await`/loading states)
since they already treat `db.*` as the single source of truth.
