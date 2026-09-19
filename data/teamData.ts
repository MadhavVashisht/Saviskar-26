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
    | "Corporate & Sponsorship"
    | "Overall"
    | "Bills & Budget"
    | "Website"
    | "Branding"
    | "Creativity"
    | "Sponsorship"
    | "Calling Team";
  tier: "office_bearer" | "core" | "council";
  department: string;
  year?: string;
  image?: string;
  initials?: string;
  contactEmail?: string;
  personDetail?: string;
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

// ==========================================
// EDITORIAL SPREAD CONFIGURATIONS (DIRECTOR & DEAN)
// ==========================================
export interface EditorialSpreadData {
  titleBadge: string;
  deskTitle: string;
  dropCap: string;
  paragraphs: string[];
  signeeName: string;
  signeeRole: string;
  initials?: string;
  image?: string;
}

export const EDITORIAL_DIRECTOR: EditorialSpreadData = {
  titleBadge: "EXECUTIVE PATRON // DIRECTORATE OF STUDENT AFFAIRS",
  deskTitle: "DIRECTOR STUDENTS AFFAIRS",
  dropCap: TIER_1_BYTE.quote.charAt(0),
  paragraphs: [
    TIER_1_BYTE.quote,
    FACULTY_LEADERSHIP[0].bio ||
      "Chief Patron & Executive Director steering institutional vision, student leadership, and holistic university welfare across national platforms.",
  ],
  signeeName: FACULTY_LEADERSHIP[0].name,
  signeeRole: `${FACULTY_LEADERSHIP[0].designation} // Chief Patron, Saviskar 2026`,
  initials: "BD",
  image: "/images/team/bismin-dhaliwal.jpg",
};

export const EDITORIAL_DEAN: EditorialSpreadData = {
  titleBadge: "DEAN LEADERSHIP // FESTIVAL GOVERNANCE",
  deskTitle: "DEAN STUDENT AFFAIRS",
  dropCap: TIER_2_BYTE.quote.charAt(0),
  paragraphs: [
    TIER_2_BYTE.quote,
    FACULTY_DIRECTORATE[0].bio ||
      "Distinguished Academician and Dean supervising council governance, national youth engagement, and festival execution protocols.",
  ],
  signeeName: FACULTY_DIRECTORATE[0].name,
  signeeRole: `${FACULTY_DIRECTORATE[0].designation} // CGC University`,
  initials: "SS",
  image: "/images/team/sachin-sharma.jpg",
};

// ==========================================
// FESTIVAL DIRECTORATE TIERS
// ==========================================
export const LEVEL_3_CULTURAL_DIRECTORATE: FacultyMember[] = [
  {
    ...FACULTY_DIRECTORATE[1], // Mr. Vaibhav Kailey
    image: "/images/team/vaibhav-kailey.jpg",
  },
  {
    ...FACULTY_DIRECTORATE[2], // Mrs. Monika Dhaliwal
    image: "/images/team/monika-dhaliwal.jpg",
  },
];

export const LEVEL_4_OPERATIONS_COMMAND: FacultyMember[] = [
  {
    ...FACULTY_DIRECTORATE[3], // Mr. Anand Kumar
    image: "/images/team/anand-kumar.jpg",
  },
];

// ==========================================
// SAC PRESIDENCY EDITORIAL
// ==========================================
export interface EditorialPresidencyData {
  titleBadge: string;
  dropCap: string;
  paragraphs: string[];
}

export const EDITORIAL_PRESIDENCY: EditorialPresidencyData = {
  titleBadge: "STUDENT ADVISORY COUNCIL // EXECUTIVE PRESIDENCY",
  dropCap: SAC_COLLECTIVE_BYTE.quote.charAt(0),
  paragraphs: [
    SAC_COLLECTIVE_BYTE.quote,
    "Led by Council President Lakshita and Vice President Aadit Bhardwaj, the Student Advisory Council bridges institutional vision with dynamic student energy — commanding seven operational wings and directing the creative, technical, and logistical rhythm of Saviskar 2026.",
    "From stage craft and nationwide outreach to financial governance and digital architecture, this council turns ambition into reality.",
  ],
};

// ==========================================
// SAC OPERATIONAL WINGS & REGIONAL DIRECTORY
// ==========================================
export interface TieredTeam {
  leads: SacMember[];
  core: SacMember[];
  members: SacMember[];
}

export interface SponsorshipTeam {
  leads: SacMember[];
  core?: SacMember[];
  members: SacMember[];
}

export interface StateHeadEntry {
  region: string;
  heads: string;
}

const sacMemberMap = new Map<string, SacMember>(
  ALL_SAC_MEMBERS.map((m) => [m.id, m])
);

function getMember(id: string, overrides?: Partial<SacMember>): SacMember {
  const member = sacMemberMap.get(id);
  if (!member) {
    throw new Error(`SAC Member with ID ${id} not found in canonical dataset`);
  }
  return { ...member, ...overrides };
}

// 01. Overall Heads
export const OVERALL_HEADS: SacMember[] = [
  getMember("sac-ob-lakshita", {
    personDetail: "President",
    wing: "Overall",
  }),
  getMember("sac-ob-aadit-bhardwaj", {
    personDetail: "Vice President",
    wing: "Overall",
  }),
];

// 02. Bills & Budget
export const BILLS_BUDGET_TEAM: SacMember[] = [
  getMember("sac-core-samarth-kumar", {
    personDetail: "Finance & Budget Lead",
    wing: "Bills & Budget",
  }),
  getMember("sac-mem-akshit-sharma", {
    personDetail: "Budget & Audit Member",
    wing: "Bills & Budget",
  }),
];

// 03. Website Team
export const WEBSITE_TEAM: SacMember[] = [
  getMember("sac-core-jashan-jot-singh", {
    personDetail: "Lead Web Architect",
    wing: "Website",
  }),
  getMember("sac-mem-madhav-vashisht", {
    personDetail: "Lead Web Architect",
    wing: "Website",
  }),
];

// 04. Branding Team
export const BRANDING_TEAM: TieredTeam = {
  leads: [
    getMember("sac-core-prabneet-kaur", {
      personDetail: "Branding Lead",
      wing: "Branding",
    }),
    getMember("sac-core-nitin-kumar", {
      personDetail: "Branding Lead",
      wing: "Branding",
    }),
  ],
  core: [
    getMember("sac-core-krishna-jaswal", {
      personDetail: "Branding Core",
      wing: "Branding",
    }),
    getMember("sac-core-chahat", {
      personDetail: "Branding Core",
      wing: "Branding",
    }),
  ],
  members: [
    getMember("sac-mem-ayush-sharma", {
      personDetail: "Media & PR",
      wing: "Branding",
    }),
    getMember("sac-mem-manraj-sharma", {
      personDetail: "Media & PR",
      wing: "Branding",
    }),
    getMember("sac-mem-prianshi", {
      personDetail: "Media & PR",
      wing: "Branding",
    }),
    getMember("sac-mem-yash-sharma", {
      personDetail: "Media & PR",
      wing: "Branding",
    }),
  ],
};

// 05. Creativity Team
export const CREATIVITY_TEAM: TieredTeam = {
  leads: [
    getMember("sac-core-anmol-agarwal", {
      personDetail: "Creative Lead",
      wing: "Creativity",
    }),
    getMember("sac-core-kush-dethliya", {
      personDetail: "Creative Lead",
      wing: "Creativity",
    }),
    getMember("sac-core-prajval-kaur", {
      personDetail: "Creative Lead",
      wing: "Creativity",
    }),
  ],
  core: [
    getMember("sac-core-prince", {
      personDetail: "Creative Core",
      wing: "Creativity",
    }),
    getMember("sac-core-goutam-bajaj", {
      personDetail: "Creative Core",
      wing: "Creativity",
    }),
  ],
  members: [
    getMember("sac-mem-ekta", {
      personDetail: "Design & Stagecraft",
      wing: "Creativity",
    }),
    getMember("sac-mem-muskaan-kalia", {
      personDetail: "Design & Stagecraft",
      wing: "Creativity",
    }),
    getMember("sac-mem-sugandh", {
      personDetail: "Design & Stagecraft",
      wing: "Creativity",
    }),
    getMember("sac-mem-ayushi-bhatia", {
      personDetail: "Cultural & Stage",
      wing: "Creativity",
    }),
    getMember("sac-mem-harshita", {
      personDetail: "Cultural & Stage",
      wing: "Creativity",
    }),
    getMember("sac-mem-megha", {
      personDetail: "Cultural & Stage",
      wing: "Creativity",
    }),
    getMember("sac-mem-muskan", {
      personDetail: "Cultural & Stage",
      wing: "Creativity",
    }),
    getMember("sac-mem-shivani", {
      personDetail: "Cultural & Stage",
      wing: "Creativity",
    }),
    getMember("sac-mem-vani", {
      personDetail: "Cultural & Stage",
      wing: "Creativity",
    }),
  ],
};

// 06. Sponsorship Team
export const SPONSORSHIP_TEAM: SponsorshipTeam = {
  leads: [
    getMember("sac-core-abhay-vishwakarma", {
      personDetail: "Sponsorship Lead",
      wing: "Sponsorship",
    }),
    getMember("sac-core-dhruv-kumar", {
      personDetail: "Sponsorship Lead",
      wing: "Sponsorship",
    }),
  ],
  core: [],
  members: [
    getMember("sac-mem-lakshay", {
      personDetail: "Corporate Outreach",
      wing: "Sponsorship",
    }),
    getMember("sac-mem-mehul-bhati", {
      personDetail: "Corporate Outreach",
      wing: "Sponsorship",
    }),
    getMember("sac-mem-rohan-mishra", {
      personDetail: "Corporate Outreach",
      wing: "Sponsorship",
    }),
  ],
};

// 07. Calling Team
export const CALLING_TEAM: TieredTeam = {
  leads: [
    getMember("sac-core-saaransh-sharma", {
      personDetail: "Calling Team Head",
      wing: "Calling Team",
    }),
    getMember("sac-core-sukhdeep-singh", {
      personDetail: "Calling Team Head",
      wing: "Calling Team",
    }),
  ],
  core: [
    getMember("sac-core-ayush-choudhary", {
      personDetail: "Regional Outreach Core",
      wing: "Calling Team",
    }),
    getMember("sac-core-vinay-verma", {
      personDetail: "Regional Outreach Core",
      wing: "Calling Team",
    }),
    getMember("sac-core-gurkeerat-singh", {
      personDetail: "Regional Outreach Core",
      wing: "Calling Team",
    }),
    getMember("sac-core-avneet-kour", {
      personDetail: "Regional Outreach Core",
      wing: "Calling Team",
    }),
  ],
  members: [
    getMember("sac-mem-deepak-kumar", {
      personDetail: "Delegate Outreach",
      wing: "Calling Team",
    }),
    getMember("sac-mem-gursimran-singh-sidhu", {
      personDetail: "Delegate Outreach",
      wing: "Calling Team",
    }),
    getMember("sac-mem-jatin-kumar", {
      personDetail: "Delegate Outreach",
      wing: "Calling Team",
    }),
    getMember("sac-mem-manjot", {
      personDetail: "Delegate Outreach",
      wing: "Calling Team",
    }),
    getMember("sac-mem-prikishit", {
      personDetail: "Delegate Outreach",
      wing: "Calling Team",
    }),
    getMember("sac-mem-suraj-kumar", {
      personDetail: "Delegate Outreach",
      wing: "Calling Team",
    }),
    getMember("sac-mem-yuvraj", {
      personDetail: "Delegate Outreach",
      wing: "Calling Team",
    }),
    getMember("sac-mem-anmol", {
      personDetail: "Technical & Systems Outreach",
      wing: "Calling Team",
    }),
    getMember("sac-mem-ayush-raj", {
      personDetail: "Technical & Systems Outreach",
      wing: "Calling Team",
    }),
    getMember("sac-mem-himesh-yadav", {
      personDetail: "Technical & Systems Outreach",
      wing: "Calling Team",
    }),
    getMember("sac-mem-krishna-malviya", {
      personDetail: "Technical & Systems Outreach",
      wing: "Calling Team",
    }),
    getMember("sac-mem-nikhil", {
      personDetail: "Technical & Systems Outreach",
      wing: "Calling Team",
    }),
    getMember("sac-mem-rohit-kumar", {
      personDetail: "Technical & Systems Outreach",
      wing: "Calling Team",
    }),
    getMember("sac-mem-vishal", {
      personDetail: "Technical & Systems Outreach",
      wing: "Calling Team",
    }),
  ],
};

// Regional Allocation Directory
export const STATE_HEADS_DIRECTORY: StateHeadEntry[] = [
  { region: "Punjab", heads: "Sukhdeep Singh & Gurkeerat Singh" },
  { region: "Chandigarh / Tricity", heads: "Saaransh Sharma & Anmol Agarwal" },
  { region: "Jammu & Kashmir", heads: "Avneet Kour" },
  { region: "Himachal Pradesh", heads: "Krishna Jaswal & Dhruv Kumar" },
  { region: "Haryana", heads: "Ayush Choudhary & Nitin Kumar" },
  { region: "Delhi NCR", heads: "Abhay Vishwakarma & Chahat" },
  { region: "Rajasthan", heads: "Kush Dethliya & Goutam Bajaj" },
  { region: "Uttar Pradesh", heads: "Vinay Verma & Prince" },
  { region: "Uttarakhand / Rest of India", heads: "Samarth Kumar & Prajval Kaur" },
];
