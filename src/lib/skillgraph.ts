export type Profile = {
  id: string;
  name: string;
  username: string | null;
  headline: string | null;
  bio: string | null;
  country: string | null;
  city: string | null;
  avatar_url: string | null;
  goals: string[];
  experience_level: string | null;
  proof_types: string[];
  opportunity_preferences: string[];
  opportunity_locations: string[];
  reputation_score: number;
  onboarding_complete: boolean;
  created_at: string;
};

export type UserSkill = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  rating: number;
  evidence_count: number;
  verification_count: number;
};

export type Proof = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  media_urls: string[];
  links: string[];
  skills: string[];
  project_type: string;
  verifier_type: string | null;
  verification_status: string;
  appreciations: number;
  created_at: string;
  profiles?: Profile | null;
};

export type Verification = {
  id: string;
  proof_id: string;
  verifier_id: string | null;
  verifier_name: string;
  type: string;
  status: string;
  comment: string | null;
  created_at: string;
};

export type Opportunity = {
  id: string;
  creator_id: string | null;
  organization: string | null;
  title: string;
  description: string;
  required_skills: string[];
  location: string | null;
  remote: boolean;
  compensation: string | null;
  type: string;
  deadline: string | null;
  verified_poster: boolean;
  status: string;
  created_at: string;
  profiles?: Profile | null;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  read: boolean;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
};

export const GOALS = [
  { value: "Find Work", desc: "Find jobs, freelance opportunities and clients." },
  { value: "Build My Skills", desc: "Learn, practice and improve." },
  { value: "Hire Talent", desc: "Find people based on verified ability." },
  { value: "Find Collaborators", desc: "Find people to build projects with." },
  { value: "Mentor Others", desc: "Share knowledge and help people grow." },
];

export const SKILL_CATALOG: Record<string, string[]> = {
  Technology: [
    "Web Development",
    "Mobile Development",
    "Python",
    "JavaScript",
    "React",
    "AI",
    "Data Science",
    "GIS",
    "Cybersecurity",
  ],
  Design: ["UI/UX", "Graphic Design", "Video Editing", "Photography", "3D Design"],
  Business: ["Marketing", "Sales", "Accounting", "Entrepreneurship", "Project Management"],
  "Practical Skills": ["Electrical", "Plumbing", "Construction", "Automotive", "Agriculture", "Mechanical"],
  Creative: ["Writing", "Music", "Art", "Animation", "Teaching"],
};

export const ALL_SKILLS = Object.values(SKILL_CATALOG).flat();

export function skillCategory(skill: string) {
  const entry = Object.entries(SKILL_CATALOG).find(([, list]) => list.includes(skill));
  return entry ? entry[0] : "Other";
}

export const EXPERIENCE_LEVELS = [
  { value: "Beginner", desc: "I'm learning and building my first projects." },
  { value: "Intermediate", desc: "I can independently complete real projects." },
  { value: "Advanced", desc: "I have substantial experience and strong project results." },
  { value: "Expert", desc: "I have extensive professional experience and can mentor others." },
];

export const PROOF_TYPES = [
  "Projects",
  "Portfolio",
  "Client work",
  "Employment experience",
  "Certificates",
  "GitHub / code",
  "University projects",
  "Publications",
  "Competition results",
  "Teaching experience",
  "Community work",
  "I don't have proof yet",
];

export const OPPORTUNITY_PREFERENCES = [
  "Full-time jobs",
  "Freelance projects",
  "Part-time work",
  "Internships",
  "Collaborators",
  "Co-founders",
  "Mentors",
  "Students to mentor",
  "Learning opportunities",
  "Business opportunities",
];

export const OPPORTUNITY_LOCATIONS = [
  "Near me",
  "My city",
  "My country",
  "Anywhere in Africa",
  "Worldwide",
  "Remote only",
];

export const PROJECT_TYPES = [
  "Personal",
  "Academic",
  "Professional",
  "Freelance",
  "Community",
  "Competition",
  "Open source",
];

export const VERIFIER_TYPES = ["Client", "Employer", "Teacher", "Mentor", "Team member", "Community", "Self"];

export const OPPORTUNITY_TYPES = ["Job", "Project", "Collaboration", "Mentorship", "Learning"];

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** Transparent reputation model — reputation is earned, never bought. */
export function reputationBreakdown(input: {
  verifiedProofs: number;
  clientVerifications: number;
  peerVerifications: number;
  completedOpportunities: number;
  skills: number;
}) {
  const rows = [
    { label: "Verified projects", points: input.verifiedProofs * 5 },
    { label: "Client confirmations", points: input.clientVerifications * 4 },
    { label: "Peer verification", points: input.peerVerifications * 3 },
    { label: "Completed opportunities", points: input.completedOpportunities * 5 },
    { label: "Documented skills", points: input.skills * 2 },
  ].filter((r) => r.points > 0);
  const total = Math.min(
    100,
    rows.reduce((sum, r) => sum + r.points, 0),
  );
  return { rows, total };
}

export function profileCompletion(p: Profile | null | undefined, proofCount: number, skillCount: number) {
  if (!p) return 0;
  let score = 0;
  if (p.name) score += 10;
  if (p.city && p.country) score += 10;
  if (p.goals.length) score += 10;
  if (p.experience_level) score += 10;
  if (skillCount) score += 10;
  if (p.opportunity_preferences.length) score += 10;
  if (p.bio) score += 10;
  if (proofCount > 0) score += 20;
  if (proofCount > 2) score += 10;
  return Math.min(100, score);
}
