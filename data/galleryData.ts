export interface GalleryVideo {
  id: string;
  title: string;
  subtitle: string;
  category: "Anthem & Keynotes" | "Interviews & Talks" | "Behind the Scenes" | "Cinematic" | "Teasers";
  youtubeUrl: string;
  thumbnailUrl: string;
  featured?: boolean;
  dateBadge: string;
  description: string;
}

export interface GalleryImage {
  id: string;
  src: string;
  title: string;
  category: "Main Stage" | "Technical & AI" | "Culture & Arts" | "Showcases" | "Sports" | "Campus" | "Behind the Scenes";
  description: string;
  location?: string;
  featured?: boolean;
  aspectRatio?: "landscape" | "portrait" | "wide";
}

export const YOUTUBE_CHANNEL_META = {
  name: "Saviskar CGC University",
  handle: "@SaviskarCGCU",
  url: "https://www.youtube.com/@SaviskarCGCU",
  channelId: "SaviskarCGCU",
  badge: "Official Festival Broadcast",
  stats: "50+ Realms // 25,000+ Participants // Official 4K Stream",
  description:
    "The official audiovisual chronicles, festival anthems, star night teasers, leadership podcasts, and backstage dispatches from CGC University, Mohali.",
};

export const GALLERY_VIDEOS: GalleryVideo[] = [
  {
    id: "ntViBakZP7w",
    title: "Saviskar Anthem: The Nexus of Next-Gen Tech",
    subtitle: "Official Festival Anthem // Experience the Magic",
    category: "Anthem & Keynotes",
    youtubeUrl: "https://www.youtube.com/watch?v=ntViBakZP7w",
    thumbnailUrl: "https://img.youtube.com/vi/ntViBakZP7w/maxresdefault.jpg",
    featured: true,
    dateBadge: "OFFICIAL ANTHEM",
    description:
      "Step into the sonic universe of Saviskar. High-octane visuals and electric festival rhythm capturing the collective pulse of 25,000+ participants across India.",
  },
  {
    id: "hFJPQ7qG2MY",
    title: "Saviskar Unplugged — Episode 01",
    subtitle: "Prof. (Dr.) Sachin Sharma in Conversation with Aditya Chaudhary",
    category: "Interviews & Talks",
    youtubeUrl: "https://www.youtube.com/watch?v=hFJPQ7qG2MY",
    thumbnailUrl: "https://img.youtube.com/vi/hFJPQ7qG2MY/maxresdefault.jpg",
    featured: true,
    dateBadge: "PODCAST // EP.01",
    description:
      "An in-depth dialogue on the architectural philosophy, administrative rigor, and student empowerment that turn Saviskar into North India's premier techno-cultural phenomenon.",
  },
  {
    id: "0EBARKa3EUA",
    title: "Team Reveal: The Architects of Saviskar",
    subtitle: "Organising Directorate & Student Advisory Council",
    category: "Behind the Scenes",
    youtubeUrl: "https://www.youtube.com/watch?v=0EBARKa3EUA",
    thumbnailUrl: "https://img.youtube.com/vi/0EBARKa3EUA/maxresdefault.jpg",
    featured: false,
    dateBadge: "CORE REVEAL",
    description:
      "Spotlighting the minds behind the spectacle — from the faculty leadership and operations engine to the student core leads powering 50+ festival realms.",
  },
  {
    id: "XwuAVNWB3xM",
    title: "What You Didn't See on Camera | BTS",
    subtitle: "Uncensored Festival Ground Operations",
    category: "Behind the Scenes",
    youtubeUrl: "https://www.youtube.com/watch?v=XwuAVNWB3xM",
    thumbnailUrl: "https://img.youtube.com/vi/XwuAVNWB3xM/maxresdefault.jpg",
    featured: false,
    dateBadge: "BTS EXCLUSIVE",
    description:
      "Late-night lighting rehearsals, adrenaline-fueled coordination desks, green room moments, and the unvarnished camaraderie that makes the festival come alive.",
  },
  {
    id: "vbwvc3LUXwo",
    title: "The Saviskar Vision & Student Legacy",
    subtitle: "Featuring Dean Student Affairs Dr. Sachin Sharma",
    category: "Interviews & Talks",
    youtubeUrl: "https://www.youtube.com/watch?v=vbwvc3LUXwo",
    thumbnailUrl: "https://img.youtube.com/vi/vbwvc3LUXwo/maxresdefault.jpg",
    featured: false,
    dateBadge: "LEADERSHIP",
    description:
      "Exploring how CGC University creates an interdisciplinary launchpad where technology, performance arts, and national student networks converge.",
  },
  {
    id: "MRld-uOkWDU",
    title: "Where Dreams Touch Innovation",
    subtitle: "Aevorian Reverie Cinematic Trailer",
    category: "Cinematic",
    youtubeUrl: "https://www.youtube.com/watch?v=MRld-uOkWDU",
    thumbnailUrl: "https://img.youtube.com/vi/MRld-uOkWDU/maxresdefault.jpg",
    featured: false,
    dateBadge: "CINEMATIC",
    description:
      "A stunning visual odyssey through illuminated campus corridors, laser-sculpted mainstages, and the competitive fire of thousands of visiting delegates.",
  },
  {
    id: "vY4YCcX59NQ",
    title: "11 Days Left: The Excitement Builds",
    subtitle: "Festival Countdown Dispatch",
    category: "Teasers",
    youtubeUrl: "https://www.youtube.com/watch?v=vY4YCcX59NQ",
    thumbnailUrl: "https://img.youtube.com/vi/vY4YCcX59NQ/maxresdefault.jpg",
    featured: false,
    dateBadge: "COUNTDOWN",
    description:
      "T-minus 11 days. The campus transforms into an electric arena as stage constructions begin and registrations cross all prior benchmarks.",
  },
  {
    id: "lCcXElYgDLo",
    title: "12 Days to Go: The Countdown Begins",
    subtitle: "Saviskar Teaser Release",
    category: "Teasers",
    youtubeUrl: "https://www.youtube.com/watch?v=lCcXElYgDLo",
    thumbnailUrl: "https://img.youtube.com/vi/lCcXElYgDLo/maxresdefault.jpg",
    featured: false,
    dateBadge: "COUNTDOWN",
    description:
      "Official launch countdown marking the countdown to unforgettable live concerts, hackathons, and high-intensity campus battles.",
  },
];

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: "crowd",
    src: "/gallery/crowd.webp",
    title: "One Stage. Thousands of Voices.",
    category: "Main Stage",
    description: "Stadium floodlights, pyro sparks, and 25,000+ voices singing in unison under the North Indian night sky.",
    location: "Main Stadium Ground",
    featured: true,
    aspectRatio: "wide",
  },
  {
    id: "concert",
    src: "/gallery/concert.webp",
    title: "Star Night Sonic Surge",
    category: "Main Stage",
    description: "Headline performance reverberating through the amphitheatre with high-output laser projection and stadium acoustics.",
    location: "Grand Amphitheatre",
    featured: true,
    aspectRatio: "landscape",
  },
  {
    id: "technical",
    src: "/gallery/technical.webp",
    title: "Combat Robotics & Autonomous Systems",
    category: "Technical & AI",
    description: "Battlebots clash in reinforced polycarbonate arenas alongside algorithmic hackathons and drone circuits.",
    location: "Tech Pavilion A",
    featured: true,
    aspectRatio: "landscape",
  },
  {
    id: "cultural",
    src: "/gallery/cultural.webp",
    title: "Symphony & Classical Reverie",
    category: "Culture & Arts",
    description: "Inter-college orchestra ensembles, classical recitals, and contemporary acoustic battles under precision spotlights.",
    location: "Sardar Patel Auditorium",
    aspectRatio: "landscape",
  },
  {
    id: "car-show",
    src: "/gallery/car show.webp",
    title: "Automotive & Supercar Showcase",
    category: "Showcases",
    description: "High-horsepower custom builds, exotic performance cars, and university formula racecraft turning heads.",
    location: "South Boulevard",
    aspectRatio: "landscape",
  },
  {
    id: "dance",
    src: "/gallery/dance.webp",
    title: "Stories in Motion: National Crew Clash",
    category: "Culture & Arts",
    description: "Fierce hip-hop, contemporary, and folk dance crews battling for the national Saviskar championship trophy.",
    location: "Open Air Theatre",
    featured: true,
    aspectRatio: "landscape",
  },
  {
    id: "star-1",
    src: "/gallery/star 1.webp",
    title: "Star Night Headline Phenomenon",
    category: "Main Stage",
    description: "Celebrity headline artist takes the stadium into musical orbit with thousands of synchronised phone torches.",
    location: "Main Stage",
    aspectRatio: "landscape",
  },
  {
    id: "gate",
    src: "/gallery/gate.webp",
    title: "Gateway of Aevorian Reverie",
    category: "Campus",
    description: "The monumental illuminated archway welcoming delegations from 500+ colleges across the country.",
    location: "CGC Main Gateway",
    aspectRatio: "landscape",
  },
  {
    id: "sports",
    src: "/gallery/sports.webp",
    title: "Athletic Arena & Court Championships",
    category: "Sports",
    description: "High-stakes inter-university athletic, basketball, and box cricket finals pushed to the final second.",
    location: "Sports Complex",
    aspectRatio: "landscape",
  },
  {
    id: "decor",
    src: "/gallery/decor.webp",
    title: "Cyberpunk Architectural Transformation",
    category: "Campus",
    description: "Interactive neon art installations, volumetric mist corridors, and custom kinetic sculptures across campus.",
    location: "Central Quad",
    aspectRatio: "landscape",
  },
  {
    id: "flash-mob",
    src: "/gallery/flash mob.webp",
    title: "Synchronised Campus Flash Mob",
    category: "Culture & Arts",
    description: "Unannounced 200-member dance takeover in the university square, igniting the festival's opening afternoon.",
    location: "Clock Tower Plaza",
    aspectRatio: "landscape",
  },
  {
    id: "star-2",
    src: "/gallery/star 2.webp",
    title: "Pyro Sparks & Stage Firestorms",
    category: "Main Stage",
    description: "Synchronised CO2 cannons, pyrotechnic fountains, and heavy sub-bass dropping at midnight.",
    location: "Main Stage",
    aspectRatio: "landscape",
  },
  {
    id: "car",
    src: "/gallery/car.webp",
    title: "Machines Meet Cyber Aesthetics",
    category: "Showcases",
    description: "Where engineering horsepower meets contemporary art and automotive innovation.",
    location: "Exhibition Way",
    aspectRatio: "landscape",
  },
  {
    id: "star-3",
    src: "/gallery/star 3.webp",
    title: "The Stadium Chorus",
    category: "Main Stage",
    description: "An ocean of hands in the air as the headline track drops across 50,000 square feet of packed turf.",
    location: "Festival Grounds",
    aspectRatio: "landscape",
  },
  {
    id: "entry",
    src: "/gallery/entry.webp",
    title: "Delegation Arrivals & Accreditations",
    category: "Campus",
    description: "State contingents checking into the hospitality and registration hubs from early dawn.",
    location: "Welcome Concourse",
    aspectRatio: "landscape",
  },
  {
    id: "star-4",
    src: "/gallery/star 4.webp",
    title: "Spotlight Solos & Guitar Duels",
    category: "Main Stage",
    description: "Electrifying live guitar solos piercing through festival mist under cyan and magenta follow-spots.",
    location: "Main Stage",
    aspectRatio: "landscape",
  },
  {
    id: "non-tech",
    src: "/gallery/non tech.webp",
    title: "Strategic Mind Games & Debates",
    category: "Culture & Arts",
    description: "Parliamentary debates, mock stock simulations, gaming tournaments, and visual storytelling competitions.",
    location: "Academic Block 3",
    aspectRatio: "landscape",
  },
  {
    id: "star-5",
    src: "/gallery/star 5.webp",
    title: "Midnight Crescendo",
    category: "Main Stage",
    description: "The legendary final set of Saviskar — unmatched crowd energy that echoes long after the lights dim.",
    location: "Main Stage",
    aspectRatio: "landscape",
  },
  {
    id: "registration",
    src: "/gallery/registration.webp",
    title: "Command Desk & Delegate Kits",
    category: "Behind the Scenes",
    description: "Fast-track biometric badge issuance, delegate welcome kits, and realtime realm roster schedules.",
    location: "Operations Pavilion",
    aspectRatio: "landscape",
  },
  {
    id: "team",
    src: "/gallery/team.webp",
    title: "The Coordinating Force",
    category: "Behind the Scenes",
    description: "Student Advisory Council (SAC) leads and student coordinators who keep the festival clock running smoothly.",
    location: "Festival HQ",
    aspectRatio: "landscape",
  },
  {
    id: "hero",
    src: "/gallery/hero.webp",
    title: "Aevorian Reverie Horizon",
    category: "Campus",
    description: "The panoramic festival grounds set against the golden dusk sky right before Star Night illumination.",
    location: "Main Campus Overview",
    aspectRatio: "wide",
  },
  {
    id: "gallery-1",
    src: "/gallery/gallery-1.webp",
    title: "Phone Lantern Constellation",
    category: "Main Stage",
    description: "A sea of twenty thousand phone flashlights turning the festival ground into a living star field.",
    location: "Main Arena",
    aspectRatio: "landscape",
  },
  {
    id: "gallery-2",
    src: "/gallery/gallery-2.webp",
    title: "Live Graffiti & Kinetic Murals",
    category: "Culture & Arts",
    description: "National fine arts teams creating 20-foot street murals live in front of cheering crowds.",
    location: "Arts Boulevard",
    aspectRatio: "landscape",
  },
  {
    id: "gallery-3",
    src: "/gallery/gallery-3.webp",
    title: "Laser Matrix & Illumination",
    category: "Main Stage",
    description: "Multi-watt aerial laser beams carving geometric ribbons into the night sky above Mohali.",
    location: "Festival Skyway",
    aspectRatio: "landscape",
  },
];

export const PHOTO_CATEGORIES = [
  "All",
  "Main Stage",
  "Technical & AI",
  "Culture & Arts",
  "Showcases",
  "Sports",
  "Campus",
  "Behind the Scenes",
] as const;

export const VIDEO_CATEGORIES = [
  "All",
  "Anthem & Keynotes",
  "Interviews & Talks",
  "Behind the Scenes",
  "Cinematic",
  "Teasers",
] as const;
