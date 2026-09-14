export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  tier: "tier1" | "tier2";
  image?: string;
  bio?: string;
  quote?: string;
  honorific?: string;
  badges: string[];
}

export interface SacMember {
  id: string;
  name: string;
  role: string;
  wing:
    | "Office Bearers"
    | "Core Committee"
    | "Technical & AI"
    | "Cultural & Stage"
    | "Media & PR"
    | "Logistics & Hospitality"
    | "Creative & Design"
    | "Corporate & Sponsorship";
  tier: "office_bearer" | "core" | "council";
  department: string;
  year?: string;
  image?: string;
  initials?: string;
  contactEmail?: string;
}

export interface QuoteByte {
  tierLabel: string;
  quote: string;
  attribution: string;
  designation: string;
}

export const TIER_1_BYTE: QuoteByte = {
  tierLabel: "EXECUTIVE PATRON BYTE",
  quote:
    "Saviskar 2026 is a celebration of fearless imagination, youthful tenacity, and intellectual wonder. When 25,000+ passionate students converge at CGC University, Mohali, tomorrow begins to exist.",
  attribution: "Mrs. Bismin Dhaliwal",
  designation: "Director Students Affairs // Chief Patron, Saviskar 2026",
};

export const TIER_2_BYTE: QuoteByte = {
  tierLabel: "DEAN & CULTURAL DIRECTORATE OPERATIONS BYTE",
  quote:
    "From grand illuminated arena stages to seamless campus logistics, our mission is to craft an electrifying, world-class festival experience that sets a gold standard for university techno-cultural fests nationwide.",
  attribution: "Dr. Sachin Sharma & Cultural Directorate",
  designation: "Dean Student Affairs & Department of Arts, Culture & Fest Operations",
};

export const SAC_COLLECTIVE_BYTE: QuoteByte = {
  tierLabel: "STUDENT ADVISORY COUNCIL (SAC) COLLECTIVE MANIFESTO",
  quote:
    "From initial sketches to the roaring stadium crowd, we are the student builders, creators, and organizers of Aevorian Reverie. Welcome to our university, our festival, and an experience built by students, for students.",
  attribution: "Student Advisory Council (SAC)",
  designation: "Student Architects & Committee Leads // Saviskar 2026 Organizing Council",
};

// ==========================================
// TIER 1: APEX EXECUTIVE LEADERSHIP (BISMIN MAM)
// ==========================================
export const FACULTY_LEADERSHIP: FacultyMember[] = [
  {
    id: "dir-bismin-dhaliwal",
    name: "Mrs. Bismin Dhaliwal",
    honorific: "DIRECTOR STUDENTS AFFAIRS",
    designation: "Director Students Affairs",
    department: "Directorate of Student Affairs, CGC University",
    tier: "tier1",
    bio: "Chief Patron & Executive Director steering institutional vision, student leadership, and holistic university welfare across national platforms.",
    badges: ["Apex Leadership", "Patron-in-Chief", "Student Welfare", "CGC Directorate"],
    image: "", // Placeholder for future image upload
  },
];

// ==========================================
// TIER 2: DEAN & CULTURAL DIRECTORATE (DR. SACHIN SHARMA & TEAM)
// ==========================================
export const FACULTY_DIRECTORATE: FacultyMember[] = [
  {
    id: "dean-sachin-sharma",
    name: "Dr. Sachin Sharma",
    honorific: "DEAN STUDENT AFFAIRS",
    designation: "Dean Student Affairs",
    department: "Department of Student Affairs, CGC University",
    tier: "tier2",
    bio: "Distinguished Academician and Dean supervising council governance, national youth engagement, and festival execution protocols.",
    badges: ["Dean Leadership", "Council Governance", "Academic Patron"],
    image: "", // Placeholder for future image upload
  },
  {
    id: "ad-vaibhav-kailey",
    name: "Mr. Vaibhav Kailey",
    honorific: "ASSISTANT DIRECTOR CULTURAL",
    designation: "Assistant Director Cultural",
    department: "Department of Cultural Affairs & Student Development",
    tier: "tier2",
    bio: "Head curator of cultural showcases, national fine arts competitions, and headline stadium concert production.",
    badges: ["Cultural Command", "Production Lead", "Stage Director"],
    image: "", // Placeholder for future image upload
  },
  {
    id: "mgr-monika-dhaliwal",
    name: "Mrs. Monika Dhaliwal",
    honorific: "MANAGER ARTS AND CULTURE",
    designation: "Manager Arts and Culture",
    department: "Centre for Performing Arts, CGC University",
    tier: "tier2",
    bio: "Directing multi-genre artistic curation, theatrical productions, and national festival fine arts pavilions.",
    badges: ["Arts & Culture", "Curatorial Lead", "Creative Direction"],
    image: "", // Placeholder for future image upload
  },
  {
    id: "off-anand-kumar",
    name: "Mr. Anand Kumar",
    honorific: "OFFICE INCHARGE",
    designation: "Office Incharge",
    department: "Student Affairs Administration & Central Operations",
    tier: "tier2",
    bio: "Central administrative controller managing institutional authorizations, infrastructure coordination, and festival logistical clearance.",
    badges: ["Central Admin", "Logistics Controller", "Operations Command"],
    image: "", // Placeholder for future image upload
  },
];

// ==========================================
// TIER 3: SAC OFFICE BEARERS (PRESIDENT & VICE PRESIDENT)
// ==========================================
export const SAC_OFFICE_BEARERS: SacMember[] = [
  {
    id: "sac-ob-lakshita",
    name: "Lakshita",
    role: "President, Student Advisory Council",
    wing: "Office Bearers",
    tier: "office_bearer",
    department: "Student Advisory Council",
    year: "Executive Head",
    initials: "LK",
    image: "",
  },
  {
    id: "sac-ob-aadit-bhardwaj",
    name: "Aadit Bhardwaj",
    role: "Vice President, Student Advisory Council",
    wing: "Office Bearers",
    tier: "office_bearer",
    department: "Student Advisory Council",
    year: "Executive Head",
    initials: "AB",
    image: "",
  },
];

// ==========================================
// TIER 4: SAC CORE MEMBERS (19 MEMBERS)
// ==========================================
export const SAC_CORE_LEADS: SacMember[] = [
  {
    id: "sac-core-abhay-vishwakarma",
    name: "Abhay Vishwakarma",
    role: "Core Member, Student Advisory Council",
    wing: "Core Committee",
    tier: "core",
    department: "Student Advisory Council",
    initials: "AV",
    image: "",
  },
  {
    id: "sac-core-anmol-agarwal",
    name: "Anmol Agarwal",
    role: "Core Member, Student Advisory Council",
    wing: "Core Committee",
    tier: "core",
    department: "Student Advisory Council",
    initials: "AA",
    image: "",
  },
  {
    id: "sac-core-avneet-kour",
    name: "Avneet Kour",
    role: "Core Member, Student Advisory Council",
    wing: "Core Committee",
    tier: "core",
    department: "Student Advisory Council",
    initials: "AK",
    image: "",
  },
  {
    id: "sac-core-ayush-choudhary",
    name: "Ayush Choudhary",
    role: "Core Member, Student Advisory Council",
    wing: "Core Committee",
    tier: "core",
    department: "Student Advisory Council",
    initials: "AC",
    image: "",
  },
  {
    id: "sac-core-chahat",
    name: "Chahat",
    role: "Core Member, Student Advisory Council",
    wing: "Core Committee",
    tier: "core",
    department: "Student Advisory Council",
    initials: "CH",
    image: "",
  },
  {
    id: "sac-core-dhruv-kumar",
    name: "Dhruv Kumar",
    role: "Core Member, Student Advisory Council",
    wing: "Core Committee",
    tier: "core",
    department: "Student Advisory Council",
    initials: "DK",
    image: "",
  },
  {
    id: "sac-core-goutam-bajaj",
    name: "Goutam Bajaj",
    role: "Core Member, Student Advisory Council",
    wing: "Core Committee",
    tier: "core",
    department: "Student Advisory Council",
    initials: "GB",
    image: "",
  },
  {
    id: "sac-core-gurkeerat-singh",
    name: "Gurkeerat Singh",
    role: "Core Member, Student Advisory Council",
    wing: "Core Committee",
    tier: "core",
    department: "Student Advisory Council",
    initials: "GS",
    image: "",
  },
  {
    id: "sac-core-jashan-jot-singh",
    name: "Jashan Jot Singh",
    role: "Core Member, Student Advisory Council",
    wing: "Core Committee",
    tier: "core",
    department: "Student Advisory Council",
    initials: "JJ",
    image: "",
  },
  {
    id: "sac-core-krishna-jaswal",
    name: "Krishna Jaswal",
    role: "Core Member, Student Advisory Council",
    wing: "Core Committee",
    tier: "core",
    department: "Student Advisory Council",
    initials: "KJ",
    image: "",
  },
  {
    id: "sac-core-kush-dethliya",
    name: "Kush Dethliya",
    role: "Core Member, Student Advisory Council",
    wing: "Core Committee",
    tier: "core",
    department: "Student Advisory Council",
    initials: "KD",
    image: "",
  },
  {
    id: "sac-core-nitin-kumar",
    name: "Nitin Kumar",
    role: "Core Member, Student Advisory Council",
    wing: "Core Committee",
    tier: "core",
    department: "Student Advisory Council",
    initials: "NK",
    image: "",
  },
  {
    id: "sac-core-prabneet-kaur",
    name: "Prabneet Kaur",
    role: "Core Member, Student Advisory Council",
    wing: "Core Committee",
    tier: "core",
    department: "Student Advisory Council",
    initials: "PK",
    image: "",
  },
  {
    id: "sac-core-prajval-kaur",
    name: "Prajval Kaur",
    role: "Core Member, Student Advisory Council",
    wing: "Core Committee",
    tier: "core",
    department: "Student Advisory Council",
    initials: "PK",
    image: "",
  },
  {
    id: "sac-core-prince",
    name: "Prince",
    role: "Core Member, Student Advisory Council",
    wing: "Core Committee",
    tier: "core",
    department: "Student Advisory Council",
    initials: "PR",
    image: "",
  },
  {
    id: "sac-core-saaransh-sharma",
    name: "Saaransh Sharma",
    role: "Core Member, Student Advisory Council",
    wing: "Core Committee",
    tier: "core",
    department: "Student Advisory Council",
    initials: "SS",
    image: "",
  },
  {
    id: "sac-core-samarth-kumar",
    name: "Samarth Kumar",
    role: "Core Member, Student Advisory Council",
    wing: "Core Committee",
    tier: "core",
    department: "Student Advisory Council",
    initials: "SK",
    image: "",
  },
  {
    id: "sac-core-sukhdeep-singh",
    name: "Sukhdeep Singh",
    role: "Core Member, Student Advisory Council",
    wing: "Core Committee",
    tier: "core",
    department: "Student Advisory Council",
    initials: "SS",
    image: "",
  },
  {
    id: "sac-core-vinay-verma",
    name: "Vinay Verma",
    role: "Core Member, Student Advisory Council",
    wing: "Core Committee",
    tier: "core",
    department: "Student Advisory Council",
    initials: "VV",
    image: "",
  },
];

// ==========================================
// TIER 5: SAC COUNCIL MEMBERS (32 MEMBERS)
// ==========================================
export const SAC_COUNCIL_MEMBERS: SacMember[] = [
  {
    id: "sac-mem-akshit-sharma",
    name: "Akshit Sharma",
    role: "Council Member, SAC",
    wing: "Logistics & Hospitality",
    tier: "council",
    department: "Student Advisory Council",
    initials: "AS",
    image: "",
  },
  {
    id: "sac-mem-anmol",
    name: "Anmol",
    role: "Council Member, SAC",
    wing: "Technical & AI",
    tier: "council",
    department: "Student Advisory Council",
    initials: "AN",
    image: "",
  },
  {
    id: "sac-mem-ayush-raj",
    name: "Ayush Raj",
    role: "Council Member, SAC",
    wing: "Technical & AI",
    tier: "council",
    department: "Student Advisory Council",
    initials: "AR",
    image: "",
  },
  {
    id: "sac-mem-ayush-sharma",
    name: "Ayush Sharma",
    role: "Council Member, SAC",
    wing: "Media & PR",
    tier: "council",
    department: "Student Advisory Council",
    initials: "AS",
    image: "",
  },
  {
    id: "sac-mem-ayushi-bhatia",
    name: "Ayushi Bhatia",
    role: "Council Member, SAC",
    wing: "Cultural & Stage",
    tier: "council",
    department: "Student Advisory Council",
    initials: "AB",
    image: "",
  },
  {
    id: "sac-mem-deepak-kumar",
    name: "Deepak Kumar",
    role: "Council Member, SAC",
    wing: "Logistics & Hospitality",
    tier: "council",
    department: "Student Advisory Council",
    initials: "DK",
    image: "",
  },
  {
    id: "sac-mem-ekta",
    name: "Ekta",
    role: "Council Member, SAC",
    wing: "Creative & Design",
    tier: "council",
    department: "Student Advisory Council",
    initials: "EK",
    image: "",
  },
  {
    id: "sac-mem-gursimran-singh-sidhu",
    name: "Gursimran Singh Sidhu",
    role: "Council Member, SAC",
    wing: "Logistics & Hospitality",
    tier: "council",
    department: "Student Advisory Council",
    initials: "GS",
    image: "",
  },
  {
    id: "sac-mem-harshita",
    name: "Harshita",
    role: "Council Member, SAC",
    wing: "Cultural & Stage",
    tier: "council",
    department: "Student Advisory Council",
    initials: "HR",
    image: "",
  },
  {
    id: "sac-mem-himesh-yadav",
    name: "Himesh Yadav",
    role: "Council Member, SAC",
    wing: "Technical & AI",
    tier: "council",
    department: "Student Advisory Council",
    initials: "HY",
    image: "",
  },
  {
    id: "sac-mem-jatin-kumar",
    name: "Jatin Kumar",
    role: "Council Member, SAC",
    wing: "Logistics & Hospitality",
    tier: "council",
    department: "Student Advisory Council",
    initials: "JK",
    image: "",
  },
  {
    id: "sac-mem-krishna-malviya",
    name: "Krishna Malviya",
    role: "Council Member, SAC",
    wing: "Technical & AI",
    tier: "council",
    department: "Student Advisory Council",
    initials: "KM",
    image: "",
  },
  {
    id: "sac-mem-lakshay",
    name: "Lakshay",
    role: "Council Member, SAC",
    wing: "Corporate & Sponsorship",
    tier: "council",
    department: "Student Advisory Council",
    initials: "LK",
    image: "",
  },
  {
    id: "sac-mem-madhav-vashisht",
    name: "Madhav Vashisht",
    role: "Council Member, SAC",
    wing: "Technical & AI",
    tier: "council",
    department: "Student Advisory Council",
    initials: "MV",
    image: "",
  },
  {
    id: "sac-mem-manjot",
    name: "Manjot",
    role: "Council Member, SAC",
    wing: "Logistics & Hospitality",
    tier: "council",
    department: "Student Advisory Council",
    initials: "MJ",
    image: "",
  },
  {
    id: "sac-mem-manraj-sharma",
    name: "Manraj Sharma",
    role: "Council Member, SAC",
    wing: "Media & PR",
    tier: "council",
    department: "Student Advisory Council",
    initials: "MS",
    image: "",
  },
  {
    id: "sac-mem-megha",
    name: "Megha",
    role: "Council Member, SAC",
    wing: "Cultural & Stage",
    tier: "council",
    department: "Student Advisory Council",
    initials: "MG",
    image: "",
  },
  {
    id: "sac-mem-mehul-bhati",
    name: "Mehul Bhati",
    role: "Council Member, SAC",
    wing: "Corporate & Sponsorship",
    tier: "council",
    department: "Student Advisory Council",
    initials: "MB",
    image: "",
  },
  {
    id: "sac-mem-muskaan-kalia",
    name: "Muskaan Kalia",
    role: "Council Member, SAC",
    wing: "Creative & Design",
    tier: "council",
    department: "Student Advisory Council",
    initials: "MK",
    image: "",
  },
  {
    id: "sac-mem-muskan",
    name: "Muskan",
    role: "Council Member, SAC",
    wing: "Cultural & Stage",
    tier: "council",
    department: "Student Advisory Council",
    initials: "MS",
    image: "",
  },
  {
    id: "sac-mem-nikhil",
    name: "Nikhil",
    role: "Council Member, SAC",
    wing: "Technical & AI",
    tier: "council",
    department: "Student Advisory Council",
    initials: "NK",
    image: "",
  },
  {
    id: "sac-mem-prianshi",
    name: "Prianshi",
    role: "Council Member, SAC",
    wing: "Media & PR",
    tier: "council",
    department: "Student Advisory Council",
    initials: "PR",
    image: "",
  },
  {
    id: "sac-mem-prikishit",
    name: "Prikishit",
    role: "Council Member, SAC",
    wing: "Logistics & Hospitality",
    tier: "council",
    department: "Student Advisory Council",
    initials: "PK",
    image: "",
  },
  {
    id: "sac-mem-rohan-mishra",
    name: "Rohan Mishra",
    role: "Council Member, SAC",
    wing: "Corporate & Sponsorship",
    tier: "council",
    department: "Student Advisory Council",
    initials: "RM",
    image: "",
  },
  {
    id: "sac-mem-rohit-kumar",
    name: "Rohit Kumar",
    role: "Council Member, SAC",
    wing: "Technical & AI",
    tier: "council",
    department: "Student Advisory Council",
    initials: "RK",
    image: "",
  },
  {
    id: "sac-mem-shivani",
    name: "Shivani",
    role: "Council Member, SAC",
    wing: "Cultural & Stage",
    tier: "council",
    department: "Student Advisory Council",
    initials: "SH",
    image: "",
  },
  {
    id: "sac-mem-sugandh",
    name: "Sugandh",
    role: "Council Member, SAC",
    wing: "Creative & Design",
    tier: "council",
    department: "Student Advisory Council",
    initials: "SG",
    image: "",
  },
  {
    id: "sac-mem-suraj-kumar",
    name: "Suraj Kumar",
    role: "Council Member, SAC",
    wing: "Logistics & Hospitality",
    tier: "council",
    department: "Student Advisory Council",
    initials: "SK",
    image: "",
  },
  {
    id: "sac-mem-vani",
    name: "Vani",
    role: "Council Member, SAC",
    wing: "Cultural & Stage",
    tier: "council",
    department: "Student Advisory Council",
    initials: "VN",
    image: "",
  },
  {
    id: "sac-mem-vishal",
    name: "Vishal",
    role: "Council Member, SAC",
    wing: "Technical & AI",
    tier: "council",
    department: "Student Advisory Council",
    initials: "VS",
    image: "",
  },
  {
    id: "sac-mem-yash-sharma",
    name: "Yash Sharma",
    role: "Council Member, SAC",
    wing: "Media & PR",
    tier: "council",
    department: "Student Advisory Council",
    initials: "YS",
    image: "",
  },
  {
    id: "sac-mem-yuvraj",
    name: "Yuvraj",
    role: "Council Member, SAC",
    wing: "Logistics & Hospitality",
    tier: "council",
    department: "Student Advisory Council",
    initials: "YV",
    image: "",
  },
];

// All SAC members combined (Office Bearers + Core Members + Council Members)
export const ALL_SAC_MEMBERS: SacMember[] = [
  ...SAC_OFFICE_BEARERS,
  ...SAC_CORE_LEADS,
  ...SAC_COUNCIL_MEMBERS,
];

// Stats Summary
export const TEAM_STATS = {
  facultyTier1Count: FACULTY_LEADERSHIP.length, // 1 (Bismin Mam)
  facultyTier2Count: FACULTY_DIRECTORATE.length, // 4 (Sachin Sir, Vaibhav Sir, Monika Mam, Anand Sir)
  totalFacultyCount: FACULTY_LEADERSHIP.length + FACULTY_DIRECTORATE.length, // 5
  sacOfficeBearersCount: SAC_OFFICE_BEARERS.length, // 2 (Lakshita [President], Aadit Bhardwaj [Vice President])
  sacCoreLeadsCount: SAC_CORE_LEADS.length, // 19 (Remaining Core Members)
  totalCoreTeamCount: SAC_OFFICE_BEARERS.length + SAC_CORE_LEADS.length, // 21 (All Core Members)
  sacCouncilMembersCount: SAC_COUNCIL_MEMBERS.length, // 32 (Council Members)
  totalSacCount: ALL_SAC_MEMBERS.length, // 53 (Total SAC Members)
  totalOrganisingTeamCount:
    FACULTY_LEADERSHIP.length +
    FACULTY_DIRECTORATE.length +
    ALL_SAC_MEMBERS.length, // 58
};
