import { createFileRoute, notFound } from "@tanstack/react-router";
import { CaseStudyView } from "@/components/work/CaseStudyView";
import { NotFoundView } from "@/components/site/NotFoundView";
import { getPublishedProjectFn, listPublishedProjectsFn } from "@/lib/cms/public-fn";
import { NotFoundError } from "@/lib/cms/errors";
import type { PublicProject } from "@/lib/cms/privacy";

export const Route = createFileRoute("/work/$slug")({
  loader: async ({ params }): Promise<{ project: PublicProject; others: PublicProject[] }> => {
    try {
      const [project, all] = await Promise.all([
        getPublishedProjectFn({ data: { slug: params.slug } }),
        listPublishedProjectsFn(),
      ]);
      const published = all as PublicProject[];
      const current = project as PublicProject;
      return { project: current, others: published.filter((item) => item.slug !== current.slug).slice(0, 3) };
    } catch (err) {
      if (err instanceof NotFoundError || (err instanceof Error && err.message.includes("找不到"))) {
        throw notFound();
      }
      throw err;
    }
  },
  head: ({ loaderData }) => {
    const project = loaderData?.project;
    if (!project) return {};
    return {
      meta: [
        { title: project.seoTitle || `${project.title} · 柏能` },
        { name: "description", content: project.seoDescription || project.summary },
      ],
    };
  },
  notFoundComponent: NotFoundView,
  component: CaseStudy,
});

function CaseStudy() {
  const { project, others } = Route.useLoaderData() as {
    project: PublicProject;
    others: PublicProject[];
  };
  return <CaseStudyView project={project} others={others} />;
}
