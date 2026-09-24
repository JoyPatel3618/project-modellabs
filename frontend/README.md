# ModelLabs Frontend

Built with React + TypeScript + Vite + Tailwind CSS v4.

## Requirements

- Node.js 18+
- ModelLabs backend running on `http://localhost:8000`

## Setup & Run

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5174](http://localhost:5174).

## Build for Production

```bash
npm run build
npm run preview
```

## Environment

`.env` already configured:

```
VITE_API_BASE_URL=http://localhost:8000
```

The Vite dev server proxies `/api` → `http://localhost:8000` to avoid CORS issues in development.

## Start the Backend

From the project root:

```bash
cd backend
uvicorn app.main:app --reload
```
