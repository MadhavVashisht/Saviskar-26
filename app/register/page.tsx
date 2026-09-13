import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ArrowUpRight, Mail, Phone, Sparkles } from "lucide-react";
import RegistrationForm from "@/components/registration/RegistrationForm";

export const metadata: Metadata = {
  title: "Official Registration Portal",
  description:
    "Register for Saviskar 2026: Aevorian Reverie at CGC University, Mohali. Fast-track digital verification for 50+ realms across technology, culture, hackathons, and sports.",
  openGraph: {
    title: "Official Registration | Saviskar 2026: Aevorian Reverie",
    description:
      "Join thousands of university delegates nationwide for Saviskar 2026 at CGC University, Mohali.",
  },
};

function RegistrationFormLoading() {
  return (
    <section className="px-6 py-24 md:px-10">
      <div className="mx-auto max-w-[1200px] text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
        <p className="mt-4 text-sm text-white/40">Loading registration portal...</p>
      </div>
    </section>
  );
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const fromAdmin = params.from === "admin";

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Background Stage Haze */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[15%] top-[10%] h-[600px] w-[600px] rounded-full bg-violet-700/10 blur-[160px]" />
        <div className="absolute right-[10%] top-[35%] h-[550px] w-[550px] rounded-full bg-purple-600/10 blur-[150px]" />
      </div>

      {/* Top Navigation */}
      <header className="relative z-20 px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          {fromAdmin ? (
            <Link
              href="/admin"
              className="liquid-glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white/70 transition hover:text-white"
            >
              <ArrowLeft size={14} />
              <span>Back to Admin</span>
            </Link>
          ) : (
            <Link
              href="/"
              className="liquid-glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white/70 transition hover:text-white"
            >
              <ArrowLeft size={14} />
              <span>Saviskar</span>
            </Link>
          )}

          <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-violet-300">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_#c084fc]" />
            <span>AEVORIAN REVERIE • REGISTRATION</span>
          </div>

          <Link
            href="/events"
            className="liquid-glass hidden items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-white/70 transition hover:text-white sm:flex"
          >
            <span>All Realms</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 pb-16 pt-16 md:px-10 md:pb-24 md:pt-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="liquid-glass mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70">
            <Sparkles size={12} className="text-violet-400" />
            CGC University Mohali • Aevorian Reverie
          </div>

          <h1 className="max-w-[1000px] text-[clamp(4.2rem,10vw,9.5rem)] font-light leading-[0.82] tracking-tight text-white">
            Your stage <br />
            <span className="font-editorial text-violet-300 font-normal">starts here.</span>
          </h1>

          <div className="mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-t border-white/10 pt-8">
            <p className="max-w-lg text-base leading-7 text-white/60">
              Choose your realm, specify team members, lock in your squad, and claim your official accreditation pass for Saviskar 2026. Open to competitors and creators from 500+ colleges and universities nationwide.
            </p>

            <span className="font-mono text-xs text-white/40">
              FAST-TRACK DIGITAL VERIFICATION
            </span>
          </div>
        </div>
      </section>

      {/* Form Area */}
      <div className="relative z-10">
        <Suspense fallback={<RegistrationFormLoading />}>
          <RegistrationForm />
        </Suspense>
      </div>

      {/* Official Help & Helpline Bottom Section */}
      <section className="relative z-10 border-t border-white/10 bg-black/80 px-6 py-20 text-white md:px-10 md:py-28">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-violet-400">
              Registration Support
            </span>

            <h2 className="mt-2 text-3xl font-light tracking-tight text-white md:text-4xl">
              Need assistance with <span className="font-editorial text-violet-300 font-normal">your entry?</span>
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/50">
              Our student coordinators are available daily to assist with bulk university delegations, solo registrations, and payment confirmations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="mailto:saviskar@cgcuniversity.in"
              className="liquid-glass flex items-center gap-3 rounded-2xl border border-white/10 p-4 transition hover:border-violet-400 hover:bg-white/10"
            >
              <Mail size={18} className="text-violet-300" />
              <div>
                <p className="text-[9px] uppercase tracking-wider text-white/40">Email</p>
                <p className="text-xs font-medium text-white">saviskar@cgcuniversity.in</p>
              </div>
            </a>

            <a
              href="tel:+917667340235"
              className="liquid-glass flex items-center gap-3 rounded-2xl border border-white/10 p-4 transition hover:border-violet-400 hover:bg-white/10"
            >
              <Phone size={18} className="text-violet-300" />
              <div>
                <p className="text-[9px] uppercase tracking-wider text-white/40">Helpline Numbers</p>
                <p className="text-xs font-medium text-white">+91 76673 40235 • +91 80997 31133</p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}