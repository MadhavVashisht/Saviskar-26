import type { Metadata } from "next";
import TerminalPlaceholder from "@/components/ui/TerminalPlaceholder";

export const metadata: Metadata = {
  title: "Sponsors & Partners — Decryption in Progress",
  description:
    "Corporate partners, tech sponsors, and associates backing Saviskar 2026 at CGC University, Mohali.",
};

export default function SponsorsPage() {
  return (
    <TerminalPlaceholder
      moduleCode="ALLIES.SYS"
      moduleName="Sponsors & Partners"
      category="PARTNERSHIP PROTOCOL"
      classification="CORPORATE ALLIES // TIER 1 MATRIX"
      estimatedRelease="CORPORATE REVEAL STAGE"
      summary="Title sponsors, technology partners, automotive showcases, and realm titleholders powering the 50+ competitions and stadium headliners at CGC University, Mohali."
    />
  );
}
