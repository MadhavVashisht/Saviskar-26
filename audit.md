# Production Codebase Audit Report: Saviskar 2026

**Target Codebase:** `Saviskar-26` (Next.js 16.3.4, React 19.2.4, Supabase, Tailwind CSS v4, Motion, Three.js)  
**Audit Date:** September 20, 2026  
**Auditor Mode:** Read-only ground-truth verification  
**Traffic Horizon:** Peak load on October 27–28, 2026 (25,000+ attendees)

---

## 1. Project Context & Executive Summary

Saviskar 2026 (*Aevorian Reverie*) is an App Router Next.js 16 web platform built for North India's premier techno-cultural university festival at CGC University, Mohali. The application integrates:
- **Frontend Presentation:** Three.js / WebGL 3D amphitheater scroll engine, Lenis smooth scrolling, Motion (Framer Motion v12), and Tailwind CSS v4.
- **Backend & Persistence:** Supabase PostgreSQL with Row Level Security (RLS), custom PL/pgSQL atomic registration RPCs (`register_participant_events`), and Next.js Route Handlers.
- **Communications & Logistics:** Resend email SDK with CID inline QR code attachments, and HTML5 QR scanner for on-ground gate check-in.
- **Payments:** Multi-event order aggregation with partial Razorpay integration.

This audit establishes empirical ground truth across build systems, security boundaries, runtime memory usage, and registration reliability to guarantee stability during the festival traffic spike on October 27–28.

---

## 2. Phase 0 — Build & Tooling Ground Truth

Execution results collected directly from the repository environment prior to opinion or reporting:

| Command | Exit Code | Genuine Counts / Output Summary | Notable Errors / Failures |
| :--- | :---: | :--- | :--- |
| `npx tsc --noEmit` | `0` | **0 errors, 0 warnings** | TypeScript passes cleanly (type assertions like `as "violet" \| "cyan" \| "emerald"` masked runtime errors). |
| `npm run lint` (`eslint`) | `1` | **145 problems (102 errors, 43 warnings)** | `87` `@typescript-eslint/no-explicit-any`, `8` `react-hooks/set-state-in-effect`, `8` `react-hooks/exhaustive-deps`, `8` `@next/next/no-img-element`, `2` `@next/next/no-html-link-for-pages`, `2` `react/jsx-no-comment-textnodes`, `2` `react/no-unescaped-entities`, `1` `prefer-const`, `27` `@typescript-eslint/no-unused-vars`. |
| `npm run build` (`next build`) | `1` | **Failed at static prerendering stage** | **Fatal Prerender Crash:** `TypeError: Cannot read properties of undefined (reading 'signeeRole')` at `components/team/DeskEditorialSpread.tsx:107:96` during static export of `/legacy`. Build aborted with code 1. |
| `npm audit --omit=dev` | `0` | **found 0 vulnerabilities** | Clean production dependency tree. |

---

## 3. Phase 1 — Comprehensive Area Audit

### 1. Correctness & Bugs
- **Prerender Crash on `/legacy`:** In [DeskEditorialSpread.tsx:69](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/team/DeskEditorialSpread.tsx#L69), `accentTokens` is derived by indexing an object containing only `violet`, `cyan`, and `emerald`. In [LegacyView.tsx:26,90,189](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/legacy/LegacyView.tsx#L189), dignitaries define `accent: "amber" as const`. Although cast as `as "violet" | "cyan" | "emerald"`, at runtime `accentColor` is `"amber"`. `accentTokens` becomes `undefined`. Accessing `accentTokens.signeeRole` on line 107 throws an unhandled `TypeError`, failing `npm run build`.
- **Synchronous `setState` in Effects:** 8 instances flagged by React 19 rules (e.g. `SmoothScrollProvider.tsx:75` setting Lenis instance, `Preloader.tsx:148` setting asset count, `About.tsx:22` resetting counter).

### 2. App Router Usage
- **Misplaced `"use client"` Directives:** `/events/[category]` and `/schedule` are client components with client-side `useEffect` data-fetching waterfalls. They lack `generateMetadata` or static metadata exports.
- **Client Client Used in Server Component:** [app/events/[category]/[event]/page.tsx:13](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/app/events/%5Bcategory%5D/%5Bevent%5D/page.tsx#L13) imports the browser Supabase instance (`import { supabase } from "@/lib/supabase"`) instead of `createClient` from `@/lib/supabase/server`. It lacks ISR `revalidate` and `generateStaticParams`.
- **Loading and Error Boundary Gaps:** The entire repository has only one `loading.tsx` (`app/admin/loading.tsx`) and zero route-level `error.tsx` files. Any component throw bubbles to `global-error.tsx`.

### 3. Supabase & Registration Flow
- **Premature Entry QR Dispatch:** In [app/api/register/route.ts:1042-1135](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/app/api/register/route.ts#L1042-L1135), confirmation emails containing active Entry QR codes are sent immediately via Next.js `after()`, even when `eventMeta.payment_type === 'paid'` and no payment has been made.
- **Database Schema Drift:** `supabase/schema.sql` does not include `registration_otps` (introduced in migration `20260919060000_create_registration_otps.sql`) and still contains `GRANT ALL ON FUNCTION register_participant_events TO anon`.
- **In-Memory Rate Limiting:** `lib/rate-limit.ts` stores state in a local `Map`. On Vercel serverless multi-container instances, rate limits are not shared across lambdas.

### 4. Security
- **No Secret Leaks:** Service role keys (`SUPABASE_SECRET_KEY`) are confined to server-side Route Handlers and never leaked to `NEXT_PUBLIC_` bundles.
- **Admin Authentication:** All `/api/admin/*` routes enforce `requireAdmin()` or `requireMasterAdmin()`. Master admin MFA (AAL2) is enforced.
- **Input Sanitization:** Email escaping (`escapeHtml`) is implemented across email templates in `lib/send-registration-email.ts` and `lib/auth/send-otp-email.ts`.
- **Admin Layout Indexing:** `app/admin/layout.tsx` lacks `robots: { index: false, follow: false }` metadata.

### 5. Animation & Rendering Performance
- **Global Prototype Pollution:** In [ScrollEngine3D.tsx:161-189](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/ui/ScrollEngine3D.tsx#L161-L189), `WebGL2RenderingContext.prototype.texImage3D` and `texSubImage3D` are permanently mutated globally on `window`.
- **Missing WebGL Fallback:** In [ScrollEngine3D.tsx:193](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/ui/ScrollEngine3D.tsx#L193), `new THREE.WebGLRenderer` is called without a `try/catch` guard. If WebGL is unavailable or fails, an unhandled exception crashes the page.
- **Scroll Hijacking vs Motion:** Lenis smooth scrolling operates with `autoRaf: true` and pauses on body overflow lock.

### 6. Frame-Sequence & Asset Weight Specifically
- **Total Asset Weight:** `public/images/` holds **201 MB**, `public/gallery/` holds **200 MB**, and `public/PreLoader/` holds **9.1 MB** (Total: **443 MB**).
- **Home Route Transfer:** Visiting `/` triggers downloading:
  - 5x 8K background textures in `ScrollEngine3D`: **33.6 MB**
  - 6 critical preload images in `Preloader`: **39.1 MB**
  - 175 dome gallery tiles in `DomeGallery`: **~50 MB**
  - Total landing payload exceeds **120 MB**.
- **GPU VRAM Allocation:** 5 uncompressed 8K textures in WebGL require `7680 * 4320 * 4 * 1.33` = **~175 MB per texture** with mipmaps, totaling **~870 MB VRAM**. On mid-range Android devices (3–4 GB RAM), this triggers WebGL context loss (`webglcontextlost`) or mobile OS OOM browser kills.

### 7. Bundle & Load Performance
- **Hard Page Navigation:** Hero CTAs (`/events`, `/register`) in [Hero.tsx:129,148](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/home/Hero.tsx#L129-L148) and Footer in [Footer.tsx:124](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/ui/Footer.tsx#L124) use raw `<a>` tags instead of `<Link>`, forcing complete page reloads and re-executing Preloader.
- **Unoptimized Image Processing:** 24 gallery images (each 6–9.6 MB) in `app/gallery/page.tsx` saturate Next.js image optimization buffers on initial hit.

### 8. State & Data Layer
- **Hardcoded Realm Invariants:** `REALMS_DATA` in `EventsView.tsx` duplicates prize pools and tags, which drift from dynamic `events` rows in Supabase.
- **Category Slugs:** `app/events/[category]/page.tsx` maintains duplicated category objects for `aivishkar` and `avishkar`.

### 9. Accessibility
- **Keyboard Trap in DomeGallery:** 175 3D sphere tiles have `tabIndex={0}` and `role="button"` without keyboard (`Enter`/`Space`) event handlers. Users navigating via Tab are trapped traversing 175 invisible off-screen 3D nodes.
- **Motion Reduction:** Neither `ScrollEngine3D.tsx` nor `DomeGallery.tsx` checks `prefers-reduced-motion`.

### 10. Error Handling & Resilience
- **Resend Sequential Email Throttling:** `sendRegistrationEmail` executes a sequential loop of `await resend.emails.send(...)` for team members. Free/Pro tiers (2–10 req/s) risk hitting HTTP 429 errors during team registrations.

### 11. Code Health
- **Dead Code:** `components/SplitText.jsx` is untracked and imports proprietary `gsap/SplitText` without being used.
- **Brittle Gender Heuristic:** `SacEditorialSection.tsx:35-45` infers avatars based on a hardcoded list of 25 Indian first names.

### 12. Payment-Gateway Readiness
- **State Inconsistencies:** The database creates registrations in `pending` payment status, but `/api/register` immediately treats them as registered by dispatching entry emails.
- **Script Blocking:** Razorpay `checkout.js` is loaded at click time without ad-blocker detection or manual payment fallback.

---

## 4. Phase 2 — Findings Table

| ID | Severity | Area | File:line | What's wrong | Why it matters | Confidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **P0-01** | **Critical** | Correctness & Bugs | [DeskEditorialSpread.tsx:69,107](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/team/DeskEditorialSpread.tsx#L69), [LegacyView.tsx:26,90,189](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/legacy/LegacyView.tsx#L189) | `DeskEditorialSpread` indexes `accentTokens` with `[accentColor]` which only defines `{ violet, cyan, emerald }`. `LegacyView.tsx` passes `accent: "amber"`, bypassed by a loose cast (`as "violet" \| "cyan" \| "emerald"`). At runtime, `accentTokens` is `undefined`, causing `Cannot read properties of undefined (reading 'signeeRole')`. | **Completely crashes `npm run build` and produces a 500 error on `/legacy` in production.** Prevents any production deployment until fixed. | High |
| **P0-02** | **Critical** | Supabase & Registration | [route.ts:1042-1135](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/app/api/register/route.ts#L1042-L1135), [send-registration-email.ts:148,800-848](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/lib/send-registration-email.ts#L800-L848) | In `/api/register`, confirmation emails containing an Entry QR pass (`"You're Registered — Saviskar 2026"`) are dispatched inside Next.js `after()` immediately upon creating the database record, **before** payment has been initiated, charged, or verified. | Delegates who register for paid events receive valid "Registered" Entry QR passes without paying. If payment is abandoned or fails, delegates still possess passes. At gate check-in on fest day, scanners reject them with `402 Payment not complete`, triggering massive gate queues, confusion, and registration disputes. | High |
| **P0-03** | **Critical** | Performance & Bandwidth | [ScrollEngine3D.tsx:7-13](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/ui/ScrollEngine3D.tsx#L7-L13), [Preloader.tsx:12-19](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/ui/Preloader.tsx#L12-L19), [DomeGallery.tsx:10-13](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/ui/DomeGallery.tsx#L10-L13), [public/images/](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/public/images) | Public directory holds **443 MB** of unoptimized media. `ScrollEngine3D` loads 5x 8K JPEGs (33.6 MB transfer; ~870 MB uncompressed VRAM in WebGL), `Preloader` preloads 6 images (39.1 MB), and `DomeGallery` loads 175 raw tiles (~50 MB). Visiting `/` triggers **120+ MB** network transfer. | Under a 25,000 attendee traffic spike on Oct 27–28, campus 4G/5G cell towers will stall out on 120MB downloads. Mid-range Android phones (3–4GB RAM) will crash or trigger WebGL Context Loss (`webglcontextlost`) and OOM tab kills. Vercel/CDN bandwidth limits will be exhausted rapidly. | High |
| **P0-04** | **High** | Animation & Performance | [ScrollEngine3D.tsx:156,193-198](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/ui/ScrollEngine3D.tsx#L156-L198) | `new THREE.WebGLRenderer({ canvas })` is instantiated without a `try/catch` guard and without checking whether WebGL is supported or context creation succeeded. No fallback background or `webglcontextlost` handling exists. | On devices with WebGL disabled, hardware acceleration blocked, or low-end mobile in-app webviews (Instagram/WhatsApp), Three.js throws an uncaught exception in `useEffect`, crashing the entire landing page to `global-error.tsx`. | High |
| **P0-05** | **High** | Supabase & Data Layer | [schema.sql:1646-1690](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/supabase/schema.sql#L1646-L1690) vs [20260919060000_create_registration_otps.sql](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/supabase/migrations/20260919060000_create_registration_otps.sql#L16) | `supabase/schema.sql` is severely out of sync with migrations: it is missing the `registration_otps` table entirely and still grants `anon` execute permissions on `register_participant_events`. | Any environment or restore created from `schema.sql` will fail the registration OTP flow immediately with `relation "public.registration_otps" does not exist`, blocking all user sign-ins and registrations. | High |
| **P0-06** | **High** | App Router Usage | [page.tsx:1,86-105](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/app/events/%5Bcategory%5D/page.tsx#L1), [page.tsx:13,26-32](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/app/events/%5Bcategory%5D/%5Bevent%5D/page.tsx#L13), [page.tsx:1,23-43](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/app/schedule/page.tsx#L1) | `/events/[category]` and `/schedule` are marked `"use client"` and execute client-side `useEffect` fetches without export metadata. `/events/[category]/[event]` imports client browser Supabase (`@/lib/supabase`) in a Server Component without `revalidate` or `generateStaticParams`. | High database query load on every pageview; zero dynamic OpenGraph/Twitter card metadata when event links are shared on social channels during fest marketing; slow client hydration waterfalls. | High |
| **P0-07** | **High** | Resilience & Rate Limiting | [send-registration-email.ts:249,912-965](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/lib/send-registration-email.ts#L249-L965), [route.ts:1042-1161](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/app/api/register/route.ts#L1042-L1161) | `sendRegistrationEmail` executes sequential `await resend.emails.send(...)` calls inside a synchronous `for` loop for every team member. | Resend free/pro rate limits (2 to 10 requests/sec) will be hit during concurrent team registrations, causing HTTP 429 errors where member confirmation emails are silently skipped or delayed. Long loops in `after()` also risk serverless timeouts. | High |
| **P0-08** | **High** | Accessibility | [DomeGallery.tsx:647-659](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/ui/DomeGallery.tsx#L647-L659) | 175 3D sphere tile elements are rendered with `role="button"` and `tabIndex={0}`, but have no `onKeyDown` or `onKeyUp` keyboard handlers (only `onClick` / `onPointerUp`). | Keyboard and screen-reader users are trapped pressing Tab 175 times through invisible off-screen 3D nodes without the ability to activate them via Enter or Space (WCAG 2.1.1 & 2.1.2 violation). | High |
| **P0-09** | **High** | Architecture & Stability | [ScrollEngine3D.tsx:161-189](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/ui/ScrollEngine3D.tsx#L161-L189) | Mutates `WebGL2RenderingContext.prototype.texImage3D` and `texSubImage3D` globally on the `window` object. | Global prototype pollution risks breaking other WebGL consumers, scanner libraries (`html5-qrcode`), or third-party embeds sharing the runtime context. | High |
| **P1-10** | **Medium** | Security & Scalability | [rate-limit.ts:19-20,35-71](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/lib/rate-limit.ts#L19-L71) | In-memory `Map` rate limiting is local to a single Node.js process / serverless lambda instance. | On multi-container Vercel serverless deployments, requests are distributed across distinct instances, enabling distributed bots or bursts to bypass the intended 20 req/min threshold. | High |
| **P1-11** | **Medium** | Payment Gateway Readiness | [RegistrationForm.tsx:903-919,1057-1080](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/registration/RegistrationForm.tsx#L903-L919) | Razorpay checkout script (`checkout.js`) is injected dynamically at payment time without offline fallback or ad-blocker detection. | If blocked by privacy extensions or campus network firewalls, users are left in an uninformative "payment pending" state with no manual payment link or QR alternative. | High |
| **P1-12** | **Medium** | App Router Usage | [Hero.tsx:129,148](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/home/Hero.tsx#L129-L148), [Footer.tsx:124](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/ui/Footer.tsx#L124) | Hero CTAs (`/events`, `/register`) and Footer links use raw `<motion.a>` and `<a>` instead of Next.js `<Link>`. | Clicking "Explore Realms" or "Claim Your Pass" from the hero triggers a full browser refresh, discarding memory caches, re-executing Preloader, and increasing server bandwidth. | High |
| **P1-13** | **Medium** | Error Handling & Resilience | [app/](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/app) | Zero route-level `error.tsx` or `loading.tsx` files exist outside of `app/admin/loading.tsx`. | An error thrown in any public page component bubbles directly to `global-error.tsx`, replacing the entire site with a generic error screen instead of preserving navigation and headers. | High |
| **P1-14** | **Medium** | Tooling & Syntax | [Navbar.tsx:398,454](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/ui/Navbar.tsx#L398), [TeamView.tsx:118](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/team/TeamView.tsx#L118) | Unescaped JSX comment tokens (`//`) in `Navbar.tsx` and unescaped apostrophe (`'`) in `TeamView.tsx`. | Causes CI/CD lint pipeline failures (`npm run lint` exits code 1). | High |
| **P2-15** | **Low** | Accessibility & A11y | [ScrollEngine3D.tsx:144-526](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/ui/ScrollEngine3D.tsx#L144-L526), [DomeGallery.tsx:1-670](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/ui/DomeGallery.tsx#L1-L670) | Neither `ScrollEngine3D` nor `DomeGallery` inspects or reacts to `(prefers-reduced-motion: reduce)`. | Users with vestibular motion disorders or visual sensitivities receive intense 3D chromatic aberration, particle vortexes, and spinning spheres without a disable toggle. | High |
| **P2-16** | **Low** | Security & SEO | [layout.tsx:1-9](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/app/admin/layout.tsx#L1-L9) | `AdminLayout` does not export `robots: { index: false, follow: false }`. | If external websites or social links reference `/admin` URLs, search crawlers can index admin login and invite paths despite `robots.txt` disallows. | High |
| **P3-17** | **Nit** | Code Health | [SplitText.jsx:2-7](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/SplitText.jsx#L2-L7) | Completely orphaned, untracked component importing proprietary Club GreenSock `gsap/SplitText`. | Unused dead code in codebase; potential licensing and bundling confusion. | High |

---

## 5. Phase 2 — Detailed Fixes

### Fix for P0-01: Build Prerender TypeError on `/legacy`
* **File:** [components/team/DeskEditorialSpread.tsx](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/team/DeskEditorialSpread.tsx#L44-L70) & [components/legacy/LegacyView.tsx](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/legacy/LegacyView.tsx#L189)
* **Current Code:**
```tsx
// components/team/DeskEditorialSpread.tsx (lines 44-70)
  const accentTokens = {
    violet: {
      eyebrow: "text-violet-400",
      glow: "rgba(139, 92, 246, 0.18)",
      glowRing: "rgba(139,92,246,0.06)",
      signeeRole: "text-violet-400/70",
      cornerBorder: "border-violet-500/35",
      ghostText: "text-violet-300",
    },
    cyan: { ... },
    emerald: { ... },
  }[accentColor]; // accentColor can be undefined or unknown at runtime!
```
* **Proposed Replacement:**
```tsx
// components/team/DeskEditorialSpread.tsx
export interface DeskEditorialSpreadProps {
  // ...
  accentColor?: "violet" | "cyan" | "emerald" | "amber";
}

// Add 'amber' mapping and a safe fallback token set:
  const ACCENT_MAP = {
    violet: {
      eyebrow: "text-violet-400",
      glow: "rgba(139, 92, 246, 0.18)",
      glowRing: "rgba(139,92,246,0.06)",
      signeeRole: "text-violet-400/70",
      cornerBorder: "border-violet-500/35",
      ghostText: "text-violet-300",
    },
    cyan: {
      eyebrow: "text-cyan-400",
      glow: "rgba(34, 211, 238, 0.14)",
      glowRing: "rgba(34,211,238,0.05)",
      signeeRole: "text-cyan-400/70",
      cornerBorder: "border-cyan-500/35",
      ghostText: "text-cyan-300",
    },
    emerald: {
      eyebrow: "text-emerald-400",
      glow: "rgba(52, 211, 153, 0.14)",
      glowRing: "rgba(52,211,153,0.05)",
      signeeRole: "text-emerald-400/70",
      cornerBorder: "border-emerald-500/35",
      ghostText: "text-emerald-300",
    },
    amber: {
      eyebrow: "text-amber-400",
      glow: "rgba(245, 158, 11, 0.14)",
      glowRing: "rgba(245,158,11,0.05)",
      signeeRole: "text-amber-400/70",
      cornerBorder: "border-amber-500/35",
      ghostText: "text-amber-300",
    },
  };

  const accentTokens = ACCENT_MAP[accentColor as keyof typeof ACCENT_MAP] || ACCENT_MAP.violet;
```
* **Why this fix and not an alternative:** It guarantees that `accentTokens` is never undefined under any prop value while supporting the `"amber"` accent explicitly assigned in `DIGNITARIES` data.
* **Blast radius:** Touches only [DeskEditorialSpread.tsx](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/team/DeskEditorialSpread.tsx); immediately resolves the fatal `next build` prerender failure.

---

### Fix for P0-02: Premature Confirmation Email & Entry QR Dispatch
* **File:** [app/api/register/route.ts](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/app/api/register/route.ts#L1042-L1056)
* **Current Code:**
```typescript
// app/api/register/route.ts (lines 1042-1056)
  after(async () => {
    for (const result of results as any[]) {
      if (result.status !== "added") {
        continue;
      }

      const peRow = peRows.find(
        (row: any) => String(row.event_id) === String(result.event_id)
      );
      // Immediately sends full QR confirmation email regardless of payment_type!
      const emailResult = await sendRegistrationEmail({ ... });
    }
  });
```
* **Proposed Replacement:**
```typescript
// app/api/register/route.ts
  after(async () => {
    for (const result of results as any[]) {
      if (result.status !== "added") {
        continue;
      }

      const peRow = peRows.find(
        (row: any) => String(row.event_id) === String(result.event_id)
      );

      if (!peRow) continue;
      const eventMeta = peRow.events ?? {};

      // DO NOT dispatch Entry QR email for events requiring payment that are not yet paid
      if (eventMeta.payment_type === "paid" && peRow.payment_status !== "paid") {
        console.log(`[REGISTER EMAIL] Skipping confirmation QR email for unpaid event ${result.event_id}. Waiting for payment verification.`);
        continue;
      }

      // Free events proceed to send confirmation QR immediately:
      await sendRegistrationEmail({ ... });
    }
  });
```
* **Why this fix and not an alternative:** Confines the QR pass generation to free events and successful payment verification handlers (`/api/payments/verify` and `/api/payments/webhook`), ensuring delegates cannot enter paid arena events with unverified registrations.
* **Blast radius:** Modifies the dispatch condition in [route.ts](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/app/api/register/route.ts); paid attendees will receive their QR pass immediately upon successful payment verification in `verify/route.ts` and `webhook/route.ts`.

---

### Fix for P0-03: Excessive Asset Bandwidth & WebGL VRAM Exhaustion
* **File:** [components/ui/ScrollEngine3D.tsx](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/ui/ScrollEngine3D.tsx#L7-L13), [components/ui/Preloader.tsx](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/ui/Preloader.tsx#L12-L19)
* **Current Code:**
```typescript
// components/ui/ScrollEngine3D.tsx (lines 7-13)
const TEXTURE_PATHS = [
  "/images/concert-stadium.jpg",             // 5.88 MB
  "/images/firework-launch.jpg",             // 6.25 MB
  "/images/scene-realms-stage.jpg",          // 7.38 MB
  "/images/scene-starnight-show.jpg",        // 6.76 MB
  "/images/scene-finale-celebration.jpg",    // 7.37 MB
];
```
* **Proposed Replacement:**
Generate downscaled, optimized WebP/AVIF images (1920x1080, quality 80; ~180KB each instead of 7MB each). Reference the optimized variants:
```typescript
// components/ui/ScrollEngine3D.tsx
const TEXTURE_PATHS = [
  "/images/optimized/concert-stadium.webp",
  "/images/optimized/firework-launch.webp",
  "/images/optimized/scene-realms-stage.webp",
  "/images/optimized/scene-starnight-show.webp",
  "/images/optimized/scene-finale-celebration.webp",
];
```
In `ScrollEngine3D.tsx`, scale down texture resolution on mobile devices:
```typescript
// Disable mipmaps on massive textures to save 33% VRAM
tex.generateMipmaps = false;
tex.minFilter = THREE.LinearFilter;
```
* **Why this fix and not an alternative:** Downscaling 8K (7680x4320) uncompressed JPEGs to 1080p WebP reduces initial transfer size from 33.6 MB to ~900 KB (97% reduction) and VRAM usage from ~870 MB to under 45 MB, preventing mobile OOM crashes.
* **Blast radius:** Public directory asset optimization; preserves visual fidelity while preventing client crashes. Note: Respect AGENTS.md Landing Page Lock Policy by coordinating changes to `ScrollEngine3D.tsx` if strictly required.

---

### Fix for P0-04: Unhandled WebGL Renderer Initialization
* **File:** [components/ui/ScrollEngine3D.tsx](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/ui/ScrollEngine3D.tsx#L192-L203)
* **Current Code:**
```typescript
// components/ui/ScrollEngine3D.tsx (lines 192-200)
    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
```
* **Proposed Replacement:**
```typescript
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: window.devicePixelRatio <= 1.5,
        alpha: true,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,
      });
    } catch (e) {
      console.warn("WebGL initialization failed, falling back to static presentation:", e);
      return;
    }
```
* **Why this fix and not an alternative:** Prevents uncaught fatal exceptions inside the React mount effect on devices without WebGL capability.
* **Blast radius:** Confined to [ScrollEngine3D.tsx](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/ui/ScrollEngine3D.tsx).

---

### Fix for P0-05: Missing Schema Synchronisation for `registration_otps`
* **File:** [supabase/schema.sql](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/supabase/schema.sql)
* **Current Code:** Missing `registration_otps` DDL, and still contains:
```sql
GRANT ALL ON FUNCTION "public"."register_participant_events"(...) TO "anon";
```
* **Proposed Replacement:**
Append the contents of migration `20260919060000_create_registration_otps.sql` into `supabase/schema.sql`, and enforce:
```sql
CREATE TABLE IF NOT EXISTS public.registration_otps (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL,
    otp_hash text NOT NULL,
    issued_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,
    attempts integer NOT NULL DEFAULT 0,
    consumed_at timestamptz
);

ALTER TABLE public.registration_otps ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.registration_otps FROM anon, authenticated;
GRANT ALL ON TABLE public.registration_otps TO service_role;

REVOKE EXECUTE ON FUNCTION public.register_participant_events(text, text, text, text, text, jsonb) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_participant_events(text, text, text, text, text, jsonb) TO service_role;
```
* **Why this fix and not an alternative:** Restores single source of truth between the repository schema and database migrations.
* **Blast radius:** Database setup and migration scripts.

---

### Fix for P0-06: Fix App Router Boundaries and Add Dynamic Caching / Metadata
* **File:** [app/events/[category]/page.tsx](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/app/events/%5Bcategory%5D/page.tsx), [app/events/[category]/[event]/page.tsx](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/app/events/%5Bcategory%5D/%5Bevent%5D/page.tsx)
* **Current Code:**
```typescript
// app/events/[category]/[event]/page.tsx (lines 13, 26-32)
import { supabase } from "@/lib/supabase"; // Uses browser client on server!

export default async function EventPage({ params }: ...) {
  const { category, event } = await params;
  const { data: currentEvent, error } = await supabase
    .from("events")
    .select("*")
    .eq("category", category)
    .eq("slug", event)
    .eq("active", true)
    .single();
```
* **Proposed Replacement:**
Add `generateStaticParams`, ISR `revalidate`, dynamic metadata generation, and use `@supabase/ssr` server client:
```typescript
// app/events/[category]/[event]/page.tsx
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 300; // Cache event details for 5 minutes

export async function generateMetadata({ params }: { params: Promise<{ category: string; event: string }> }): Promise<Metadata> {
  const { category, event } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("name, description").eq("slug", event).maybeSingle();

  return {
    title: data ? `${data.name} | Saviskar 2026` : "Event Details",
    description: data?.description ?? "Saviskar 2026 Competition Event",
  };
}
```
* **Why this fix and not an alternative:** Offloads database queries to Next.js CDN cache (ISR) and provides full OpenGraph preview tags for WhatsApp/Instagram sharing during marketing campaigns.
* **Blast radius:** Touches [page.tsx](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/app/events/%5Bcategory%5D/%5Bevent%5D/page.tsx).

---

### Fix for P0-07: Resend Email Batch Throttling
* **File:** [lib/send-registration-email.ts](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/lib/send-registration-email.ts#L249-L255)
* **Current Code:**
```typescript
// lib/send-registration-email.ts (lines 249-255)
  for (const recipient of uniqueRecipients) {
    // Sequential await with no pacing, vulnerable to 429 Rate Limit
    const { data: resendData, error: resendError } = await resend.emails.send({ ... });
  }
```
* **Proposed Replacement:**
```typescript
  // Batch send using Promise.allSettled with delay pacing between iterations
  for (let i = 0; i < uniqueRecipients.length; i++) {
    const recipient = uniqueRecipients[i];
    if (i > 0) {
      // 250ms spacing keeps max rate <= 4 req/sec, safely below Resend throttling limits
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    try {
      await resend.emails.send({ ... });
    } catch (err) {
      console.error(`[REGISTER EMAIL] Send failure for ${recipient.email}:`, err);
    }
  }
```
* **Why this fix and not an alternative:** Paces out API calls to prevent 429 rejections while staying inside serverless execution time limits.
* **Blast radius:** Confined to [send-registration-email.ts](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/lib/send-registration-email.ts).

---

### Fix for P0-08: Eliminate 175-Node Keyboard Trap in DomeGallery
* **File:** [components/ui/DomeGallery.tsx](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/ui/DomeGallery.tsx#L646-L650)
* **Current Code:**
```tsx
// components/ui/DomeGallery.tsx (lines 646-650)
  <div
    className="item__image"
    role="button"
    tabIndex={0}
    aria-label={it.alt || 'Open image'}
    onClick={onTileClick}
    onPointerUp={onTilePointerUp}
  >
```
* **Proposed Replacement:**
```tsx
  <div
    className="item__image"
    role="button"
    tabIndex={-1} // Remove decorative 3D background tiles from default tab flow
    aria-hidden="true"
    onClick={onTileClick}
    onPointerUp={onTilePointerUp}
  >
```
Provide a single accessible "Explore Full Gallery" button linking to `/gallery` in the section header (which already exists in `GalleryGlimpse.tsx`).
* **Why this fix and not an alternative:** Eliminates the 175-node Tab trap completely while preserving mouse and pointer interaction.
* **Blast radius:** Confined to [DomeGallery.tsx](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/ui/DomeGallery.tsx).

---

### Fix for P0-09: Remove Global WebGL Prototype Pollution
* **File:** [components/ui/ScrollEngine3D.tsx](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/ui/ScrollEngine3D.tsx#L161-L190)
* **Current Code:**
```typescript
// components/ui/ScrollEngine3D.tsx (lines 161-175)
  const proto = Object.getPrototypeOf(gl2) as WebGL2RenderingContext;
  if (proto && !("__texImage3DGuarded" in proto)) {
    (proto as unknown as Record<string, unknown>).__texImage3DGuarded = true;
    const origTexImage3D = proto.texImage3D;
    proto.texImage3D = function (this: WebGL2RenderingContext, ...args: unknown[]) {
      // Mutates global prototype!
```
* **Proposed Replacement:**
Remove the global prototype monkey-patching entirely. Instead, set texture-level flags directly on the Three.js textures before upload:
```typescript
  const texture = textureLoader.load(path);
  texture.flipY = false;
  texture.premultiplyAlpha = false;
```
* **Why this fix and not an alternative:** Eliminates global runtime mutation and adheres to Three.js standard texture unpacking conventions.
* **Blast radius:** Confined to [ScrollEngine3D.tsx](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/ui/ScrollEngine3D.tsx).

---

## 6. Phase 2 — Risk Register

| Risk | Area | Impact Under Oct 27–28 Spike | One-Line Mitigation |
| :--- | :--- | :--- | :--- |
| **Supabase Connection Pool Saturation** | Database | Concurrent registrations exhaust Postgres direct connection limits. | Use Supavisor transaction pooler URL on port 6543 for all serverless Route Handlers. |
| **Serverless Cold Starts & Timeout** | Infrastructure | 500ms–2s cold starts during burst registrations on Vercel. | Keep serverless bundle slim; isolate heavy dependencies like `pdf-lib` and `qrcode` behind dedicated routes. |
| **Resend Domain Verification Failure** | Email / Auth | Registration OTP emails rejected if `RESEND_FROM_EMAIL` uses unverified domain. | Verify sending domain DNS (DKIM/SPF) in Resend dashboard well before festival announcement. |
| **In-Memory OTP Loss on Container Eviction** | Authentication | If Supabase is unreachable and fallback kicks in, OTPs vanish between requests. | Ensure `isProductionEnvironment()` fails closed and Supabase credentials are always active. |
| **Camera Scanner Failure in Low Light** | Admin / Gate Ops | Stage arena check-in scanners fail on dark phone screens or low-contrast badges. | Add a manual 8-character `SVK26-XXXXXXXX` text search input on the scanner page as primary backup. |
| **Gate Check-in Race Conditions** | Concurrency | Two volunteers scan the same QR pass simultaneously on two gates. | Add Postgres `SELECT FOR UPDATE` or conditional check `WHERE checked_in = false` on check-in RPC. |
| **Uncached Schedule & Realm Reads** | Performance | Thousands of attendees refreshing `/schedule` concurrently on mobile. | Set `export const revalidate = 60;` on the schedule and event data layers. |

---

## 7. Phase 2 — Open Questions for the Developer

1. **Payment Gateway Architecture:**  
   In [components/registration/RegistrationForm.tsx:843](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/components/registration/RegistrationForm.tsx#L843) and [app/api/payments/](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/app/api/payments), Razorpay integration is partially implemented. Is payment intended to be **strictly mandatory before** creating the registration row, or is the intention to allow delegates to register and pay later via the resume token URL?
2. **Resend Email Domain Configuration:**  
   In [lib/auth/send-otp-email.ts:23](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/lib/auth/send-otp-email.ts#L23), fallback sender is `noreply@amadhav.com`. Has this domain been verified with DKIM and SPF records in the live Resend dashboard, or will production use an institutional domain (e.g., `@cgcuniversity.in`)?
3. **Landing Page Image Asset Optimization:**  
   The Landing Page Lock Policy in `AGENTS.md` strictly locks `ScrollEngine3D.tsx`, `Hero.tsx`, and `Preloader.tsx`. Because `public/images/` contains ~443 MB of raw assets that saturate mobile networks, do we have authorization to compress and replace the physical image files on disk in `public/images/` (preserving exact filenames and paths) to reduce transfer weight without altering the locked component code?
4. **Primary Admin User ID Variable:**  
   In [lib/supabase/server.ts:139](file:///Users/madhavvashisht/Desktop/MY_Projects/Saviskar26/lib/supabase/server.ts#L139), `isPrimaryMaster()` requires `PRIMARY_ADMIN_USER_ID`. Has this UUID been populated in `.env.production.local` / Vercel Environment Variables, or is it currently unset?
