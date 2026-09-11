import Navbar from "@/components/ui/Navbar";
import Hero from "@/components/home/Hero";
import Story from "@/components/home/Story";
import About from "@/components/home/About";
import Events from "@/components/home/Events";
import Gallery from "@/components/home/Gallery";
import StarNight from "@/components/home/StarNight";
import RegisterCTA from "@/components/home/RegisterCTA";
import Footer from "@/components/ui/Footer";
import CinematicAtmosphere from "@/components/ui/CinematicAtmosphere";
import Preloader from "@/components/ui/Preloader";

export default function Home() {
  return (
    <main className="relative bg-black text-white selection:bg-white selection:text-black">
      {/* Cinematic Monochrome Preloader */}
      <Preloader />

      {/* Movie-Like Continuous Background Engine */}
      <CinematicAtmosphere />

      {/* Global Glass Navbar */}
      <Navbar />

      {/* Section Narrative Sequence */}
      <div className="relative z-10">
        <Hero />
        <Story />
        <About />
        <Events />
        <Gallery />
        <StarNight />
        <RegisterCTA />
      </div>

      {/* Global Footer */}
      <Footer />
    </main>
  );
}