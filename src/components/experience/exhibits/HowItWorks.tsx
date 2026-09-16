import type { InteractionStep, PublicProject } from "@/lib/portfolio/types";

export function HowItWorks({ project }: { project: PublicProject }) {
  const steps: InteractionStep[] = project.interactionSteps.length
    ? project.interactionSteps
    : project.process.map((item, i) => ({
        id: `p-${i}`,
        title: `步驟 ${i + 1}`,
        body: item,
      }));
  return (
    <ol className="grid gap-3">
      {steps.map((step, index) => (
        <li key={step.id} className="rounded-2xl bg-surface-blue/80 p-4">
          <p className="text-xs text-mint-deep">{String(index + 1).padStart(2, "0")}</p>
          <h3 className="mt-1 font-display text-lg font-semibold">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed">{step.body}</p>
          {step.githubPath ? <p className="mt-2 text-xs text-muted">GitHub：{step.githubPath}</p> : null}
        </li>
      ))}
    </ol>
  );
}
