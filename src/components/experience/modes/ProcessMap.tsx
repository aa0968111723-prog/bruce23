import { useMemo, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/prefers-reduced";
import type { PublicProject } from "@/lib/cms/privacy";
import { githubBlobUrl } from "@/lib/github/parse";
import { useRovingTabs } from "@/components/site/useRovingTabs";
import { joinSentences, labeledLine } from "@/lib/locale/experience";
import { useExperienceView } from "../useExperienceView";

type Cut = {
  projectName: string;
  worldview: string;
  assets: string[];
  generated: string | null;
  shots: string[];
  review: "draft" | "approved" | "rejected";
  pack: string | null;
};

const EMPTY_CUT: Cut = {
  projectName: "",
  worldview: "",
  assets: [],
  generated: null,
  shots: ["鏡頭 A · 角色進場", "鏡頭 B · 對白", "鏡頭 C · 收束"],
  review: "draft",
  pack: null,
};

const SAMPLE_ASSETS = ["角色卡", "場景卡", "世界觀禁語"] as const;

export function ProcessMap({ project }: { project: PublicProject }) {
  const { lang, ex, config } = useExperienceView(project);
  const nodes = config.processNodes ?? [];
  const ids = nodes.map((node) => node.id);
  const [active, setActive] = useState(nodes[0]?.id ?? "");
  const [cut, setCut] = useState<Cut>(EMPTY_CUT);
  const current = nodes.find((node) => node.id === active) ?? nodes[0];
  const owner = project.github.owner;
  const repo = project.github.repo;
  const branch = project.github.branch ?? "main";
  const reduced = usePrefersReducedMotion();
  const tabs = useRovingTabs(ids, (active || ids[0] || "") as string, setActive);
  const assetChoices = useMemo(
    () => (lang === "en" ? ["Character card", "Scene card", "Worldview bans"] : [...SAMPLE_ASSETS]),
    [lang],
  );

  if (!nodes.length) {
    return <p className="text-sm text-muted">{ex.emptyNodes}</p>;
  }

  const width = Math.max(320, nodes.length * 92);

  return (
    <div>
      <p className="text-sm text-muted">
        {joinSentences(config.intro ?? ex.processDefaultIntro, ex.processKeyboard)}
      </p>
      <svg
        viewBox={`0 0 ${width} 78`}
        className="mt-4 w-full min-w-0 max-w-full"
        role="img"
        aria-label={ex.processPipelineAria}
        data-process-pipeline="true"
      >
        <rect width={width} height="78" className="fill-surface-blue" rx="16" />
        {nodes.map((node, index) => {
          const x = 46 + index * 92;
          const selected = current?.id === node.id;
          return (
            <g
              key={`pipe-${node.id}`}
              role="button"
              tabIndex={-1}
              style={{ cursor: "pointer" }}
              onClick={() => setActive(node.id)}
            >
              {index > 0 ? (
                <line
                  x1={x - 46}
                  y1="30"
                  x2={x - 16}
                  y2="30"
                  className="stroke-mint"
                  strokeWidth="2"
                  opacity={reduced ? 0.4 : 1}
                  pointerEvents="none"
                />
              ) : null}
              <rect
                x={x - 22}
                y="8"
                width="44"
                height="44"
                fill="transparent"
                data-process-index={index + 1}
                data-process-node={node.id}
                onClick={() => setActive(node.id)}
              />
              <circle
                cx={x}
                cy="30"
                r={selected ? 14 : 11}
                className={selected ? "fill-mint" : "fill-surface"}
                pointerEvents="none"
              />
              <text
                x={x}
                y="30"
                textAnchor="middle"
                dominantBaseline="central"
                className={selected ? "fill-primary-foreground" : "fill-ink"}
                fontSize="11"
                fontWeight="600"
                pointerEvents="none"
              >
                {index + 1}
              </text>
              <text
                x={x}
                y="58"
                textAnchor="middle"
                className={selected ? "fill-ink" : "fill-muted"}
                fontSize="8"
                pointerEvents="none"
              >
                {node.stage}
              </text>
            </g>
          );
        })}
      </svg>
      <div
        className="mt-4 flex min-w-0 max-w-full gap-2 overflow-x-auto md:flex"
        role="tablist"
        aria-label={ex.nodesAria}
        onKeyDown={tabs.onKeyDown}
      >
        {nodes.map((node, index) => (
          <div key={node.id} className="flex shrink-0 items-center md:flex-1">
            <button
              type="button"
              role="tab"
              ref={tabs.setRef(node.id)}
              aria-selected={current?.id === node.id}
              tabIndex={tabs.tabIndex(node.id)}
              onClick={() => setActive(node.id)}
              className={`inline-flex min-h-11 flex-col items-start justify-center rounded-2xl px-3 py-2 text-left text-sm md:flex-1 ${
                current?.id === node.id ? "bg-mint text-primary-foreground" : "bg-surface shadow-card"
              }`}
            >
              <span className="font-medium">{node.label}</span>
              <span className={`mt-0.5 max-w-[11rem] truncate text-[11px] ${current?.id === node.id ? "text-primary-foreground/80" : "text-muted"}`}>
                {node.githubPath}
              </span>
            </button>
            {index < nodes.length - 1 ? (
              <span className="hidden px-1 text-muted md:inline" aria-hidden>
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
      {current ? (
        <div className="mt-5 rounded-2xl bg-surface p-5 shadow-card" role="tabpanel">
          <p className="text-xs text-mint-deep">{current.stage}</p>
          <h3 className="mt-1 font-display text-xl font-semibold">{current.label}</h3>
          <p className="mt-2 text-sm leading-relaxed">{current.summary}</p>
          <p className="mt-3 text-sm text-muted">{labeledLine(lang, ex.githubSource, current.githubPath)}</p>
          <p className="text-sm text-muted">{current.purpose}</p>
          {owner && repo ? (
            <a
              className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-mint-deep"
              href={githubBlobUrl(owner, repo, branch, current.githubPath)}
              rel="noreferrer"
              target="_blank"
            >
              {ex.openSourceFile}
            </a>
          ) : null}
          <ProcessStudio
            nodeId={current.id}
            cut={cut}
            setCut={setCut}
            assets={assetChoices}
            ex={ex}
            lang={lang}
          />
          {reduced ? <p className="mt-3 text-xs text-muted">{ex.reducedMotion}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function ProcessStudio({
  nodeId,
  cut,
  setCut,
  assets,
  ex,
  lang,
}: {
  nodeId: string;
  cut: Cut;
  setCut: (next: Cut | ((value: Cut) => Cut)) => void;
  assets: string[];
  ex: ReturnType<typeof useExperienceView>["ex"];
  lang: "zh" | "en";
}) {
  return (
    <div className="mt-4 rounded-2xl bg-surface-blue/70 p-4" data-process-studio={nodeId}>
      <p className="text-xs text-mint-deep">{ex.processOperate}</p>
      {nodeId === "project" ? (
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const name = String(form.get("name") ?? "").trim() || (lang === "en" ? "Demo cut" : "示範專案");
            setCut((value) => ({ ...value, projectName: name, pack: null, review: "draft" }));
          }}
        >
          <input
            name="name"
            defaultValue={cut.projectName}
            className="min-h-11 flex-1 rounded-full border border-line bg-bg px-4 text-sm"
            placeholder={lang === "en" ? "Project name" : "專案名稱"}
          />
          <button type="submit" className="inline-flex min-h-11 items-center rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground">
            {ex.processCreate}
          </button>
        </form>
      ) : null}
      {nodeId === "world" ? (
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const worldview = String(form.get("world") ?? "").trim();
            if (!worldview) return;
            setCut((value) => ({ ...value, worldview }));
          }}
        >
          <input
            name="world"
            defaultValue={cut.worldview}
            className="min-h-11 flex-1 rounded-full border border-line bg-bg px-4 text-sm"
            placeholder={lang === "en" ? "Logline / tone" : "一句世界觀／調性"}
          />
          <button type="submit" className="inline-flex min-h-11 items-center rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground">
            {ex.processWorld}
          </button>
        </form>
      ) : null}
      {nodeId === "assets" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {assets.map((item) => {
            const on = cut.assets.includes(item);
            return (
              <button
                key={item}
                type="button"
                className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm ${on ? "bg-ink text-bg" : "bg-surface shadow-card"}`}
                onClick={() =>
                  setCut((value) => ({
                    ...value,
                    assets: on ? value.assets.filter((asset) => asset !== item) : [...value.assets, item],
                  }))
                }
              >
                {ex.processPickAsset} · {item}
              </button>
            );
          })}
        </div>
      ) : null}
      {nodeId === "gen" ? (
        <button
          type="button"
          className="mt-3 inline-flex min-h-11 items-center rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground"
          data-fake-gen=""
          onClick={() =>
            setCut((value) => ({
              ...value,
              generated: lang === "en" ? "Fake still · Fal key not loaded" : "假生成靜幀 · 未載入 Fal 金鑰",
            }))
          }
        >
          {ex.processFakeGen}
        </button>
      ) : null}
      {nodeId === "storyboard" ? (
        <ul className="mt-3 grid gap-2">
          {cut.shots.map((shot, index) => (
            <li key={shot} className="flex min-h-11 items-center justify-between gap-2 rounded-xl bg-surface px-3 text-sm shadow-card">
              <span>
                {index + 1}. {shot}
              </span>
              <span className="flex gap-1">
                <button
                  type="button"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl"
                  aria-label={ex.processShotUp}
                  disabled={index === 0}
                  onClick={() =>
                    setCut((value) => {
                      if (index === 0) return value;
                      const shots = [...value.shots];
                      [shots[index - 1], shots[index]] = [shots[index], shots[index - 1]];
                      return { ...value, shots };
                    })
                  }
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl"
                  aria-label={ex.processShotDown}
                  disabled={index === cut.shots.length - 1}
                  onClick={() =>
                    setCut((value) => {
                      if (index >= value.shots.length - 1) return value;
                      const shots = [...value.shots];
                      [shots[index], shots[index + 1]] = [shots[index + 1], shots[index]];
                      return { ...value, shots };
                    })
                  }
                >
                  ↓
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {nodeId === "review" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex min-h-11 items-center rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground"
            onClick={() => setCut((value) => ({ ...value, review: "approved" }))}
          >
            {ex.processApprove}
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card"
            onClick={() => setCut((value) => ({ ...value, review: "rejected", pack: null }))}
          >
            {ex.processReject}
          </button>
        </div>
      ) : null}
      {nodeId === "delivery" ? (
        <button
          type="button"
          className="mt-3 inline-flex min-h-11 items-center rounded-full bg-mint px-4 text-sm font-semibold text-primary-foreground"
          onClick={() =>
            setCut((value) => ({
              ...value,
              pack: value.review === "approved" ? (lang === "en" ? "demo-pack.zip" : "示範交付包.zip") : null,
            }))
          }
        >
          {ex.processPack}
        </button>
      ) : null}
      <dl className="mt-3 grid gap-1 text-xs text-muted" data-process-cut="">
        <div>{labeledLine(lang, lang === "en" ? "Project" : "專案", cut.projectName || "—")}</div>
        <div>{labeledLine(lang, lang === "en" ? "Worldview" : "世界觀", cut.worldview || "—")}</div>
        <div>{labeledLine(lang, lang === "en" ? "Assets" : "素材", cut.assets.join(" · ") || "—")}</div>
        <div>{labeledLine(lang, lang === "en" ? "Generate" : "生成", cut.generated ?? "—")}</div>
        <div>{labeledLine(lang, lang === "en" ? "Review" : "審核", cut.review)}</div>
        <div>{labeledLine(lang, lang === "en" ? "Pack" : "交付", cut.pack ?? "—")}</div>
      </dl>
      {cut.pack ? <p className="mt-2 text-xs text-mint-deep">{ex.processPacked}</p> : null}
    </div>
  );
}
