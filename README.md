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
