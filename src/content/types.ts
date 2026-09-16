export type ProjectStatus =
  | "completed"
  | "in-progress"
  | "prototype"
  | "concept"
  | "planned";

export type ProjectCategory =
  | "AI Product"
  | "Multimodal"
  | "Interaction"
  | "Visual AI"
  | "Spatial Design"
  | "Creative Tool"
  | "Real-world Experience";

export type MediaKind = "image" | "video";

export interface ProjectLinks {
  github?: string;
  demo?: string;
  live?: string;
}

export interface ProjectMedia {
  src: string;
  alt: string;
  kind: MediaKind;
  caption?: string;
  poster?: string;
}

export interface SourceReference {
  label: string;
  href?: string;
  note: string;
}

export interface Project {
  slug: string;
  title: string;
  subtitle: string;
  category: ProjectCategory;
  year: string;
  status: ProjectStatus;
  featured: boolean;
  summary: string;
  problem: string;
  role: string;
  decisions: string[];
  modalities: string[];
  process: string[];
  outputs: string[];
  stack: string[];
  limitations: string[];
  links: ProjectLinks;
  media: ProjectMedia[];
  sourceReferences: SourceReference[];
  visibility: "public";
}

export interface ArchiveItem {
  id: string;
  title: string;
  kind:
    | "photography"
    | "graphic"
    | "social"
    | "event"
    | "video"
    | "club-visual"
    | "interactive";
  year: string;
  summary: string;
  media?: ProjectMedia;
  href?: string;
  originNote: string;
}
