export type Artist = {
  year: string;
  artist: string;
  genre: string;
  attendance: string;
  tagline: string;
  image: string;
  featured?: boolean;
};

export const headliners2026: Artist[] = [
  {
    year: "2026",
    artist: "Salim-Sulaiman",
    genre: "Bollywood • Sufi • Live Orchestra",
    attendance: "Expected 45,000+",
    tagline: "Anthems that define generations under one sky.",
    image: "/images/concert-mission-centerstage.jpg",
    featured: true,
  },
  {
    year: "2026",
    artist: "Sunanda Sharma",
    genre: "Punjabi Folk • Contemporary Pop",
    attendance: "Expected 45,000+",
    tagline: "Unmatched Punjabi folk energy lighting up the stage.",
    image: "/images/concert-cultural-stage.jpg",
    featured: true,
  },
  {
    year: "2026",
    artist: "Kushagra Thakur",
    genre: "Indie Rock • Acoustic Singer-Songwriter",
    attendance: "Expected 45,000+",
    tagline: "Intimate melodies echoing across thousands of voices.",
    image: "/images/concert-solution-panoramic.jpg",
    featured: true,
  },
];

export const artists: Artist[] = [
  {
    year: "2025",
    artist: "Salim-Sulaiman • Sunanda Sharma • Kushagra Thakur",
    genre: "Bollywood Symphony • Punjabi Folk • Indie Rock",
    attendance: "25,000+",
    tagline: "The legendary headline trio that illuminated Saviskar '25.",
    image: "/images/gallery-1.jpg",
  },
  {
    year: "2024",
    artist: "R Nait",
    genre: "Punjabi Hip-Hop & Folk",
    attendance: "20,000+",
    tagline: "Every voice in the stadium sang in unison.",
    image: "/images/gallery-2.jpg",
  },
  {
    year: "2023",
    artist: "Jass Manak",
    genre: "Punjabi Pop",
    attendance: "18,000+",
    tagline: "The crowd sang every word.",
    image: "/images/gallery-3.jpg",
  },
];