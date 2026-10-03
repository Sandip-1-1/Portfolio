import type { Destination, Project, SkillGroup, TimelineEntry } from "./types";

export const destinations: Destination[] = [
  { id: "home", title: "Home", worldName: "Arrival Courtyard", shortLabel: "Arrival", description: "Meet Sandip and choose your path through the village.", accent: "#f4c76b", position: { x: 700, y: 500 } },
  { id: "about", title: "About", worldName: "About Hall", shortLabel: "About", description: "Background, education, experience, and the direction ahead.", accent: "#72d6c9", position: { x: 315, y: 275 } },
  { id: "skills", title: "Skills", worldName: "Skills Workshop", shortLabel: "Skills", description: "A practical inventory of tools, disciplines, and proof.", accent: "#83c7ff", position: { x: 1080, y: 285 } },
  { id: "projects", title: "Projects", worldName: "Project Pavilion", shortLabel: "Projects", description: "Live systems, experiments, and works currently being forged.", accent: "#ff8f70", position: { x: 270, y: 730 } },
  { id: "contact", title: "Contact", worldName: "Contact Lodge", shortLabel: "Contact", description: "Open a channel for collaboration, roles, or project ideas.", accent: "#c49cff", position: { x: 1120, y: 735 } },
];

export const projects: Project[] = [
  {
    id: "yatranepal", title: "YatraNepal", type: "Full-stack · Real-time transit", status: "Source available",
    summary: "A real-time public transportation tracker for Kathmandu Valley, built around live vehicle positions and practical route discovery.",
    details: ["Broadcasts vehicle positions over WebSocket every three seconds along real road geometry via OSRM.", "Combines OpenStreetMap and satellite layers, Nominatim search, route filtering, traffic overlays, ETAs, and proximity notifications.", "Models routes from four real Kathmandu Valley transit operators."],
    technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "Drizzle ORM", "WebSocket", "Leaflet", "OSRM"],
    image: "./images/yatraNepalPreview.webp", codeUrl: "https://github.com/Sandip-1-1/YatraNepal",
  },
  {
    id: "tictactoe", title: "Tic-Tac-Toe AI", type: "Python · Game AI", status: "Case study",
    summary: "A terminal game with an unbeatable opponent powered by minimax decision-tree search.",
    details: ["Includes easy random play and an optimal hard mode.", "Uses recursive game-state evaluation and pytest coverage."],
    technologies: ["Python", "Minimax", "Pytest"], image: "./images/tictactoe.png",
  },
  {
    id: "employee-system", title: "Employee Management System", type: "Python · Data management", status: "Case study",
    summary: "A tested terminal application for managing employee records and common administrative operations.",
    details: ["Designed around clear record operations and predictable validation.", "Backed by pytest coverage."],
    technologies: ["Python", "Pytest"], image: "./images/employee management system.png",
  },
  {
    id: "esports", title: "Esports Championship", type: "Leadership · Academic project", status: "Case study",
    summary: "A college-level Mini Militia and PUBG tournament coordinated across multiple teams.",
    details: ["Owned scheduling, rules, logistics, formal reporting, and project documentation."],
    technologies: ["Coordination", "Documentation", "Event operations"],
  },
  {
    id: "private-cloud", title: "Private Cloud Lab", type: "Infrastructure · Self-hosting", status: "In development",
    summary: "An ongoing private-cloud and self-hosting project. A public case study will appear when the work is ready to share safely.",
    details: ["Currently under active development.", "Operational details remain private until the project is complete and sanitized."],
    technologies: ["Self-hosting", "Cloud infrastructure", "Systems learning"],
  },
];

export const skillGroups: SkillGroup[] = [
  { title: "Frontend", skills: ["React", "TypeScript", "JavaScript", "HTML", "CSS"], evidence: "YatraNepal and this interactive portfolio" },
  { title: "Backend", skills: ["Django", "Python", "Node.js / Express", "REST APIs", "WebSocket"], evidence: "Current Django work and YatraNepal services" },
  { title: "Data & AI", skills: ["PostgreSQL", "MySQL", "Schema design", "Minimax", "Applied AI learning"], evidence: "Transit data systems and Tic-Tac-Toe AI" },
  { title: "Infrastructure", skills: ["Hosting", "Deployment", "DNS / SSL", "CI/CD", "Self-hosting"], evidence: "Deployed web work and private-cloud lab" },
  { title: "Tools", skills: ["Git", "GitHub", "Pytest", "Cisco Packet Tracer", "Prompt engineering"], evidence: "Versioned, tested, and deployed projects" },
  { title: "Creative", skills: ["Graphic design", "Video editing", "Technical documentation", "Event coordination"], evidence: "Portfolio production and esports project" },
];

export const timeline: TimelineEntry[] = [
  { period: "Now", title: "Backend Django Developer", description: "Building backend experience while expanding toward full-stack systems, applied AI/ML, game development, and self-hosted infrastructure." },
  { period: "2025–2028", title: "BSc.IT (Hons)", place: "Techspire College · Kathmandu", description: "Undergraduate study in information technology with collaborative academic and practical projects." },
  { period: "2024–2025", title: "+2 Science · GPA 3.81", place: "St. Lawrence College · Kathmandu", description: "Completed Nepal Education Board science studies." },
];

export const certifications = ["CS50: Introduction to Programming with Python — HarvardX", "Design Thinking — Training of Trainers"];

export function destinationById(id: string | null): Destination {
  return destinations.find((item) => item.id === id) ?? destinations[0];
}
