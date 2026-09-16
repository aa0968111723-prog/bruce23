import type { ExperienceConfig } from "../cms/schema.ts";
import type { PublicProject } from "../cms/privacy.ts";
import { mergeExperienceConfig } from "./defaults.ts";

export function resolveExperienceConfig(project: Pick<PublicProject, "slug" | "experienceConfig">): ExperienceConfig {
  return mergeExperienceConfig(project.slug, project.experienceConfig);
}
