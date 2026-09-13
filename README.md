# HRIS Frontend

A Human Resource Information System frontend built with React 18, TypeScript,
Vite, and Tailwind CSS. It communicates with the HRIS API through the service
layer in `src/services`.

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

## Project structure

```
docs/                   project documentation
├── requirements/
├── architecture/
├── database/
├── diagrams/
├── api/
└── user-manual/
src/
├── assets/             application images, icons, and fonts
├── components/         reusable UI and route-guard components
├── context/            shared React context, including authentication
├── features/           feature-specific modules
├── hooks/              reusable React hooks
├── layouts/             page-shell components
├── pages/               route-level Admin, HR, Staff, and Login pages
├── services/            HTTP/API client modules
├── types/               shared TypeScript interfaces
└── utils/               framework-independent utilities
tests/
├── unit/
├── integration/
└── system/
```

The `src/utils/demoDb.ts` file is retained as an unused local-data utility for
development reference. Production API requests use `src/services/api.ts`.
