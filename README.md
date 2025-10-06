# EventDAO Monorepo

Frontend: Next.js (TypeScript)
Backend: Express (TypeScript)

## Prerequisites
- Node.js 20+
- npm 10+

## Project Structure
- frontend/ — Next.js app (App Router, TypeScript)
- backend/ — Express API (TypeScript)

## Setup
```bash
# Frontend
cd frontend
npm install
npm run dev
# http://localhost:3000

# Backend
cd ../backend
npm install
npm run dev
# http://localhost:4000/health
```

## Environment Variables
- frontend/.env.local
  - NEXT_PUBLIC_API_URL=http://localhost:4000
- backend/.env
  - PORT=4000
  - CORS_ORIGIN=http://localhost:3000

## Scripts
- `frontend`
  - dev: next dev -p 3000
  - build: next build
  - start: next start -p 3000
  - lint: next lint
- `backend`
  - dev: ts-node-dev --respawn --transpile-only src/index.ts
  - build: tsc -p tsconfig.json
  - start: node dist/index.js
  - lint: eslint . --ext .ts --max-warnings 0

## Notes
- Health endpoint: GET /health
- Import alias in frontend: `@/*`
