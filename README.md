# Brahim Investment Group - Fleet & Dispatch Management System

A comprehensive web application designed to streamline vehicle dispatching, trip logging, fuel tracking, and maintenance management for the Brahim Investment Group fleet.

## Features
- **Dispatch Management:** Create, track, and manage active and completed vehicle dispatches.
- **Trip Logging & Safety:** Log trip routes, distance traveled, passengers, and safety metrics (speeding, idling, etc.).
- **Fuel Tracking:** Record and monitor fuel transactions, supplier details, and generate detailed fuel consumption reports.
- **Maintenance & Corporate Billing:** Manage vehicle maintenance records and handle corporate account billing.
- **Data Export & Reporting:** Download comprehensive PDF reports for dispatches and fuel collections.

## Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend/Database:** Supabase (PostgreSQL)
- **PDF Generation:** jsPDF, jspdf-autotable

## Run Locally

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set your environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

**Developed By DreamDay Technology for Brahim Investment Group**
