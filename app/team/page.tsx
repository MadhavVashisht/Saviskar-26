import type { Metadata } from "next";
import TerminalPlaceholder from "@/components/ui/TerminalPlaceholder";

export const metadata: Metadata = {
  title: "Organising Team — Decryption in Progress",
  description:
    "Student convenors, core committee members, and coordinators for Saviskar 2026 at CGC University, Mohali.",
};

export default function TeamPage() {
  return (
    <TerminalPlaceholder
      moduleCode="CREW.SYS"
      moduleName="Organising Team"
      category="CORE COMMAND"
      classification="CLEARANCE: CONFIDENTIAL // ROSTER ENCRYPTION"
      estimatedRelease="PRE-FESTIVAL SYNC"
      summary="The roster of faculty convenors, student core directors, technical architects, and realm directors is undergoing final synchronisation before public deployment for Saviskar 2026 at CGC University, Mohali."
    />
  );
}
