"use client";

import { useModalScrollLock } from "../registration/useModalScrollLock";
import { useState, useEffect, useTransition, useMemo, useRef, useCallback } from "react";
import {
  X,
  Lock,
  Unlock,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  Search,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  CalendarDays,
  UserCheck,
  Building2,
  FileText,
  Award,
  Users,
  Image as ImageIcon,
  CheckCircle2,
  Bed,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  RotateCcw,
  Filter,
} from "lucide-react";
import {
  DEFAULT_SITE_ACCESS,
  type SitePageKey,
  type SiteAccessConfig,
  ACCOMMODATION_OPTIONS,
  DEFAULT_ACCOMMODATION_AVAILABILITY,
  type AccommodationOptionDefinition,
} from "@/lib/config/site-access";

interface SitePageLocksModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPrimary: boolean;
  siteAccess?: SiteAccessConfig | null;
  onUpdate?: (updatedLocks: SiteAccessConfig) => void;
}

const PAGE_CARDS: Array<{
  key: SitePageKey;
  name: string;
  path: string;
  category: string;
  moduleCode: string;
  description: string;
  icon: typeof Lock;
  color: string;
}> = [
  {
    key: "REGISTRATIONS_ENABLED",
    name: "Participant Registration Form",
    path: "/register",
    category: "Accreditation",
    moduleCode: "ACCREDITATION.SYS",
    description: "Pauses complete participant registration, squad onboarding, delegate passes, and registration APIs.",
    icon: UserCheck,
    color: "violet",
  },
  {
    key: "ACCOMMODATION_ENABLED",
    name: "Campus Accommodation Booking",
    path: "/register#accommodation",
    category: "Campus Stay & Hospitality",
    moduleCode: "HOSPITALITY.SYS",
    description: "On-campus hostel accommodations, bed allocations, and accommodation checkout APIs.",
    icon: Bed,
    color: "emerald",
  },
  {
    key: "SCHEDULE_ENABLED",
    name: "Festival Schedule & Radar",
    path: "/schedule",
    category: "Timeline & Radar",
    moduleCode: "CHRONO.SYS",
    description: "Hourly competition timetables, campus stage coordinates, and event roadmap.",
    icon: CalendarDays,
    color: "blue",
  },
  {
    key: "STARNIGHT_ENABLED",
    name: "Star Night 2026",
    path: "/starnight",
    category: "Concert Arena",
    moduleCode: "STARNIGHT.SYS",
    description: "Celebrity headliner concert drops (Asees Kaur & Ranjit Bawa), past stages, lights out.",
    icon: Sparkles,
    color: "amber",
  },
  {
    key: "EVENT_DETAILS_ENABLED",
    name: "Event Detail Dossiers",
    path: "/events",
    category: "Competition Rules",
    moduleCode: "DOSSIER.SYS",
    description: "50+ competition detail pages, problem statements, prize pool manifests, direct registration CTA.",
    icon: FileText,
    color: "emerald",
  },
  {
    key: "SPONSORS_ENABLED",
    name: "Sponsors & Partners",
    path: "/sponsors",
    category: "Corporate Allies",
    moduleCode: "ALLIES.SYS",
    description: "Title partners, brand showcase, associate partners, corporate tier matrix.",
    icon: Building2,
    color: "indigo",
  },
  {
    key: "LEGACY_ENABLED",
    name: "Institutional Legacy",
    path: "/legacy",
    category: "Patron Citations",
    moduleCode: "LEGACY.ARCHIVE",
    description: "Founder manifests, chancellor archive, patron citations, and alumni heritage.",
    icon: Award,
    color: "rose",
  },
  {
    key: "TEAM_ENABLED",
    name: "Organising Team & SAC",
    path: "/team",
    category: "Executive Council",
    moduleCode: "COUNCIL.SYS",
    description: "Faculty leadership, domain heads, 54-member Student Advisory Council (SAC).",
    icon: Users,
    color: "cyan",
  },
  {
    key: "GALLERY_ENABLED",
    name: "Campus Media Gallery",
    path: "/gallery",
    category: "Visual Vault",
    moduleCode: "VAULT.SYS",
    description: "Festival photos, cinematic recap films, stage highlights, and media vaults.",
    icon: ImageIcon,
    color: "fuchsia",
  },
];

export function SitePageLocksModal({
  isOpen,
  onClose,
  isPrimary,
  siteAccess,
  onUpdate,
}: SitePageLocksModalProps) {
  const modalCardRef = useRef<HTMLDivElement>(null);
  const scrollBodyRef = useRef<HTMLDivElement>(null);

  useModalScrollLock({
    isOpen,
    onClose,
    focusRef: modalCardRef,
  });
  const [locks, setLocks] = useState<SiteAccessConfig>(siteAccess || DEFAULT_SITE_ACCESS);
  const [accommodationAvailability, setAccommodationAvailability] = useState<Record<string, boolean>>(
    DEFAULT_ACCOMMODATION_AVAILABILITY
  );
  const [competitions, setCompetitions] = useState<Array<any>>([]);
  const [competitionsLoading, setCompetitionsLoading] = useState(false);
  const [competitionsError, setCompetitionsError] = useState<string | null>(null);

  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const [expandedSection, setExpandedSection] = useState<"none" | "competitions" | "accommodations">("none");
  const [togglingKey, setTogglingKey] = useState<SitePageKey | null>(null);
  const [togglingCompId, setTogglingCompId] = useState<string | null>(null);
  const [togglingOptionId, setTogglingOptionId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [compSearchQuery, setCompSearchQuery] = useState("");
  const [compCategoryFilter, setCompCategoryFilter] = useState("All");

  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Sync when prop updates
  useEffect(() => {
    if (siteAccess) {
      setLocks(siteAccess);
    }
  }, [siteAccess]);

  // Stable callback to fetch site access and competition state
  const loadSiteState = useCallback(async () => {
    setCompetitionsLoading(true);
    setCompetitionsError(null);
    try {
      const res = await fetch("/api/admin/site-access");
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data?.siteAccess) {
        setLocks(data.siteAccess);
        onUpdateRef.current?.(data.siteAccess);
      }
      if (data?.accommodationAvailability) {
        setAccommodationAvailability(data.accommodationAvailability);
      }
      if (Array.isArray(data?.competitions)) {
        setCompetitions(data.competitions);
      } else {
        setCompetitions([]);
      }
    } catch (err: any) {
      console.warn("Failed to load admin site-access state:", err);
      setCompetitionsError(err?.message || "Failed to load competition catalog from database.");
    } finally {
      setCompetitionsLoading(false);
    }
  }, []);

  // Ensure fresh locks and availability data on modal open
  useEffect(() => {
    if (isOpen) {
      loadSiteState();
    }
  }, [isOpen, loadSiteState]);

  // Lock body scroll and pause Lenis while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const globalLenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    if (globalLenis) globalLenis.stop();

    return () => {
      document.body.style.overflow = prevOverflow;
      if (globalLenis) globalLenis.start();
    };
  }, [isOpen]);

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return PAGE_CARDS;
    const q = searchQuery.toLowerCase();
    return PAGE_CARDS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.path.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.moduleCode.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const lockedCount = useMemo(() => {
    return Object.values(locks).filter((v) => !v).length;
  }, [locks]);

  const unlockedCount = useMemo(() => {
    return Object.values(locks).filter((v) => v).length;
  }, [locks]);

  // Competition Categories
  const competitionCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const c of competitions) {
      if (c.category) cats.add(c.category);
    }
    return ["All", ...Array.from(cats).sort()];
  }, [competitions]);

  // Filtered Competitions
  const filteredCompetitions = useMemo(() => {
    return competitions.filter((comp) => {
      const matchesCat = compCategoryFilter === "All" || comp.category === compCategoryFilter;
      if (!matchesCat) return false;
      if (!compSearchQuery.trim()) return true;
      const q = compSearchQuery.toLowerCase();
      return (
        comp.name?.toLowerCase().includes(q) ||
        comp.slug?.toLowerCase().includes(q) ||
        comp.category?.toLowerCase().includes(q)
      );
    });
  }, [competitions, compCategoryFilter, compSearchQuery]);

  const openCompetitionsCount = useMemo(() => {
    return competitions.filter((c) => c.registration_open !== false).length;
  }, [competitions]);

  const lockedCompetitionsCount = useMemo(() => {
    return competitions.filter((c) => c.registration_open === false).length;
  }, [competitions]);

  // Accommodation metrics
  const activeAccommodationOptionsCount = useMemo(() => {
    return ACCOMMODATION_OPTIONS.filter((opt) => accommodationAvailability[opt.id] ?? false).length;
  }, [accommodationAvailability]);

  // Toggle Single Page Lock
  const handleToggle = async (key: SitePageKey, currentEnabled: boolean) => {
    if (!isPrimary) return;
    const newEnabled = !currentEnabled;
    setTogglingKey(key);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/site-access", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, enabled: newEnabled }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update page lock.");
      }

      const updated = data?.siteAccess || {
        ...locks,
        [key]: newEnabled,
        ...(key === "REGISTRATIONS_ENABLED" || key === "REGISTRATION_ENABLED"
          ? { REGISTRATIONS_ENABLED: newEnabled, REGISTRATION_ENABLED: newEnabled }
          : {}),
      };
      setLocks(updated);
      onUpdate?.(updated);
      setStatusMessage({
        type: "success",
        text: `${PAGE_CARDS.find((c) => c.key === key)?.name || key} is now ${newEnabled ? "unlocked (live)" : "locked (restricted)"}.`,
      });
    } catch (err: any) {
      console.error("Lock toggle error:", err);
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to toggle page lock.",
      });
    } finally {
      setTogglingKey(null);
    }
  };

  // Bulk Action (Unlock All / Lock All)
  const handleBulkAction = async (unlockAll: boolean) => {
    if (!isPrimary) return;
    setTogglingKey(PAGE_CARDS[0].key);
    setStatusMessage(null);

    const updated: SiteAccessConfig = { ...locks };
    PAGE_CARDS.forEach((c) => {
      updated[c.key] = unlockAll;
    });
    updated.REGISTRATIONS_ENABLED = unlockAll;
    updated.REGISTRATION_ENABLED = unlockAll;

    try {
      const res = await fetch("/api/admin/site-access", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locks: updated }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to apply bulk page locks.");
      }

      const authoritativeLocks = data?.siteAccess || updated;
      setLocks(authoritativeLocks);
      onUpdate?.(authoritativeLocks);
      setStatusMessage({
        type: "success",
        text: unlockAll
          ? "All festival modules and public pages are now unlocked and live."
          : "All festival modules and public pages have been locked (access restricted).",
      });
    } catch (err: any) {
      console.error("Bulk action error:", err);
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to apply bulk page locks.",
      });
    } finally {
      setTogglingKey(null);
    }
  };

  // Toggle Single Competition Lock
  const handleToggleCompetition = async (eventId: string, currentOpen: boolean) => {
    if (!isPrimary) return;
    const targetOpen = !currentOpen;
    setTogglingCompId(eventId);
    setStatusMessage(null);

    // Optimistic update
    setCompetitions((prev) =>
      prev.map((c) => (c.id === eventId ? { ...c, registration_open: targetOpen } : c))
    );

    try {
      const res = await fetch("/api/admin/site-access", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toggleCompetition: { eventId, registrationOpen: targetOpen },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to toggle competition availability.");
      }

      const comp = competitions.find((c) => c.id === eventId);
      setStatusMessage({
        type: "success",
        text: `Competition "${comp?.name || 'Selected'}" registration is now ${targetOpen ? "open (unlocked)" : "closed (locked)"}.`,
      });
    } catch (err: any) {
      console.error("Competition toggle error:", err);
      // Revert optimistic update
      setCompetitions((prev) =>
        prev.map((c) => (c.id === eventId ? { ...c, registration_open: currentOpen } : c))
      );
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to update competition registration.",
      });
    } finally {
      setTogglingCompId(null);
    }
  };

  // Bulk Competitions Action (Lock All / Unlock All)
  const handleBulkCompetitions = async (lockAll: boolean) => {
    if (!isPrimary) return;
    setTogglingCompId("bulk");
    setStatusMessage(null);

    const targetOpen = !lockAll;
    // Optimistic update
    setCompetitions((prev) => prev.map((c) => ({ ...c, registration_open: targetOpen })));

    try {
      const res = await fetch("/api/admin/site-access", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulkCompetitions: { lockAll },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to bulk update competitions.");
      }

      setStatusMessage({
        type: "success",
        text: targetOpen
          ? "All active competitions unlocked and open for participant registration."
          : "All active competitions locked and closed against participant registration.",
      });
    } catch (err: any) {
      console.error("Bulk competitions error:", err);
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to bulk update competition registration.",
      });
    } finally {
      setTogglingCompId(null);
    }
  };

  // Toggle Single Accommodation Option
  const handleToggleAccommodation = async (optionId: string, currentEnabled: boolean) => {
    if (!isPrimary) return;
    const targetEnabled = !currentEnabled;
    setTogglingOptionId(optionId);
    setStatusMessage(null);

    // Optimistic update
    setAccommodationAvailability((prev) => ({
      ...prev,
      [optionId]: targetEnabled,
    }));

    try {
      const res = await fetch("/api/admin/site-access", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toggleAccommodation: { optionId, enabled: targetEnabled },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to toggle accommodation option.");
      }

      const opt = ACCOMMODATION_OPTIONS.find((o) => o.id === optionId);
      setStatusMessage({
        type: "success",
        text: `Accommodation option ${opt?.planName} (${opt?.label}) is now ${targetEnabled ? "available (live)" : "unavailable (locked)"}.`,
      });
    } catch (err: any) {
      console.error("Accommodation option toggle error:", err);
      // Revert optimistic update
      setAccommodationAvailability((prev) => ({
        ...prev,
        [optionId]: currentEnabled,
      }));
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to update accommodation availability.",
      });
    } finally {
      setTogglingOptionId(null);
    }
  };

  // Reset Accommodation to Default Initial Policy
  const handleResetAccommodationToDefault = async () => {
    if (!isPrimary) return;
    setTogglingOptionId("reset");
    setStatusMessage(null);

    // Optimistic update
    setAccommodationAvailability({ ...DEFAULT_ACCOMMODATION_AVAILABILITY });

    try {
      const res = await fetch("/api/admin/site-access", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetAccommodationToDefault: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset accommodation policy.");
      }

      setStatusMessage({
        type: "success",
        text: "Accommodation availability reset to Initial Policy (1-Day 31 Oct & 2-Days 30-31 Oct live; all others locked).",
      });
    } catch (err: any) {
      console.error("Accommodation reset error:", err);
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to reset accommodation availability.",
      });
    } finally {
      setTogglingOptionId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-page-locks-title"
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden overscroll-none bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      style={{ overscrollBehavior: "contain" }}
      data-lenis-prevent="true"
      data-lenis-prevent-wheel="true"
      data-lenis-prevent-touch="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div
        ref={modalCardRef}
        tabIndex={-1}
        className="relative flex flex-col w-full max-w-5xl h-[min(90vh,calc(100dvh-2rem))] max-h-[min(90vh,calc(100dvh-2rem))] rounded-3xl border border-black/10 bg-white shadow-2xl overflow-hidden text-black focus:outline-none"
        style={{ overscrollBehavior: "contain" }}
        data-lenis-prevent="true"
        data-lenis-prevent-wheel="true"
        data-lenis-prevent-touch="true"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 bg-neutral-900 px-6 py-4 sm:px-8 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <ShieldAlert size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="site-page-locks-title" className="text-base font-bold tracking-tight text-white sm:text-lg">
                  Site Page Access &amp; Lock Control
                </h2>
                {isPrimary ? (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/30 uppercase">
                    Primary Master Authority
                  </span>
                ) : (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono text-white/50 border border-white/10 uppercase">
                    Read Only
                  </span>
                )}
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Authoritative page-lock gates and granular availability management for Saviskar 2026.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Global Summary Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 bg-neutral-50 px-6 py-2.5 sm:px-8 shrink-0">
          <div className="flex items-center gap-2 text-xs text-black/60">
            <span className="font-semibold text-black">Module Health:</span>
            <span>All mutations persist atomically to database audit logs.</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 font-mono text-[11px] font-bold text-emerald-800 border border-emerald-500/30">
              {unlockedCount} MODULES LIVE
            </span>
            <span className="rounded-full bg-rose-500/20 px-2.5 py-1 font-mono text-[11px] font-bold text-rose-800 border border-rose-500/30">
              {lockedCount} LOCKED
            </span>
          </div>
        </div>

        {/* Status Alert if any */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 border-b transition ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3.5 sm:px-8 border-b border-black/5 bg-black/[0.015] shrink-0">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/35" />
            <input
              type="text"
              placeholder="Search festival modules or URLs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-black/10 bg-white py-1.5 pl-9 pr-4 text-xs text-black placeholder:text-black/35 outline-none focus:border-black/30"
            />
          </div>

          {isPrimary && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkAction(true)}
                disabled={togglingKey !== null}
                className="flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50 cursor-pointer"
              >
                <Unlock size={13} />
                <span>Unlock All Modules</span>
              </button>
              <button
                type="button"
                onClick={() => handleBulkAction(false)}
                disabled={togglingKey !== null}
                className="flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-800 transition hover:bg-rose-100 disabled:opacity-50 cursor-pointer"
              >
                <Lock size={13} />
                <span>Lock All Modules</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div
          id="site-locks-modal-body"
          ref={scrollBodyRef}
          tabIndex={0}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-5 sm:px-8 space-y-6 focus:outline-none"
          style={{ overscrollBehavior: "contain" }}
          data-lenis-prevent="true"
          data-lenis-prevent-wheel="true"
          data-lenis-prevent-touch="true"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {/* Modules Grid */}
          <div className="grid gap-3.5 sm:grid-cols-2">
            {filteredCards.map((card) => {
              const isUnlocked = locks[card.key] ?? false;
              const isToggling = togglingKey === card.key;
              const CardIcon = card.icon;

              const isRegistrationCard = card.key === "REGISTRATIONS_ENABLED";
              const isAccommodationCard = card.key === "ACCOMMODATION_ENABLED";

              return (
                <div
                  key={card.key}
                  className={`relative flex flex-col justify-between rounded-2xl border p-4 transition ${
                    isUnlocked
                      ? "border-emerald-200 bg-emerald-50/20 hover:border-emerald-300 shadow-xs"
                      : "border-rose-200 bg-rose-50/20 hover:border-rose-300 shadow-xs"
                  }`}
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                            isUnlocked
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          <CardIcon size={16} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-black">{card.name}</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[9px] font-bold text-black/40 uppercase">
                              {card.moduleCode}
                            </span>
                            <span className="text-[9px] text-black/25">·</span>
                            <span className="text-[10px] text-black/50 font-medium">
                              {card.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Live Link */}
                      <a
                        href={card.path}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/5 text-black/50 hover:bg-black/10 hover:text-black transition"
                        title={`View ${card.path} in new tab`}
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>

                    {/* Description */}
                    <p className="mt-2.5 text-xs text-black/60 leading-relaxed">
                      {card.description}
                    </p>

                    {/* Granular Availability Accordion Buttons */}
                    {isRegistrationCard && (
                      <div className="mt-3 pt-2.5 border-t border-black/5">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedSection((prev) =>
                              prev === "competitions" ? "none" : "competitions"
                            )
                          }
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition border cursor-pointer ${
                            expandedSection === "competitions"
                              ? "bg-violet-600 text-white border-violet-700 shadow-xs"
                              : "bg-violet-50 text-violet-900 border-violet-200 hover:bg-violet-100"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <SlidersHorizontal size={13} className={expandedSection === "competitions" ? "text-white" : "text-violet-600"} />
                            <span>Granular Competition Availability</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                                expandedSection === "competitions"
                                  ? "bg-white/20 text-white"
                                  : "bg-violet-200/80 text-violet-800"
                              }`}
                            >
                              {openCompetitionsCount} Open / {lockedCompetitionsCount} Locked
                            </span>
                            {expandedSection === "competitions" ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                          </div>
                        </button>
                      </div>
                    )}

                    {isAccommodationCard && (
                      <div className="mt-3 pt-2.5 border-t border-black/5">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedSection((prev) =>
                              prev === "accommodations" ? "none" : "accommodations"
                            )
                          }
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition border cursor-pointer ${
                            expandedSection === "accommodations"
                              ? "bg-emerald-700 text-white border-emerald-800 shadow-xs"
                              : "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <SlidersHorizontal size={13} className={expandedSection === "accommodations" ? "text-white" : "text-emerald-600"} />
                            <span>Granular Accommodation Availability</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                                expandedSection === "accommodations"
                                  ? "bg-white/20 text-white"
                                  : "bg-emerald-200/80 text-emerald-800"
                              }`}
                            >
                              {activeAccommodationOptionsCount} Available
                            </span>
                            {expandedSection === "accommodations" ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Footer & Toggle Action */}
                  <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                          isUnlocked
                            ? "bg-emerald-100/70 border-emerald-300 text-emerald-800"
                            : "bg-rose-100/70 border-rose-300 text-rose-800"
                        }`}
                      >
                        {isUnlocked ? (
                          <>
                            <Unlock size={11} className="text-emerald-700" />
                            <span>Unlocked (Live)</span>
                          </>
                        ) : (
                          <>
                            <Lock size={11} className="text-rose-700" />
                            <span>Locked (Offline)</span>
                          </>
                        )}
                      </span>
                    </div>

                    {isPrimary ? (
                      <button
                        type="button"
                        onClick={() => handleToggle(card.key, isUnlocked)}
                        disabled={isToggling}
                        className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer ${
                          isUnlocked
                            ? "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                            : "border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        {isToggling ? (
                          <RefreshCw size={13} className="animate-spin text-current" />
                        ) : isUnlocked ? (
                          <>
                            <Lock size={13} />
                            <span>Lock Module</span>
                          </>
                        ) : (
                          <>
                            <Unlock size={13} />
                            <span>Unlock Module</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-[10px] text-black/40 italic">
                        Master required
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* EXPANDED SECTION: COMPETITION AVAILABILITY MANAGEMENT         */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {expandedSection === "competitions" && (
            <div className="rounded-3xl border border-violet-200 bg-violet-50/30 p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-violet-200/60 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white">
                      <SlidersHorizontal size={14} />
                    </div>
                    <h3 className="text-base font-bold text-violet-950">
                      Competition Availability Management
                    </h3>
                    <span className="rounded-full bg-violet-200 px-2.5 py-0.5 font-mono text-[11px] font-bold text-violet-900 border border-violet-300">
                      {competitions.length} Competitions Total
                    </span>
                  </div>
                  <p className="text-xs text-violet-800/70 mt-1">
                    Control participant registration for individual competitions. Closed competitions are non-selectable on /register and rejected by API.
                  </p>
                </div>

                {isPrimary && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBulkCompetitions(false)}
                      disabled={togglingCompId !== null}
                      className="flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition disabled:opacity-50 cursor-pointer"
                    >
                      <Unlock size={12} />
                      <span>Unlock All</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkCompetitions(true)}
                      disabled={togglingCompId !== null}
                      className="flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-100 transition disabled:opacity-50 cursor-pointer"
                    >
                      <Lock size={12} />
                      <span>Lock All</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-xs">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
                  <input
                    type="text"
                    placeholder="Search by name, slug, or category..."
                    value={compSearchQuery}
                    onChange={(e) => setCompSearchQuery(e.target.value)}
                    className="w-full rounded-full border border-black/10 bg-white py-1.5 pl-8 pr-3 text-xs text-black outline-none focus:border-violet-500"
                  />
                </div>

                {/* Category Pills and Reload Action */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={loadSiteState}
                    disabled={competitionsLoading}
                    className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-semibold text-black/70 hover:bg-neutral-100 transition cursor-pointer disabled:opacity-50"
                    title="Refresh competition catalog from database"
                  >
                    <RefreshCw size={11} className={competitionsLoading ? "animate-spin text-violet-600" : ""} />
                    <span>Refresh</span>
                  </button>
                  {competitionCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCompCategoryFilter(cat)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                        compCategoryFilter === cat
                          ? "bg-violet-600 text-white shadow-xs"
                          : "bg-white border border-black/10 text-black/70 hover:bg-neutral-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Competitions Table / List */}
              <div
                id="competitions-scroll-container"
                className="max-h-96 overflow-y-auto overscroll-contain rounded-2xl border border-black/10 bg-white shadow-xs divide-y divide-black/5"
                style={{ overscrollBehavior: "contain" }}
                data-lenis-prevent="true"
                data-lenis-prevent-wheel="true"
                data-lenis-prevent-touch="true"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                {competitionsLoading ? (
                  <div className="p-8 text-center text-xs text-black/50">
                    <RefreshCw size={18} className="animate-spin mx-auto text-violet-600 mb-2" />
                    <span>Loading competition catalog from database...</span>
                  </div>
                ) : competitionsError ? (
                  <div className="p-8 text-center text-xs text-rose-700 bg-rose-50/50 space-y-3">
                    <AlertTriangle size={20} className="mx-auto text-rose-600" />
                    <p className="font-semibold">{competitionsError}</p>
                    <button
                      type="button"
                      onClick={loadSiteState}
                      className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition cursor-pointer shadow-xs"
                    >
                      <RefreshCw size={12} />
                      <span>Retry Loading</span>
                    </button>
                  </div>
                ) : filteredCompetitions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-black/40 space-y-2">
                    <p>
                      {competitions.length === 0
                        ? "No competitions found in database."
                        : "No competitions match the filter criteria."}
                    </p>
                    {competitions.length === 0 ? (
                      <button
                        type="button"
                        onClick={loadSiteState}
                        className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-1 text-xs font-semibold text-black hover:bg-neutral-100 transition cursor-pointer"
                      >
                        <RefreshCw size={12} />
                        <span>Reload Competitions</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setCompSearchQuery("");
                          setCompCategoryFilter("All");
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black hover:bg-neutral-100 transition cursor-pointer"
                      >
                        <span>Clear Filters</span>
                      </button>
                    )}
                  </div>
                ) : (
                  filteredCompetitions.map((comp) => {
                    const isOpen = comp.registration_open !== false;
                    const isTogglingThis = togglingCompId === comp.id;

                    return (
                      <div
                        key={comp.id}
                        className={`flex items-center justify-between gap-3 px-4 py-3 transition ${
                          isOpen ? "hover:bg-neutral-50/60" : "bg-rose-50/30 hover:bg-rose-50/50"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-xs text-black">{comp.name}</span>
                            <span className="rounded-full bg-black/5 px-2 py-0.5 font-mono text-[9px] font-bold text-black/60 uppercase">
                              {comp.category}
                            </span>
                            <span className="rounded-full bg-violet-100 px-2 py-0.5 font-mono text-[9px] text-violet-800">
                              {comp.registration_type === "team"
                                ? `Team (${comp.min_team_size || 1}–${comp.max_team_size || 4})`
                                : "Solo"}
                            </span>
                            <span className="font-mono text-[10px] text-black/50">
                              {comp.payment_type === "paid"
                                ? `₹${comp.registration_fee || 0}`
                                : "Free"}
                            </span>
                          </div>
                          <div className="text-[10px] text-black/40 font-mono mt-0.5 truncate">
                            slug: {comp.slug} · id: {comp.id}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase border ${
                              isOpen
                                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                                : "bg-rose-50 border-rose-300 text-rose-800"
                            }`}
                          >
                            {isOpen ? "Open" : "Locked"}
                          </span>

                          {isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleToggleCompetition(comp.id, isOpen)}
                              disabled={isTogglingThis || togglingCompId !== null}
                              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer ${
                                isOpen
                                  ? "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                                  : "border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                              }`}
                            >
                              {isTogglingThis ? (
                                <RefreshCw size={11} className="animate-spin text-current" />
                              ) : isOpen ? (
                                <>
                                  <Lock size={11} />
                                  <span>Lock</span>
                                </>
                              ) : (
                                <>
                                  <Unlock size={11} />
                                  <span>Unlock</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* EXPANDED SECTION: ACCOMMODATION AVAILABILITY MANAGEMENT       */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {expandedSection === "accommodations" && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/30 p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/60 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-700 text-white">
                      <Bed size={14} />
                    </div>
                    <h3 className="text-base font-bold text-emerald-950">
                      Accommodation Plan &amp; Date Availability Control
                    </h3>
                    <span className="rounded-full bg-emerald-200 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-900 border border-emerald-300">
                      {activeAccommodationOptionsCount} Active / {ACCOMMODATION_OPTIONS.length} Total
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800/80 mt-1">
                    Enable or disable individual accommodation stay options. Initial policy allows only 1-Day (31 Oct) and 2-Days (30–31 Oct).
                  </p>
                </div>

                {isPrimary && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetAccommodationToDefault}
                      disabled={togglingOptionId !== null}
                      className="flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-3 py-1.5 text-xs font-bold text-black hover:bg-neutral-100 transition disabled:opacity-50 cursor-pointer shadow-xs"
                      title="Reset all options to authoritative Initial Policy"
                    >
                      <RotateCcw size={12} />
                      <span>Reset to Initial Policy</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Policy Callout Banner */}
              <div className="rounded-2xl border border-emerald-300/80 bg-white p-3.5 text-xs text-emerald-950 flex items-start gap-2.5 shadow-xs">
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">Initial Policy Specification:</div>
                  <p className="text-emerald-900/80 leading-relaxed">
                    <strong>AVAILABLE:</strong> 1-Day Pass (31 Oct 2026, checkout 1 Nov morning, ₹499) and 2-Days Pass (30–31 Oct 2026, checkout 1 Nov morning, ₹999).<br />
                    <strong>UNAVAILABLE:</strong> All other 1-day dates (27, 28, 29, 30 Oct), all other 2-day dates (28–29 Oct), all 3-day plans, all 4-day plans, and unsupported dates.
                  </p>
                </div>
              </div>

              {/* Options Grid Grouped By Plan */}
              <div className="grid gap-3 sm:grid-cols-2">
                {ACCOMMODATION_OPTIONS.map((opt) => {
                  const isAvailable = Boolean(accommodationAvailability[opt.id]);
                  const isTogglingThis = togglingOptionId === opt.id;

                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition ${
                        isAvailable
                          ? "border-emerald-300 bg-white hover:border-emerald-400 shadow-xs"
                          : "border-black/10 bg-neutral-50/70 hover:border-black/20"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-black">{opt.planName}</span>
                          <span className="font-mono text-[11px] font-bold text-emerald-700">₹{opt.price}</span>
                        </div>
                        <div className="font-semibold text-xs text-black/80 mt-0.5">{opt.label}</div>
                        <div className="text-[10px] text-black/50 leading-relaxed mt-0.5">{opt.description}</div>
                        <div className="text-[9px] font-mono text-black/35 mt-1">key: {opt.id}</div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase border ${
                            isAvailable
                              ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                              : "bg-rose-100 border-rose-300 text-rose-800"
                          }`}
                        >
                          {isAvailable ? "Live (Available)" : "Locked"}
                        </span>

                        {isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleToggleAccommodation(opt.id, isAvailable)}
                            disabled={isTogglingThis || togglingOptionId !== null}
                            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer ${
                              isAvailable
                                ? "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                                : "border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                            }`}
                          >
                            {isTogglingThis ? (
                              <RefreshCw size={11} className="animate-spin text-current" />
                            ) : isAvailable ? (
                              <>
                                <Lock size={11} />
                                <span>Disable</span>
                              </>
                            ) : (
                              <>
                                <Unlock size={11} />
                                <span>Enable</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-black/10 bg-neutral-50 px-6 py-4 sm:px-8 shrink-0">
          <p className="text-[11px] text-black/45">
            Primary Master mutations synchronize atomically via PostgreSQL advisory transaction locks.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-black px-5 py-2 text-xs font-semibold text-white transition hover:scale-[1.02] shadow-sm cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
