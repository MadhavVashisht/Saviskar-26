import type { Metadata } from "next";
import TerminalPlaceholder from "@/components/ui/TerminalPlaceholder";

export const metadata: Metadata = {
  title: "Festival Legacy — Decryption in Progress",
  description:
    "The historical chronicle of Srijan, Avishkar, and the evolution of Saviskar at CGC University, Mohali.",
};

export default function LegacyPage() {
  return (
    <TerminalPlaceholder
      moduleCode="CHRONICLE.SYS"
      moduleName="Festival Legacy"
      category="HISTORICAL ARCHIVE"
      classification="ORIGINS: SRIJAN × AVISHKAR"
      estimatedRelease="PHASE 3 ARCHIVE SYNC"
      summary="From the creative roots of Srijan to the engineering breakthroughs of Avishkar, through the landmark stages of Saviskar '25 to the waking dreams of Aevorian Reverie in 2026. Unearthing the milestones that forged North India's premier national university festival at CGC University, Mohali."
    />
  );
}
