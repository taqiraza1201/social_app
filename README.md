# 🎵 TikTok Coins Platform

A full-stack web application that allows users to earn coins by completing follow tasks and managing TikTok growth campaigns.

## Features

### User Features
- 📧 **Email/Password signup** with 6-digit OTP email verification
- 🎁 **100 free coins** on account creation
- 💰 **Earn 50 coins** per verified follow
- 📢 **Create ad campaigns** — spend coins to get real TikTok followers
- 📸 **Screenshot proof** submission for follow verification
- 📊 **Transaction history** and coin balance tracking
- 🌑 **Dark theme** UI

### Admin Features
- 🔐 **Separate admin login** with bcrypt-hashed password
- ✅ **Approve/Reject** follow screenshot proofs
- 👥 **User management** — view, disable, enable accounts
- 📋 **Ad management** — view and remove campaigns
- 📈 **System analytics** — pending verifications, active ads, total users

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (Node.js runtime) |
| Database | Supabase (PostgreSQL) |
| Auth | Custom JWT (bcryptjs + jsonwebtoken) |
| Email | Nodemailer (SMTP) |
| File Storage | Supabase Storage |

## Project Structure

```
social_app/
├── app/
│   ├── page.tsx              # Landing page
│   ├── auth/
│   │   ├── login/            # User login
│   │   ├── signup/           # User registration
│   │   └── verify/           # OTP verification
│   ├── dashboard/
│   │   ├── page.tsx          # Dashboard overview
│   │   ├── ads/              # User's campaigns
│   │   ├── follow/           # Browse & follow ads
│   │   └── transactions/     # Coin history
│   ├── admin/
│   │   ├── login/            # Admin login
│   │   ├── page.tsx          # Admin overview
│   │   ├── verifications/    # Screenshot review
│   │   ├── users/            # User management
│   │   └── ads/              # Ad management
│   └── api/                  # REST API routes
├── components/               # Reusable UI components
├── lib/                      # Auth, email, Supabase helpers
├── supabase/migrations/      # Database schema SQL
└── middleware.ts             # Route protection
```

## Database Schema

- **users** — email, password_hash, coins, is_verified, is_disabled
- **ads** — user_id, name, tiktok_url, target_followers, current_followers, cost, status
- **follows** — user_id, ad_id, screenshot_url, status (pending/approved/rejected)
- **transactions** — user_id, type (credit/debit), amount, reason
- **admin_users** — username, password_hash
- **otp_codes** — email, code, expires_at, used

## Setup & Deployment

### Prerequisites
- Node.js 18+
- Supabase project (free tier at [supabase.com](https://supabase.com))
- SMTP email credentials (e.g. Gmail with App Password)

### 1. Clone & Install

```bash
git clone https://github.com/taqiraza1201/social_app
cd social_app
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-32-char-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-app-password
SMTP_FROM="TikTok Coins <your@email.com>"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Database Migrations

In the Supabase SQL Editor, run the file:
```
supabase/migrations/001_initial.sql
```

### 4. Create Admin Account

In the Supabase SQL Editor, generate a bcrypt hash and insert admin:

```bash
# Generate hash locally:
node -e "const b=require('bcryptjs'); b.hash('your-admin-password', 12).then(console.log)"
```

```sql
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2b$12$your-generated-hash-here');
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 6. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard or:
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... (add all env vars)
```

## Signup Troubleshooting

### Required environment variables (Railway / Vercel)

| Variable | Where to set | Notes |
|----------|-------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Railway / Vercel env | Public — safe for frontend |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Railway / Vercel env | Public — safe for frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | Railway / Vercel env | **Server-only** — never expose to browser |
| `JWT_SECRET` | Railway / Vercel env | Min. 32 random characters |
| `DEBUG_API_KEY` | Railway / Vercel env | Optional — enables `/api/debug-db` |
| `NEXT_PUBLIC_SHOW_REQUEST_ID` | Railway / Vercel env | Optional — set to `'true'` to show `requestId` in signup error UI |

> **Railway note**: Runtime secrets are **not** available during `npm run build`.  
> The Supabase client uses a lazy factory pattern so env-var checks happen at request time, not build time.

### Using the `/api/debug-db` diagnostic endpoint

The endpoint requires `DEBUG_API_KEY` to be set in your environment.  
If that variable is missing it returns **503** with a clear config-error message (not 404), so you know the route is present but unconfigured.

```bash
# Check connectivity and DB access
curl -H "x-debug-key: <your-DEBUG_API_KEY>" https://your-app.vercel.app/api/debug-db

# Without the header (or wrong value) → 401 Unauthorized
# Without DEBUG_API_KEY env var set   → 503 CONFIG_ERROR
```

Example **pass** response:
```json
{
  "timestamp": "2024-01-15T10:00:00.000Z",
  "checks": {
    "env_supabase_url": { "pass": true, "value_present": true },
    "env_service_role_key": { "pass": true, "value_present": true },
    "db_query": { "pass": true, "rows_returned": 0 }
  },
  "overall": "pass"
}
```

Example **fail** response (missing env var):
```json
{
  "checks": {
    "env_supabase_url": { "pass": false, "value_present": false },
    "env_service_role_key": { "pass": false, "value_present": false },
    "db_query": { "pass": false, "skipped": true, "reason": "Missing required environment variables" }
  },
  "overall": "fail"
}
```

### Common `errorType` values from `/api/auth/signup`

| `errorType` | Meaning | Fix |
|-------------|---------|-----|
| `CONFIG_ERROR` | Missing `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` | Add env var to Railway / Vercel |
| `DB_CONNECT_ERROR` | Cannot reach Supabase (network/DNS failure) | Check Supabase project status and URL; verify env vars are correct |
| `DB_QUERY_ERROR` | Supabase reachable but query failed | Check RLS policies on `public.users`; run `/api/debug-db` for details |
| `EMAIL_EXISTS` | Account already registered | Use login instead |
| `VALIDATION_ERROR` | Invalid email or password format | Check input requirements |

All error responses include a `requestId` field. Match this against your Railway / Vercel log stream to find the structured JSON log line for full Supabase error details (`code`, `message`, `details`, `hint`).

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/ads` | List active ads |
| POST | `/api/ads` | Create new ad |
| DELETE | `/api/ads/[id]` | Delete own ad |
| GET | `/api/follows` | List user's follows |
| POST | `/api/follows` | Submit follow proof |
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/verifications` | List pending verifications |
| POST | `/api/admin/verifications` | Approve/reject follow |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/ads` | List all ads |
| GET | `/api/user/coins` | Get coin balance |
| GET | `/api/user/transactions` | Get transaction history |

## Coin Economy

| Action | Coins |
|--------|-------|
| Sign up | +100 |
| Follow verified | +50 |
| Create ad (per target follower) | -2 |

## Security

- Passwords hashed with **bcryptjs** (12 rounds)
- JWT tokens stored in **httpOnly cookies** (7-day expiry for users, 1-day for admin)
- OTP codes expire after **10 minutes**
- Route protection via **Next.js middleware**
- Input validation with **Zod** schemas
- Supabase **Row Level Security** enabled

## License

MIT
