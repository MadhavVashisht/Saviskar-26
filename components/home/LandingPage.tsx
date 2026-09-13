"use client";

import Preloader from "@/components/ui/Preloader";
import ScrollEngine3D from "@/components/ui/ScrollEngine3D";
import Navbar from "@/components/ui/Navbar";
import Hero from "@/components/home/Hero";
import Story from "@/components/home/Story";
import About from "@/components/home/About";
import GalleryGlimpse from "@/components/home/GalleryGlimpse";
import Footer from "@/components/ui/Footer";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Cinematic Progressive Color Preloader */}
      <Preloader />

      {/* Real-time 3D WebGL Scroll Engine scrubbing interrelated 8K stadium & fireworks moments */}
      <ScrollEngine3D />

      {/* Full-Screen Scattered Cards Holographic Navigation Constellation */}
      <Navbar />

      {/* Landing Page Narrative Flow: Strictly Hero, Story, About, Gallery Glimpse */}
      <div className="relative z-10">
        {/* 1. Hero Section: Stadium Illumination */}
        <Hero />

        {/* 2. Story Board: Origin narrative (strictly untouched) */}
        <Story />

        {/* 3. About Section: Mission, Countdown & Live Metrics */}
        <About />

        {/* 4. Gallery Glimpse: Visual Archive with Explore Complete Gallery Action */}
        <GalleryGlimpse />
      </div>

      {/* 5. Verified CGC University Mohali Footer */}
      <Footer />
    </main>
  );
}
