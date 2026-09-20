# Saviskar 2026 — *Aevorian Reverie*

Official web platform for North India's premier techno-cultural festival at CGC University, Mohali (October 27–28, 2026).

Built with **Next.js 16.3.4 (App Router)**, **React 19.2.4**, **Supabase PostgreSQL**, **Tailwind CSS v4**, **Three.js / WebGL**, **Motion**, **Resend**, and **Razorpay**.

---

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run automated tests (18 test suites, 251 tests)
npm run test

# Run ESLint validation (0 errors, 0 warnings)
npm run lint

# Run TypeScript typecheck
npx tsc --noEmit

# Build production bundle
npm run build
```

---

## Documentation Links

- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Full production operations runbook, environment variable classifications, Supabase migrations, webhook setup, and emergency rollback procedures.
- **[audit-resolved.md](./audit-resolved.md)**: Comprehensive verification report detailing the resolution of all 17 audit findings (`P0-01` through `P3-17`).

---

## Gate Day Operations Checklist (October 27–28)

### T-48 Hours (Pre-Fest Readiness)
- [ ] Verify Supabase database compute allocation is upgraded for peak traffic (minimum 4 vCPU / 8 GB RAM).
- [ ] Confirm connection pooler is in Transaction mode (`port 6543`).
- [ ] Verify Resend domain status reads **Verified** for DKIM, SPF, and DMARC on `saviskar.co.in`.
- [ ] Confirm Razorpay live API credentials and webhook secret are configured in production environment variables.
- [ ] Run automated health check probe: `curl -I https://saviskar.co.in/api/health` (must return `200 OK`).

### T-2 Hours (Gate Setup)
- [ ] Distribute gate check-in URL (`https://saviskar.co.in/admin/scanner`) to authorized event volunteers.
- [ ] Ensure volunteer admin accounts have active sessions and MFA setup.
- [ ] Test scanner with test pass (green valid chime, red invalid buzzer, vibration feedback).
- [ ] Place printed QR signs directing attendees with unfinished payments to `https://saviskar.co.in/payment/resume`.

### Live Festival Hours
- [ ] Monitor external ping on `/api/health` every 60 seconds.
- [ ] Check Sentry error stream for any spikes in payment or registration failures.
- [ ] Monitor Supabase database CPU and connection pool usage from dashboard.
- [ ] Review `/admin/logs` for suspicious admin activities or repeated gate check-in collisions.
