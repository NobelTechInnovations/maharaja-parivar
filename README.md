# Maharaja Parivaar

The verified alumni network of University Maharaja's College, Jaipur.

## Setup

```bash
npm install
cp .env.local.example .env.local   # then fill in MONGODB_URI and JWT_SECRET
npm run dev
```

Without a real `MONGODB_URI`, the app still runs — sign-up/login will fail
until a MongoDB Atlas cluster (or local `mongod`) is reachable at that URI.

Set `ADMIN_EMAILS` to the email(s) that should become admin + auto-verified
on first registration (founder accounts skip the review queue).

## What's built (Phase 1 + start of Phase 2)

- Design system: Tailwind v4 tokens in `app/globals.css`, `components/ui/*`
- MongoDB connection (`lib/db.js`) — serverless-safe pattern ported from
  the Booster project's `commerce-backend/src/config/database.js`
- `User` and `AlumniProfile` Mongoose models (`models/`)
- Email + password auth: register, login, logout, session (`lib/auth.js`,
  `app/api/auth/*`)
- Homepage, register, login, and a "pending verification" holding page

`lib/otp.js` is a working OTP generator that nothing calls yet — it's there
so switching from email+password to OTP-based verification later doesn't
mean starting from scratch. See its file comment for how it's meant to wire in.

## Not built yet

- Admin verification queue (approve/reject pending accounts — right now
  every non-founder account just sits in `pending` with no UI to review it)
- Alumni directory search/filters, public profile pages
- Connections, messaging, contact-detail sharing
- Community feed (posts/comments/likes)
- Groups, events

See the product plan for the full roadmap and data model.
