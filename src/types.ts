export type DestinationId = "home" | "about" | "skills" | "projects" | "contact";
export type ThemeMode = "auto" | "day" | "night";
export type VisitMode = "tour" | "explore";

export interface Destination {
  id: DestinationId;
  title: string;
  worldName: string;
  shortLabel: string;
  description: string;
  accent: string;
  position: { x: number; y: number };
}

export interface Project {
  id: string;
  title: string;
  type: string;
  status?: "Live" | "Source available" | "Case study" | "In development";
  summary: string;
  details: string[];
  technologies: string[];
  image?: string;
  liveUrl?: string;
  codeUrl?: string;
}

export interface SkillGroup { title: string; skills: string[]; evidence: string; }
export interface TimelineEntry { period: string; title: string; place?: string; description: string; }
export interface DialogueNode { id: string; speaker: string; message: string; options?: DestinationId[]; }
export interface NavigationState { current: DestinationId; visited: DestinationId[]; mode: VisitMode; }
export interface UserPreferences { theme: ThemeMode; sound: boolean; reducedEffects: boolean; returning: boolean; lastVisited: DestinationId; visited: DestinationId[]; musicVolume: number; natureVolume: number; sfxVolume: number; }

export interface GameEvents {
  enter: { destination: DestinationId; source: "portal" | "teleport" };
  proximity: { destination: DestinationId | null };
}
