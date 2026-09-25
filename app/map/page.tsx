import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import ThomsoReplicaMap from "@/components/schedule/ThomsoReplicaMap";

export const metadata: Metadata = {
  title: "Interactive Campus Map — CGC University Mohali | Saviskar 2026",
  description:
    "Interactive 3D aerial grounds map and competition venue guide for Saviskar 2026 at CGC University, Mohali. Locate hackathons, robotics arenas, cultural auditoriums, and concert stadium grounds.",
  openGraph: {
    title: "Campus Grounds Map | Saviskar 2026: Aevorian Reverie",
    description:
      "Hover a venue to fly to it, click to walk into venue schedule. 50+ competitions mapped live across CGC University Mohali campus.",
    images: ["/images/map/cgc-campus-map.jpg"],
  },
};

export default function MapPage() {
  return (
    <main className="w-full h-screen overflow-hidden bg-[#030306]">
      <Navbar />
      <ThomsoReplicaMap />
    </main>
  );
}
