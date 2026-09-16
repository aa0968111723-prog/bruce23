import type { ExperienceConfig } from "../cms/schema.ts";
import type { PublicProject } from "../cms/privacy.ts";
import { overlayExperienceConfig } from "../locale/experience.ts";
import type { ViewerLang } from "../locale/view.ts";
import { mergeExperienceConfig } from "./defaults.ts";

export function resolveExperienceConfig(project: Pick<PublicProject, "slug" | "experienceConfig">): ExperienceConfig {
  return mergeExperienceConfig(project.slug, project.experienceConfig);
}

/** Public 「如何運作」tab: saved CMS steps, then experience_config, then catalog process copy. */
function sameSteps(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((step, index) => step === right[index]);
}

export function howItWorksSteps(
  project: Pick<PublicProject, "slug" | "experienceConfig" | "interactionSteps" | "process">,
  lang: ViewerLang = "zh",
): string[] {
  const customized =
    project.interactionSteps.length > 0 && !sameSteps(project.interactionSteps, project.process);
  if (customized) return project.interactionSteps;
  const config = overlayExperienceConfig(resolveExperienceConfig(project), project.slug, lang);
  const walkthrough = config.walkthrough ?? [];
  if (walkthrough.length) {
    return walkthrough.map((step) => {
      const line = step.body?.trim() ? `${step.title}：${step.body}` : step.title;
      return step.path ? `${line}（${step.path}）` : line;
    });
  }
  const nodes = config.processNodes ?? [];
  if (nodes.length) {
    return nodes.map((node) => `${node.label}：${node.summary}`);
  }
  return project.process;
}
