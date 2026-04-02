# 🎵 TikTok Coins Platform

A production-ready full-stack web application where users earn coins by following TikTok accounts and spend coins to grow their own TikTok following through verified ad campaigns.

---

## ✨ Features

### User Features
- 📧 **Email + Password signup** with 6-digit OTP email verification
- 🎁 **100 free coins** instantly on first verified signup
- 💰 **Earn 50 coins** per admin-approved follow
- 📢 **Create ad campaigns** — spend coins to gain real TikTok followers
- 📸 **Screenshot proof** submission for follow verification
- 📊 **Transaction history** and live coin balance tracking
- ✉️ **Contact support** form for issues or questions
- 🌑 **Dark theme** UI by default

### Admin Features
- 🔐 **Separate admin login** (hardened — timing-attack safe bcrypt, rate-limited)
- ✅ **Approve / Reject** follow screenshot proofs (idempotent — double-approval safe)
- 👥 **User management** — view, disable, enable accounts
- 📋 **Ad management** — view all campaigns and their progress
- 📩 **Contact messages** — read user support submissions
- 📈 **System analytics** — pending verifications, active ads, total users

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (Node.js runtime) |
| Database | Supabase (PostgreSQL) — free tier |
| Auth | Custom JWT (bcryptjs + jsonwebtoken) |
| Email | Nodemailer (SMTP / Gmail App Password) |
| File Storage | Supabase Storage (screenshots bucket) |
| Rate Limiting | In-memory rate limiter (single-instance) |
| Validation | Zod |

---

## 📁 Project Structure

```
social_app/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── auth/
│   │   ├── login/                # User login
│   │   ├── signup/               # User registration
│   │   └── verify/               # OTP email verification
│   ├── dashboard/
│   │   ├── page.tsx              # Dashboard overview
│   │   ├── ads/                  # User's campaigns + create ad
│   │   ├── follow/               # Browse & follow ads feed
│   │   ├── transactions/         # Coin transaction history
│   │   └── contact/              # Contact support form
│   ├── admin/
│   │   ├── login/                # Admin-only login
│   │   ├── page.tsx              # Admin overview / stats
│   │   ├── verifications/        # Approve/reject screenshot proofs
│   │   ├── users/                # User management table
│   │   ├── ads/                  # All campaigns table
│   │   └── contact/              # User support messages
│   └── api/                      # REST API routes
├── components/                   # Reusable UI components
├── lib/
│   ├── auth.ts                   # JWT sign/verify helpers
│   ├── email.ts                  # Nodemailer OTP email sender
│   ├── rate-limit.ts             # In-memory rate limiter
│   ├── supabase/server.ts        # Supabase service-role client
│   ├── types/database.ts         # TypeScript DB types
│   ├── utils.ts                  # Formatting helpers
│   └── validations.ts            # Zod schemas
├── supabase/migrations/
│   └── 001_initial.sql           # Full DB schema + RLS + Storage
├── middleware.ts                 # JWT-based route protection
├── .env.example                  # Environment variable template
└── README.md
```

---

## 🗄 Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Registered users — email, password hash, coin balance, verification status |
| `ads` | Ad campaigns — TikTok link, target followers, progress, status |
| `follows` | Follow submissions — screenshot URL, pending/approved/rejected |
| `transactions` | Immutable coin ledger — every credit/debit recorded |
| `admin_users` | Admin accounts — username + bcrypt password hash |
| `otp_codes` | Email OTP codes with expiry and used flag |
| `contact_messages` | User support messages |

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and fill in every value:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (**server-only — never expose**) |
| `JWT_SECRET` | Random string ≥ 32 chars — used to sign user + admin JWT tokens |
| `SMTP_HOST` | SMTP server host (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (e.g. `587`) |
| `SMTP_USER` | SMTP login email |
| `SMTP_PASS` | SMTP password or Gmail App Password |
| `SMTP_FROM` | Sender display name + email, e.g. `TikTok Coins <you@gmail.com>` |
| `NEXT_PUBLIC_APP_URL` | Full URL of your app (e.g. `http://localhost:3000`) |
| `DEBUG_API_KEY` | *(Optional)* Enables `GET /api/debug-db` for DB connectivity checks |
| `NEXT_PUBLIC_SHOW_REQUEST_ID` | *(Optional)* Set to `true` to show `requestId` in signup error UI |

---

## 🚀 Full Local Setup (Step by Step)

### Prerequisites
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Git** — [git-scm.com](https://git-scm.com)
- **Supabase account** — [supabase.com](https://supabase.com) (free tier)
- **Gmail account** — for sending OTP emails

---

### Step 1 — Clone & Install

```bash
git clone https://github.com/taqiraza1201/social_app.git
cd social_app
npm install
```

---

### Step 2 — Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com) → **New project**
2. Choose a name, strong database password, and your nearest region
3. Wait for the project to finish initialising (about 1–2 minutes)
4. Go to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY`

---

### Step 3 — Run Database Migration

1. In your Supabase dashboard, go to **SQL Editor → New query**
2. Open the file `supabase/migrations/001_initial.sql` from this repo
3. Copy the entire contents and paste into the SQL Editor
4. Click **Run** — all tables, indexes, RLS policies, and the storage bucket will be created

---

### Step 4 — Create the First Admin Account

In Supabase **SQL Editor**, run:

```sh
# First generate a bcrypt hash of your chosen admin password locally:
node -e "const b=require('bcryptjs'); b.hash('YourAdminPassword123', 12).then(console.log)"
```

Copy the output hash, then run this SQL in Supabase:

```sql
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2b$12$YOUR_GENERATED_HASH_HERE');
```

> ⚠️ Replace `YourAdminPassword123` with a strong password and paste the actual hash output.

---

### Step 5 — Set Up Gmail App Password (SMTP)

Gmail App Passwords are required if you have 2-Step Verification enabled:

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Under **"How you sign in to Google"**, click **2-Step Verification**
3. Scroll to the bottom → **App passwords**
4. Select app: **Mail**, device: **Other (custom name)** → type `TikTok Coins`
5. Click **Generate** — copy the 16-character password
6. Use this as `SMTP_PASS` in your `.env.local`

Your SMTP config will look like:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM=TikTok Coins <your@gmail.com>
```

---

### Step 6 — Configure `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

JWT_SECRET=replace_with_at_least_32_random_characters_here

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=TikTok Coins <your@gmail.com>

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate a strong `JWT_SECRET`:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Step 7 — Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

- **User app**: `/auth/signup` → sign up → verify OTP → dashboard
- **Admin panel**: `/admin/login` → username: `admin` → your chosen password

---

## ☁️ Production Deployment on Vercel (Free Tier)

### Prerequisites
- GitHub repo pushed with this code
- Supabase project set up (Steps 2–4 above)
- Gmail App Password ready

---

### Step 1 — Push to GitHub

```bash
git add .
git commit -m "production ready"
git push origin main
```

---

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository `taqiraza1201/social_app`
3. Framework preset will auto-detect **Next.js** ✓
4. Click **Deploy** — let it build once (it will fail on missing env vars, that's OK)

---

### Step 3 — Add Environment Variables in Vercel

In Vercel project → **Settings → Environment Variables**, add every variable:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Production, Preview, Development |
| `JWT_SECRET` | 32+ char random string | Production, Preview, Development |
| `SMTP_HOST` | `smtp.gmail.com` | Production, Preview, Development |
| `SMTP_PORT` | `587` | Production, Preview, Development |
| `SMTP_USER` | `your@gmail.com` | Production, Preview, Development |
| `SMTP_PASS` | Gmail App Password | Production, Preview, Development |
| `SMTP_FROM` | `TikTok Coins <your@gmail.com>` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production |

> 💡 After adding all variables, go to **Deployments → Redeploy** (click the three dots on the latest deployment).

---

### Step 4 — Verify Deployment

1. Visit `https://your-app.vercel.app`
2. Sign up with a real email → you should receive an OTP
3. Verify → dashboard loads with 100 coins ✓
4. Visit `https://your-app.vercel.app/admin/login` → log in with your admin credentials ✓

---

### Step 5 — Set Up Supabase Storage CORS (if needed)

If screenshot uploads fail in production:

1. Supabase Dashboard → **Storage → Policies** (verify `screenshots` bucket exists and is public)
2. Storage → **Configuration** → add your Vercel domain to allowed origins

---

## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcryptjs with 12 salt rounds |
| JWT tokens | httpOnly, secure, sameSite=lax cookies |
| OTP expiry | 10-minute expiry, single-use |
| Rate limiting | IP-based: login (10/15min), signup (10/hr), OTP verify (5/10min), admin login (5/15min), contact (3/hr) |
| Input validation | Zod schemas on all API routes |
| Authorization | JWT checked on every protected route and API |
| Admin timing attack prevention | bcrypt.compare always runs (even for unknown usernames) |
| Double-approval prevention | Admin verification uses atomic `UPDATE WHERE status='pending'` — returns 409 if already processed |
| Feed privacy | Already-followed ads are permanently removed from a user's feed |
| SQL injection | Prevented by Supabase client (parameterized queries) |

---

## 🪙 Coin Economy

| Action | Coins |
|--------|-------|
| New verified signup | +100 (welcome bonus) |
| Follow approved by admin | +50 |
| Create ad campaign | −(target_followers × 2) |

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | None | Register new user + send OTP |
| POST | `/api/auth/verify-otp` | None | Verify OTP → issue JWT |
| POST | `/api/auth/login` | None | Login with email + password |
| POST | `/api/auth/logout` | None | Clear user cookie |
| GET | `/api/ads` | User | List active ads (excluding already-followed) |
| POST | `/api/ads` | User | Create new ad campaign |
| DELETE | `/api/ads/[id]` | User | Remove own ad |
| GET | `/api/follows` | User | List user's follow submissions |
| POST | `/api/follows` | User | Submit follow proof + screenshot |
| POST | `/api/upload` | User | Upload screenshot image to Supabase Storage |
| GET | `/api/user/coins` | User | Get current coin balance |
| GET | `/api/user/transactions` | User | Get coin transaction history |
| POST | `/api/contact` | User | Send a support message |
| POST | `/api/admin/login` | None | Admin login |
| POST | `/api/admin/logout` | Admin | Clear admin cookie |
| GET | `/api/admin/verifications` | Admin | List follow submissions by status |
| POST | `/api/admin/verifications` | Admin | Approve or reject a submission |
| GET | `/api/admin/users` | Admin | List all users |
| PATCH | `/api/admin/users` | Admin | Enable / disable a user |
| GET | `/api/admin/ads` | Admin | List all ad campaigns |
| GET | `/api/contact` | Admin | Read all contact messages |
| GET | `/api/debug-db` | Debug key | DB connectivity check (requires `DEBUG_API_KEY`) |

---

## 🐛 Troubleshooting

### OTP email not received
- Check spam/junk folder
- Confirm `SMTP_*` variables are set correctly in Vercel
- Use the **Resend** button on the verification page
- Test SMTP locally: `node -e "require('./lib/email').sendOTPEmail('your@email.com','123456')"`

### `CONFIG_ERROR` on signup
- `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing in your environment
- In Vercel: Settings → Environment Variables → verify all 3 Supabase vars are set
- Redeploy after adding variables

### Screenshot upload fails
- Ensure the `screenshots` storage bucket exists in Supabase (created by the migration SQL)
- Verify the bucket is set to **public**
- Check that `SUPABASE_SERVICE_ROLE_KEY` is correctly set

### Admin login returns "Invalid credentials"
- Re-generate the bcrypt hash and re-insert into `admin_users`
- Ensure you copy the **full** hash string (starts with `$2b$12$`)
- Username must match exactly (case-sensitive)

### Coins not credited after follow approval
- The admin must approve the follow in `/admin/verifications`
- Coins are only credited after **admin approval**, not on submission
- Check the transaction history at `/dashboard/transactions`

### Build error: "Cannot find module"
```bash
rm -rf node_modules .next
npm install
npm run build
```

---

## 🧑‍💻 Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build (must pass before deploy)
npm run start    # Start production server locally
npm run lint     # Run ESLint — must show zero warnings/errors
```

---

## 📝 License

MIT — free to use, modify, and deploy.


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
