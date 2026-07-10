# Payslip-Generator

Dashboard shell scaffold based on the CHEDRO IV COS Payslip Generator design system.

## Local Development

1. Install dependencies:

	npm install

2. Start dev server:

	npm run dev

## Production Build

1. Build:

	npm run build

2. Preview build:

	npm run preview

## GitHub Pages Deployment

This project includes an Actions workflow at `.github/workflows/deploy-pages.yml` that builds and deploys to GitHub Pages on every push to `main`.

One-time repository setup:

1. Go to `Settings` > `Pages`.
2. Set `Source` to `GitHub Actions`.
3. Push to `main` and wait for the `Deploy to GitHub Pages` workflow to finish.

## Supabase Setup

Environment variables are defined in `.env.example`.

1. Copy `.env.example` to `.env`.
2. Keep the provided project URL:

	VITE_SUPABASE_URL=https://mfyxuhitvjsfebnqmqkr.supabase.co

3. Add your public anon key from Supabase:

	VITE_SUPABASE_ANON_KEY=your_anon_key_here