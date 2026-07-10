# Payslip Generator (Internal)

Internal payroll support system for generating and managing payslip data.

## Internal Use Only

This repository is for authorized internal users only.

- Do not publish this project as a public website.
- Do not expose employee data, payroll data, or environment credentials.
- Do not share `.env` values outside approved internal channels.

## Local Development

1. Install dependencies:

   npm install

2. Start the development server:

   npm run dev

## Build

1. Create a production build:

   npm run build

2. Preview the build locally:

   npm run preview

## Environment Configuration

Environment variables are defined in `.env.example`.

1. Copy `.env.example` to `.env`.
2. Configure required values for your internal environment:

   VITE_SUPABASE_URL=your_internal_supabase_url
   VITE_SUPABASE_ANON_KEY=your_internal_supabase_anon_key

## Deployment

Deploy only to approved internal infrastructure or private hosting targets.

- If CI/CD is used, ensure repository visibility, environment variables, and deployment targets remain private.
- Coordinate release and access control with your internal admin/IT team.