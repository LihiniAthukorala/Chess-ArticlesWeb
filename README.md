# Chess Chronicle

A modern chess article and community platform with a public magazine, author dashboard, and admin content approval workflow.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + MongoDB/Mongoose
- Auth: JWT + bcrypt
- Status workflow: draft, pending_review, changes_requested, published, rejected, archived

## Quick start

1. Install dependencies:
   npm install
2. Create a backend environment file:
   cp backend/.env.example backend/.env
3. Start the app:
   npm run dev
4. Seed admin and sample data:
   npm run seed
5. Open the frontend at http://localhost:5173 and the API at http://localhost:5001

## Admin login

The seed script creates an admin account using values from the backend environment file.

## Core workflow

- User registers and logs in
- User creates articles and saves drafts
- User submits article for review
- Admin reviews pending articles
- Admin approves, requests changes, or rejects
- Only published items are public

## API notes

Public routes only expose published article data. Draft/pending/rejected content is hidden from public endpoints.
