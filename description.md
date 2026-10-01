# Saviskar 2026 — Site Description & Hosting Evaluation Matrix

> **System:** Saviskar 2026 (*Aevorian Reverie*)  
> **Repository:** `Saviskar26`  
> **Site URL:** [https://saviskar.co.in](https://saviskar.co.in)  
> **Target Event Date:** October 27–28, 2026  
> **Anticipated Scale:** 35,000+ university attendees, high-burst payment traffic, 100+ concurrent on-ground gate scanners.

---

## 1. Executive Summary

Saviskar 2026 is the production web and ticketing platform for North India's premier techno-cultural festival hosted at CGC University, Mohali.

The platform provides:
- **Interactive Public Fest Experience:** 3D WebGL Dome Gallery, dynamic schedules, event catalogs, artist star night lineups, and sponsor showcases.
- **Transactional Ticketing & Pass Engine:** OTP-authenticated user registration, checkout via PayU payment gateway, transactional confirmation emails via Resend, and automated PDF pass generation with dynamic QR codes.
- **Gate Control & Admin Operations:** High-concurrency QR code scanner stations (`/admin/scanner`) with audio-visual chime feedback, attendee check-in management, real-time audit logging, and manual payment recovery flows (`/payment/resume`).

---

## 2. Technical Stack & Architecture

| Layer | Technology | Specification / Version |
| :--- | :--- | :--- |
| **Framework** | Next.js | `v16.3.4` (App Router, Server & Client Components) |
| **Runtime** | React / Node.js | React `19.2.4`, Node.js `20.x` or `22.x` (LTS) |
| **Language** | TypeScript | `v5.x` (Strict type checking) |
| **Styling** | Tailwind CSS | `v4.x` via `@tailwindcss/postcss` |
| **Database & Auth** | Supabase PostgreSQL | PostgreSQL 15+ with RLS, connection pooler (port 6543), `@supabase/ssr` `0.12.3`, `@supabase/supabase-js` `2.110.8` |
| **Payment Gateway** | PayU India | Hosted checkout, signature verification, server-side callback/webhook idempotent sync |
| **Email Service** | Resend | `resend` `v6.18.0` with DKIM/SPF domain verification |
| **Ticketing & Passes** | `pdf-lib` + `qrcode` | In-memory PDF delegate badge compilation with verifiable QR payload |
| **Gate Scanner** | `html5-qrcode` | Hardware camera stream integration requiring `camera=(self)` permission |
| **3D & Animation** | Three.js + Motion + Lenis | `three` `0.186.0`, `motion` `12.43.0`, `lenis` `1.3.26` |
| **Monitoring & Telemetry**| Sentry & Internal Probe | Optional Sentry DSN, live health probe at `/api/health` |

---

## 3. Hosting Paradigm Compatibility

### ⚠️ Critical Architecture Requirement: Full-Stack Node.js / Serverless SSR
This application **CANNOT** be deployed on static-only hosting (such as GitHub Pages, GitLab Pages, or Cloudflare Pages static tier with `output: 'export'`). 

### Why Static Export is Incompatible:
1. **Dynamic Backend API Routes:**
   - `/api/health`: System health and dependency probe.
   - `/api/payments/*`: Order initiation, PayU signature verification, webhook processing.
   - `/api/register/*`: OTP dispatch and validation.
   - `/api/admin/*`: Scanner access, delegate lookup, and gate verification.
2. **Server-Side Authentication & Session Cookies:**
   - Admin gate scanner authentication via HTTP-only session cookies.
   - Supabase SSR cookie storage mechanism.
3. **In-Memory Dynamic Document Generation:**
   - Dynamic PDF generation via `pdf-lib` and QR rendering.
4. **Dynamic Image Optimization:**
   - Next.js Image Optimization service configured for AVIF/WebP formats and external remote patterns (YouTube, Google Drive).

---

## 4. Hosting Resource & Infrastructure Requirements

| Parameter | Minimum Requirement | Recommended Specification | Notes |
| :--- | :--- | :--- | :--- |
| **Node.js Engine** | `>= 20.9.0` | `20.x LTS` or `22.x LTS` | Next.js 16 requirement |
| **Build Memory** | 2 GB RAM | 4 GB RAM | Required for Three.js bundle optimization and TypeScript compilation |
| **Runtime Memory** | 512 MB | 1024 MB | Memory required during concurrent PDF badge rendering (`pdf-lib`) |
| **Function / Request Timeout** | 15 seconds | 30 seconds | Accommodates PayU payment settlement and Resend email dispatches |
| **Max Request Body** | 4.5 MB | 10 MB | Accommodates attendee registration payloads and logs |
| **Hardware Access** | HTTPS Required | Strict SSL + TLS 1.3 | Camera access (`navigator.mediaDevices`) for QR scanner strictly requires HTTPS |

---

## 5. Security Headers & Network Policies (Configured in `next.config.ts`)

Any hosting provider or reverse proxy (Nginx, Cloudflare, Traefik) must preserve the following security headers:

- **Permissions-Policy:** `camera=(self), microphone=(), geolocation=(), payment=*` (Required for `/admin/scanner` QR camera stream and checkout).
- **Strict-Transport-Security (HSTS):** `max-age=63072000; includeSubDomains; preload`
- **X-Frame-Options:** `DENY`
- **Content-Security-Policy (CSP):**
  - Scripts: `'self' 'unsafe-inline' 'unsafe-eval'`
  - Styles: `'self' 'unsafe-inline' https://fonts.googleapis.com`
  - Fonts: `'self' https://fonts.gstatic.com data:`
  - Images: `'self' data: blob: https://*.supabase.co https://img.youtube.com https://i.ytimg.com https://lh3.googleusercontent.com https://drive.google.com`
  - Connect / Sockets: `'self' https://*.supabase.co wss://*.supabase.co https://*.resend.com`
  - Frames: `'self' https://www.youtube.com https://www.youtube-nocookie.com`
  - Workers: `'self' blob:`

---

## 6. Environment Variables Reference

Before deploying to any hosting platform, configure the following environment variables:

### Public / Client-Side Variables (`NEXT_PUBLIC_*`)
```env
NEXT_PUBLIC_SITE_URL="https://saviskar.co.in"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
NEXT_PUBLIC_MAIN_GALLERY_GDRIVE_URL="https://drive.google.com/..."
NEXT_PUBLIC_GLIMPSE_GALLERY_GDRIVE_URL="https://drive.google.com/..."
# Optional Sentry Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://...ingest.sentry.io/..."
```

### Server-Only Secrets (Never expose to client bundles)
```env
# Supabase Elevated Service Key
SUPABASE_SECRET_KEY="sb_secret_..."

# Resend Transactional Email
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="Saviskar 2026 <noreply@saviskar.co.in>"

# PayU India Payment Gateway
PAYMENT_GATEWAY="payu"
PAYU_ENVIRONMENT="production"      # or "test"
PAYU_KEY="your_payu_key"
PAYU_SALT="your_payu_salt"

# Admin & Session Authentication
ADMIN_SESSION_MAX_AGE_SECONDS=28800
SESSION_SECRET="your_32_byte_hex_session_secret"
PRIMARY_ADMIN_EMAIL="admin@saviskar.co.in"
PRIMARY_ADMIN_USER_ID="usr_..."
```

---

## 7. Recommended Hosting Providers Comparison

| Provider | Suitability | Tier / Plan Recommendation | Key Advantages |
| :--- | :--- | :--- | :--- |
| **Vercel** *(Primary Recommendation)* | ⭐⭐⭐⭐⭐ **Native (10/10)** | Pro Plan (during fest month) | Zero-configuration Next.js 16 App Router support, global Edge caching, automatic image optimization, instant rollbacks. |
| **Firebase App Hosting** | ⭐⭐⭐⭐ **High (8.5/10)** | Cloud Run with Blaze Plan | Full App Router SSR support backed by GCP Cloud Run serverless containers. |
| **AWS (ECS / App Runner / Amplify)** | ⭐⭐⭐⭐ **High (8/10)** | Docker Container (Fargate / App Runner) | Dedicated compute, unlimited execution duration, direct connection to custom VPC and database pooler. |
| **Railway / Render** | ⭐⭐⭐⭐ **High (8/10)** | Pro / Standard Plan | Simple Docker or Node deployment (`npm run build` && `npm run start`), built-in health check probes. |
| **Self-Hosted VPS / Nginx / Docker** | ⭐⭐⭐⭐ **High (8/10)** | Ubuntu 24.04 (4 vCPU / 8 GB RAM) | PM2 / Dockerized `next start` behind Nginx reverse proxy with Certbot SSL. |
| **GitHub Pages / Static S3 / Cloudflare Pages Static** | ❌ **Incompatible** | N/A | Does not support dynamic API routes, SSR, cookies, or PDF compilation. |

---

## 8. Build & Verification Commands

```bash
# 1. Install exact dependencies
npm ci

# 2. Type-checking validation
npx tsc --noEmit

# 3. Unit & Integration test suite (251 tests)
npm run test

# 4. Production build compilation
npm run build

# 5. Production start command
npm run start
```

---

## 9. Live Health Probe & Verification Endpoints

Once deployed, verify the deployment health:

- **System Health Probe:**  
  `GET https://saviskar.co.in/api/health`  
  *Expected:* HTTP `200 OK` with status `healthy` and latency metrics.
- **PayU Webhook Endpoint:**  
  `POST https://saviskar.co.in/api/payments/webhook`  
  *Expected:* HTTP `400` or `401` on unauthenticated ping, `200` on valid HMAC signature.
- **Gate Scanner Interface:**  
  `GET https://saviskar.co.in/admin/scanner`  
  *Expected:* Admin authentication redirect or scanner viewport.
- **Payment Resume Portal:**  
  `GET https://saviskar.co.in/payment/resume`  
  *Expected:* Unfinished payment resolution form.
