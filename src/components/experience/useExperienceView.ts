import { useMemo } from "react";
import { useViewerLocale } from "@/components/site/LocaleProvider";
import type { PublicProject } from "@/lib/cms/privacy";
import { resolveExperienceConfig } from "@/lib/experiences/resolve";
import { overlayExperienceConfig, type ExperienceChrome } from "@/lib/locale/experience";
import type { ExperienceConfig } from "@/lib/cms/schema";
import type { ViewerLang } from "@/lib/locale/view";

export function useExperienceView(project?: Pick<PublicProject, "slug" | "experienceConfig">): {
  lang: ViewerLang;
  ex: ExperienceChrome;
  config: ExperienceConfig;
} {
  const { lang, ex } = useViewerLocale();
  const config = useMemo(
    () => overlayExperienceConfig(project ? resolveExperienceConfig(project) : {}, project?.slug ?? "", lang),
    [project, lang],
  );
  return { lang, ex, config };
}
