import type { PublicProject } from "@/lib/portfolio/types";

export function SourceEvidencePanel({ project }: { project: PublicProject }) {
  return (
    <div className="grid gap-4">
      <div>
        <h3 className="font-display text-lg font-semibold">技術</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {project.stack.map((item) => (
            <li key={item} className="rounded-full bg-surface-mint px-3 py-1.5 text-xs">
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold">來源證據</h3>
        <ul className="mt-2 grid gap-2">
          {project.sourceEvidence.map((item) => (
            <li key={item.label} className="rounded-xl bg-surface-blue px-4 py-3 text-sm">
              {item.href ? (
                <a className="font-medium text-mint-deep" href={item.href} rel="noreferrer" target="_blank">
                  {item.label}
                </a>
              ) : (
                <span className="font-medium">{item.label}</span>
              )}
              <p className="mt-1 text-muted">{item.note}</p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold">限制</h3>
        <ul className="mt-2 grid gap-2">
          {project.limitations.map((item) => (
            <li key={item} className="text-sm text-muted">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
