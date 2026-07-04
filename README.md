# Payslip-Generator

Dashboard shell scaffold based on the Travel Authority Archive design system.

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