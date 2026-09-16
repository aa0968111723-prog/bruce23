import type { ExperienceConfig, ExperienceLocaleOverlay } from "@/lib/cms/schema";
import { EXPERIENCE_MODE_LABEL } from "@/lib/cms/status";
import type { ExperienceMode as Mode } from "@/lib/cms/status";

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm">
      {label}
      {multiline ? (
        <textarea
          className="min-h-24 rounded-xl border border-line px-3 py-2"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className="min-h-11 rounded-xl border border-line px-3"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="grid gap-1 text-sm">
      {label}
      <input
        type="number"
        min={min}
        max={max}
        className="min-h-11 rounded-xl border border-line px-3"
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="inline-flex min-h-11 items-center rounded-full bg-surface-mint px-4 text-sm" onClick={onClick}>
      {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm shadow-card" onClick={onClick}>
      移除
    </button>
  );
}

function EnField({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-muted">{label}</span>
      {multiline ? (
        <textarea
          className="min-h-24 rounded-xl border border-line bg-surface-blue/70 px-3 py-2"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className="min-h-11 rounded-xl border border-line bg-surface-blue/70 px-3"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

function localeEn(config: ExperienceConfig): ExperienceLocaleOverlay {
  return config.locale?.en ?? {};
}

function withEn(
  config: ExperienceConfig,
  updater: (en: ExperienceLocaleOverlay) => ExperienceLocaleOverlay,
): ExperienceConfig {
  return { ...config, locale: { ...config.locale, en: updater(localeEn(config)) } };
}

function upsertById<T extends { id: string }>(rows: T[] | undefined, id: string, patch: Partial<T>): T[] {
  const list = [...(rows ?? [])];
  const index = list.findIndex((row) => row.id === id);
  if (index === -1) return [...list, { id, ...patch } as T];
  list[index] = { ...list[index], ...patch };
  return list;
}

function fieldById<T extends { id: string }>(rows: T[] | undefined, id: string, key: keyof T): string {
  const hit = rows?.find((row) => row.id === id);
  const value = hit?.[key];
  return typeof value === "string" ? value : "";
}

export function ExperienceEditor({
  mode,
  config,
  steps,
  onConfig,
  onSteps,
}: {
  mode: Mode | null | undefined;
  config: ExperienceConfig;
  steps: string[];
  onConfig: (next: ExperienceConfig) => void;
  onSteps: (next: string[]) => void;
}) {
  function patch(partial: Partial<ExperienceConfig>) {
    onConfig({ ...config, ...partial });
  }

  function patchEn(updater: (en: ExperienceLocaleOverlay) => ExperienceLocaleOverlay) {
    onConfig(withEn(config, updater));
  }

  const en = localeEn(config);

  return (
    <fieldset className="grid gap-4 rounded-2xl bg-surface p-5 shadow-card">
      <legend className="font-display text-lg">互動展示內容</legend>
      <p className="text-sm text-muted">
        {mode ? `目前模式：${EXPERIENCE_MODE_LABEL[mode as Mode] ?? mode}` : "先選體驗模式，再編對應內容。"}
        這裡改的資料會進已發布頁的體驗，不是 JSON 備註。
      </p>
      <Field label="誠實標籤" value={config.honestyLabel ?? ""} onChange={(value) => patch({ honestyLabel: value })} />
      <Field label="體驗引言" value={config.intro ?? ""} onChange={(value) => patch({ intro: value })} multiline />
      <Field label="Demo 說明" value={config.demoNote ?? ""} onChange={(value) => patch({ demoNote: value })} multiline />
      <Field label="Canva 說明" value={config.canvaNote ?? ""} onChange={(value) => patch({ canvaNote: value })} multiline />
      <Field
        label="GitHub 說明"
        value={config.githubIntro ?? ""}
        onChange={(value) => patch({ githubIntro: value })}
        multiline
      />
      <Field label="廊說明" value={config.galleryNote ?? ""} onChange={(value) => patch({ galleryNote: value })} multiline />

      <div className="grid gap-3 rounded-2xl bg-surface-blue/50 p-4">
        <p className="text-sm font-medium">英文 overlay</p>
        <p className="text-xs text-muted">
          公開 en 優先用這裡存下來的字。空白則用內建字典，再沒有才回中文。不會覆寫中文欄位。Canva
          只編說明與已有頁面標籤，不要虛構頁面 ID。
        </p>
        <EnField
          label="英文誠實標籤"
          value={en.honestyLabel ?? ""}
          onChange={(value) => patchEn((current) => ({ ...current, honestyLabel: value }))}
        />
        <EnField
          label="英文體驗引言"
          value={en.intro ?? ""}
          onChange={(value) => patchEn((current) => ({ ...current, intro: value }))}
          multiline
        />
        <EnField
          label="英文 Demo 說明"
          value={en.demoNote ?? ""}
          onChange={(value) => patchEn((current) => ({ ...current, demoNote: value }))}
          multiline
        />
        <EnField
          label="英文 Canva 說明"
          value={en.canvaNote ?? ""}
          onChange={(value) => patchEn((current) => ({ ...current, canvaNote: value }))}
          multiline
        />
        <EnField
          label="英文 GitHub 說明"
          value={en.githubIntro ?? ""}
          onChange={(value) => patchEn((current) => ({ ...current, githubIntro: value }))}
          multiline
        />
        <EnField
          label="英文廊說明"
          value={en.galleryNote ?? ""}
          onChange={(value) => patchEn((current) => ({ ...current, galleryNote: value }))}
          multiline
        />
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-medium">如何運作（互動步驟）</p>
        {steps.map((step, index) => (
          <div key={`step-${index}`} className="grid gap-2 rounded-2xl bg-surface-blue/60 p-3 sm:grid-cols-[1fr_auto]">
            <input
              className="min-h-11 rounded-xl border border-line bg-surface px-3 text-sm"
              value={step}
              onChange={(event) => onSteps(steps.map((item, i) => (i === index ? event.target.value : item)))}
            />
            <RemoveButton onClick={() => onSteps(steps.filter((_, i) => i !== index))} />
          </div>
        ))}
        <AddButton label="加一步" onClick={() => onSteps([...steps, ""])} />
      </div>

      {mode === "process-map" || mode === "interactive-walkthrough" ? (
        <ProcessAndWalk config={config} onConfig={onConfig} patch={patch} patchEn={patchEn} />
      ) : null}
      {mode === "timeline" ? <TimelineFields config={config} patch={patch} patchEn={patchEn} /> : null}
      {mode === "spatial-preview" ? (
        <SpatialFields config={config} onConfig={onConfig} patch={patch} patchEn={patchEn} />
      ) : null}
      {mode === "image-comparison" ? (
        <ComparisonFields config={config} onConfig={onConfig} patch={patch} patchEn={patchEn} />
      ) : null}
      {mode === "conversation-preview" ? <ConversationFields config={config} patch={patch} patchEn={patchEn} /> : null}
      {mode === "canva-embed" ? <CanvaFields config={config} onConfig={onConfig} patch={patch} patchEn={patchEn} /> : null}

      <FileHintFields config={config} patch={patch} />

      <details className="rounded-2xl bg-surface-blue/50 p-3 text-sm">
        <summary className="min-h-11 cursor-pointer font-medium">進階 JSON（只讀預覽）</summary>
        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-xs text-muted">
          {JSON.stringify(config, null, 2)}
        </pre>
      </details>
    </fieldset>
  );
}

function ProcessAndWalk({
  config,
  onConfig,
  patch,
  patchEn,
}: {
  config: ExperienceConfig;
  onConfig: (next: ExperienceConfig) => void;
  patch: (partial: Partial<ExperienceConfig>) => void;
  patchEn: (updater: (en: ExperienceLocaleOverlay) => ExperienceLocaleOverlay) => void;
}) {
  const nodes = config.processNodes ?? [];
  const steps = config.walkthrough ?? [];
  const en = localeEn(config);
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <p className="text-sm font-medium">流程節點（AI Director OS／process-map）</p>
        {nodes.map((node, index) => (
          <div key={`${node.id}-${index}`} className="grid gap-2 rounded-2xl border border-line p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <Field
                label="id"
                value={node.id}
                onChange={(value) => {
                  const prevId = node.id;
                  onConfig(
                    withEn(
                      {
                        ...config,
                        processNodes: nodes.map((item, i) => (i === index ? { ...item, id: value } : item)),
                      },
                      (current) => ({
                        ...current,
                        processNodes: (current.processNodes ?? []).map((row) =>
                          row.id === prevId ? { ...row, id: value } : row,
                        ),
                      }),
                    ),
                  );
                }}
              />
              <Field
                label="標籤"
                value={node.label}
                onChange={(value) =>
                  patch({ processNodes: nodes.map((item, i) => (i === index ? { ...item, label: value } : item)) })
                }
              />
              <EnField
                label="英文標籤"
                value={fieldById(en.processNodes, node.id, "label")}
                onChange={(value) =>
                  patchEn((current) => ({
                    ...current,
                    processNodes: upsertById(current.processNodes, node.id, { label: value }),
                  }))
                }
              />
              <Field
                label="階段"
                value={node.stage}
                onChange={(value) =>
                  patch({ processNodes: nodes.map((item, i) => (i === index ? { ...item, stage: value } : item)) })
                }
              />
              <EnField
                label="英文階段"
                value={fieldById(en.processNodes, node.id, "stage")}
                onChange={(value) =>
                  patchEn((current) => ({
                    ...current,
                    processNodes: upsertById(current.processNodes, node.id, { stage: value }),
                  }))
                }
              />
              <Field
                label="GitHub 路徑"
                value={node.githubPath}
                onChange={(value) =>
                  patch({ processNodes: nodes.map((item, i) => (i === index ? { ...item, githubPath: value } : item)) })
                }
              />
            </div>
            <Field
              label="用途"
              value={node.purpose}
              onChange={(value) =>
                patch({ processNodes: nodes.map((item, i) => (i === index ? { ...item, purpose: value } : item)) })
              }
            />
            <EnField
              label="英文用途"
              value={fieldById(en.processNodes, node.id, "purpose")}
              onChange={(value) =>
                patchEn((current) => ({
                  ...current,
                  processNodes: upsertById(current.processNodes, node.id, { purpose: value }),
                }))
              }
            />
            <Field
              label="說明"
              value={node.summary}
              onChange={(value) =>
                patch({ processNodes: nodes.map((item, i) => (i === index ? { ...item, summary: value } : item)) })
              }
              multiline
            />
            <EnField
              label="英文說明"
              value={fieldById(en.processNodes, node.id, "summary")}
              onChange={(value) =>
                patchEn((current) => ({
                  ...current,
                  processNodes: upsertById(current.processNodes, node.id, { summary: value }),
                }))
              }
              multiline
            />
            <RemoveButton
              onClick={() =>
                onConfig(
                  withEn(
                    { ...config, processNodes: nodes.filter((_, i) => i !== index) },
                    (current) => ({
                      ...current,
                      processNodes: (current.processNodes ?? []).filter((row) => row.id !== node.id),
                    }),
                  ),
                )
              }
            />
          </div>
        ))}
        <AddButton
          label="加節點"
          onClick={() =>
            patch({
              processNodes: [
                ...nodes,
                { id: `node-${nodes.length + 1}`, label: "新節點", summary: "", githubPath: "", purpose: "", stage: "" },
              ],
            })
          }
        />
      </div>
      <div className="grid gap-2">
        <p className="text-sm font-medium">走查步驟（Folio／walkthrough）</p>
        {steps.map((step, index) => (
          <div key={`walk-${index}`} className="grid gap-2 rounded-2xl border border-line p-3">
            <Field
              label="標題"
              value={step.title}
              onChange={(value) =>
                patch({ walkthrough: steps.map((item, i) => (i === index ? { ...item, title: value } : item)) })
              }
            />
            <EnField
              label="英文標題"
              value={en.walkthrough?.[index]?.title ?? ""}
              onChange={(value) =>
                patchEn((current) => {
                  const rows = [...(current.walkthrough ?? [])];
                  while (rows.length <= index) rows.push({});
                  rows[index] = { ...rows[index], path: step.path, title: value };
                  return { ...current, walkthrough: rows };
                })
              }
            />
            <Field
              label="說明"
              value={step.body}
              onChange={(value) =>
                patch({ walkthrough: steps.map((item, i) => (i === index ? { ...item, body: value } : item)) })
              }
              multiline
            />
            <EnField
              label="英文走查說明"
              value={en.walkthrough?.[index]?.body ?? ""}
              onChange={(value) =>
                patchEn((current) => {
                  const rows = [...(current.walkthrough ?? [])];
                  while (rows.length <= index) rows.push({});
                  rows[index] = { ...rows[index], path: step.path, body: value };
                  return { ...current, walkthrough: rows };
                })
              }
              multiline
            />
            <Field
              label="GitHub 路徑"
              value={step.path ?? ""}
              onChange={(value) =>
                patch({ walkthrough: steps.map((item, i) => (i === index ? { ...item, path: value } : item)) })
              }
            />
            <RemoveButton
              onClick={() =>
                onConfig(
                  withEn(
                    { ...config, walkthrough: steps.filter((_, i) => i !== index) },
                    (current) => ({
                      ...current,
                      walkthrough: (current.walkthrough ?? []).filter((_, i) => i !== index),
                    }),
                  ),
                )
              }
            />
          </div>
        ))}
        <AddButton
          label="加走查步驟"
          onClick={() => patch({ walkthrough: [...steps, { title: "新步驟", body: "", path: "" }] })}
        />
      </div>
    </div>
  );
}

function TimelineFields({
  config,
  patch,
  patchEn,
}: {
  config: ExperienceConfig;
  patch: (partial: Partial<ExperienceConfig>) => void;
  patchEn: (updater: (en: ExperienceLocaleOverlay) => ExperienceLocaleOverlay) => void;
}) {
  const timeline = config.timeline ?? { frames: [], onionDefault: true, compareDefault: false, demoDisclaimer: "" };
  const frames = timeline.frames ?? [];
  const en = localeEn(config);
  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium">FrameLab 時間軸</p>
      <Field
        label="示範說明"
        value={timeline.demoDisclaimer ?? ""}
        onChange={(value) => patch({ timeline: { ...timeline, demoDisclaimer: value } })}
        multiline
      />
      <EnField
        label="英文示範說明"
        value={en.timeline?.demoDisclaimer ?? ""}
        onChange={(value) =>
          patchEn((current) => ({ ...current, timeline: { ...current.timeline, demoDisclaimer: value } }))
        }
        multiline
      />
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={timeline.onionDefault ?? true}
          onChange={(event) => patch({ timeline: { ...timeline, onionDefault: event.target.checked } })}
        />
        預設開 onion-skin
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={timeline.compareDefault ?? false}
          onChange={(event) => patch({ timeline: { ...timeline, compareDefault: event.target.checked } })}
        />
        預設開幀比較
      </label>
      {frames.map((frame, index) => (
        <div key={`frame-${index}`} className="grid gap-2 rounded-2xl border border-line p-3 sm:grid-cols-2">
          <NumberField
            label="幀號"
            value={frame.i}
            min={0}
            onChange={(value) =>
              patch({ timeline: { ...timeline, frames: frames.map((item, i) => (i === index ? { ...item, i: value } : item)) } })
            }
          />
          <label className="grid gap-1 text-sm">
            種類
            <select
              className="min-h-11 rounded-xl border border-line px-3"
              value={frame.kind}
              onChange={(event) =>
                patch({
                  timeline: {
                    ...timeline,
                    frames: frames.map((item, i) =>
                      i === index ? { ...item, kind: event.target.value as typeof frame.kind } : item,
                    ),
                  },
                })
              }
            >
              <option value="key">key</option>
              <option value="breakdown">breakdown</option>
              <option value="generated">generated</option>
            </select>
          </label>
          <NumberField
            label="x"
            value={frame.x}
            min={0}
            max={320}
            onChange={(value) =>
              patch({ timeline: { ...timeline, frames: frames.map((item, i) => (i === index ? { ...item, x: value } : item)) } })
            }
          />
          <NumberField
            label="y"
            value={frame.y}
            min={0}
            max={180}
            onChange={(value) =>
              patch({ timeline: { ...timeline, frames: frames.map((item, i) => (i === index ? { ...item, y: value } : item)) } })
            }
          />
          <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={Boolean(frame.problem)}
              onChange={(event) =>
                patch({
                  timeline: {
                    ...timeline,
                    frames: frames.map((item, i) => (i === index ? { ...item, problem: event.target.checked } : item)),
                  },
                })
              }
            />
            問題幀
          </label>
          <RemoveButton onClick={() => patch({ timeline: { ...timeline, frames: frames.filter((_, i) => i !== index) } })} />
        </div>
      ))}
      <AddButton
        label="加幀"
        onClick={() =>
          patch({
            timeline: {
              ...timeline,
              frames: [...frames, { i: frames.length, kind: "generated", x: 160, y: 90 }],
            },
          })
        }
      />
    </div>
  );
}

function SpatialFields({
  config,
  onConfig,
  patch,
  patchEn,
}: {
  config: ExperienceConfig;
  onConfig: (next: ExperienceConfig) => void;
  patch: (partial: Partial<ExperienceConfig>) => void;
  patchEn: (updater: (en: ExperienceLocaleOverlay) => ExperienceLocaleOverlay) => void;
}) {
  const spatial = config.spatial ?? { objects: [], circulationNote: "", complianceDisclaimer: "", tiltDefault: 18 };
  const objects = spatial.objects ?? [];
  const en = localeEn(config);
  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium">PLANFORM 物件與動線</p>
      <Field
        label="動線說明"
        value={spatial.circulationNote ?? ""}
        onChange={(value) => patch({ spatial: { ...spatial, circulationNote: value } })}
        multiline
      />
      <EnField
        label="英文動線說明"
        value={en.spatial?.circulationNote ?? ""}
        onChange={(value) =>
          patchEn((current) => ({ ...current, spatial: { ...current.spatial, circulationNote: value } }))
        }
        multiline
      />
      <Field
        label="法規／符合聲明（必須誠實）"
        value={spatial.complianceDisclaimer ?? ""}
        onChange={(value) => patch({ spatial: { ...spatial, complianceDisclaimer: value } })}
        multiline
      />
      <EnField
        label="英文法規／符合聲明"
        value={en.spatial?.complianceDisclaimer ?? ""}
        onChange={(value) =>
          patchEn((current) => ({ ...current, spatial: { ...current.spatial, complianceDisclaimer: value } }))
        }
        multiline
      />
      <NumberField
        label="預設旋轉"
        value={spatial.tiltDefault ?? 18}
        min={-40}
        max={50}
        onChange={(value) => patch({ spatial: { ...spatial, tiltDefault: value } })}
      />
      {objects.map((item, index) => (
        <div key={`${item.id}-${index}`} className="grid gap-2 rounded-2xl border border-line p-3 sm:grid-cols-2">
          <Field
            label="id"
            value={item.id}
            onChange={(value) =>
              patch({ spatial: { ...spatial, objects: objects.map((row, i) => (i === index ? { ...row, id: value } : row)) } })
            }
          />
          <Field
            label="名稱"
            value={item.label}
            onChange={(value) =>
              patch({ spatial: { ...spatial, objects: objects.map((row, i) => (i === index ? { ...row, label: value } : row)) } })
            }
          />
          <EnField
            label="英文名稱"
            value={fieldById(en.spatial?.objects, item.id, "label")}
            onChange={(value) =>
              patchEn((current) => ({
                ...current,
                spatial: {
                  ...current.spatial,
                  objects: upsertById(current.spatial?.objects, item.id, { label: value }),
                },
              }))
            }
          />
          <Field
            label="用途"
            value={item.use}
            onChange={(value) =>
              patch({ spatial: { ...spatial, objects: objects.map((row, i) => (i === index ? { ...row, use: value } : row)) } })
            }
          />
          <EnField
            label="英文用途"
            value={fieldById(en.spatial?.objects, item.id, "use")}
            onChange={(value) =>
              patchEn((current) => ({
                ...current,
                spatial: {
                  ...current.spatial,
                  objects: upsertById(current.spatial?.objects, item.id, { use: value }),
                },
              }))
            }
          />
          <Field
            label="尺寸"
            value={item.size}
            onChange={(value) =>
              patch({ spatial: { ...spatial, objects: objects.map((row, i) => (i === index ? { ...row, size: value } : row)) } })
            }
          />
          <NumberField
            label="x %"
            value={item.x}
            min={0}
            max={100}
            onChange={(value) =>
              patch({ spatial: { ...spatial, objects: objects.map((row, i) => (i === index ? { ...row, x: value } : row)) } })
            }
          />
          <NumberField
            label="y %"
            value={item.y}
            min={0}
            max={100}
            onChange={(value) =>
              patch({ spatial: { ...spatial, objects: objects.map((row, i) => (i === index ? { ...row, y: value } : row)) } })
            }
          />
          <RemoveButton
            onClick={() =>
              onConfig(
                withEn(
                  { ...config, spatial: { ...spatial, objects: objects.filter((_, i) => i !== index) } },
                  (current) => ({
                    ...current,
                    spatial: {
                      ...current.spatial,
                      objects: (current.spatial?.objects ?? []).filter((row) => row.id !== item.id),
                    },
                  }),
                ),
              )
            }
          />
        </div>
      ))}
      <AddButton
        label="加物件"
        onClick={() =>
          patch({
            spatial: {
              ...spatial,
              objects: [...objects, { id: `obj-${objects.length + 1}`, label: "新物件", use: "", size: "", x: 50, y: 50 }],
            },
          })
        }
      />
    </div>
  );
}

function ComparisonFields({
  config,
  onConfig,
  patch,
  patchEn,
}: {
  config: ExperienceConfig;
  onConfig: (next: ExperienceConfig) => void;
  patch: (partial: Partial<ExperienceConfig>) => void;
  patchEn: (updater: (en: ExperienceLocaleOverlay) => ExperienceLocaleOverlay) => void;
}) {
  const comparison = config.comparison ?? { variant: "annotate", versions: [], seedPins: [] };
  const versions = comparison.versions ?? [];
  const pins = comparison.seedPins ?? [];
  const en = localeEn(config);
  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium">圖像比較／對稿</p>
      <label className="grid gap-1 text-sm">
        變體
        <select
          className="min-h-11 rounded-xl border border-line px-3"
          value={comparison.variant ?? "annotate"}
          onChange={(event) =>
            patch({ comparison: { ...comparison, variant: event.target.value as "annotate" | "poster-analysis" } })
          }
        >
          <option value="annotate">對稿註記</option>
          <option value="poster-analysis">海報分析</option>
        </select>
      </label>
      <Field
        label="註記提示"
        value={comparison.prompt ?? ""}
        onChange={(value) => patch({ comparison: { ...comparison, prompt: value } })}
      />
      <EnField
        label="英文註記提示"
        value={en.comparison?.prompt ?? ""}
        onChange={(value) =>
          patchEn((current) => ({ ...current, comparison: { ...current.comparison, prompt: value } }))
        }
      />
      <Field
        label="樣本圖"
        value={comparison.sampleSrc ?? ""}
        onChange={(value) => patch({ comparison: { ...comparison, sampleSrc: value } })}
      />
      <Field
        label="推估聲明"
        value={comparison.estimateDisclaimer ?? ""}
        onChange={(value) => patch({ comparison: { ...comparison, estimateDisclaimer: value } })}
        multiline
      />
      <EnField
        label="英文推估聲明"
        value={en.comparison?.estimateDisclaimer ?? ""}
        onChange={(value) =>
          patchEn((current) => ({ ...current, comparison: { ...current.comparison, estimateDisclaimer: value } }))
        }
        multiline
      />
      {versions.map((version, index) => (
        <div key={`${version.id}-${index}`} className="grid gap-2 rounded-2xl border border-line p-3 sm:grid-cols-3">
          <Field
            label="版本 id"
            value={version.id}
            onChange={(value) =>
              patch({
                comparison: {
                  ...comparison,
                  versions: versions.map((item, i) => (i === index ? { ...item, id: value } : item)),
                },
              })
            }
          />
          <Field
            label="標籤"
            value={version.label}
            onChange={(value) =>
              patch({
                comparison: {
                  ...comparison,
                  versions: versions.map((item, i) => (i === index ? { ...item, label: value } : item)),
                },
              })
            }
          />
          <EnField
            label="英文版本標籤"
            value={fieldById(en.comparison?.versions, version.id, "label")}
            onChange={(value) =>
              patchEn((current) => ({
                ...current,
                comparison: {
                  ...current.comparison,
                  versions: upsertById(current.comparison?.versions, version.id, { label: value }),
                },
              }))
            }
          />
          <Field
            label="CSS filter"
            value={version.filter}
            onChange={(value) =>
              patch({
                comparison: {
                  ...comparison,
                  versions: versions.map((item, i) => (i === index ? { ...item, filter: value } : item)),
                },
              })
            }
          />
          <RemoveButton
            onClick={() =>
              onConfig(
                withEn(
                  {
                    ...config,
                    comparison: { ...comparison, versions: versions.filter((_, i) => i !== index) },
                  },
                  (current) => ({
                    ...current,
                    comparison: {
                      ...current.comparison,
                      versions: (current.comparison?.versions ?? []).filter((row) => row.id !== version.id),
                    },
                  }),
                ),
              )
            }
          />
        </div>
      ))}
      <AddButton
        label="加版本"
        onClick={() =>
          patch({
            comparison: {
              ...comparison,
              versions: [...versions, { id: `v${versions.length + 1}`, label: "新版本", filter: "none" }],
            },
          })
        }
      />
      {pins.map((pin, index) => (
        <div key={`${pin.id}-${index}`} className="grid gap-2 rounded-2xl border border-line p-3 sm:grid-cols-2">
          <Field
            label="預設註記"
            value={pin.note}
            onChange={(value) =>
              patch({
                comparison: { ...comparison, seedPins: pins.map((item, i) => (i === index ? { ...item, note: value } : item)) },
              })
            }
          />
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="x %"
              value={pin.x}
              min={0}
              max={100}
              onChange={(value) =>
                patch({
                  comparison: { ...comparison, seedPins: pins.map((item, i) => (i === index ? { ...item, x: value } : item)) },
                })
              }
            />
            <NumberField
              label="y %"
              value={pin.y}
              min={0}
              max={100}
              onChange={(value) =>
                patch({
                  comparison: { ...comparison, seedPins: pins.map((item, i) => (i === index ? { ...item, y: value } : item)) },
                })
              }
            />
          </div>
          <RemoveButton
            onClick={() => patch({ comparison: { ...comparison, seedPins: pins.filter((_, i) => i !== index) } })}
          />
        </div>
      ))}
      <AddButton
        label="加預設註記"
        onClick={() =>
          patch({
            comparison: {
              ...comparison,
              seedPins: [...pins, { id: `pin-${pins.length + 1}`, x: 40, y: 40, note: "" }],
            },
          })
        }
      />
    </div>
  );
}

function ConversationFields({
  config,
  patch,
  patchEn,
}: {
  config: ExperienceConfig;
  patch: (partial: Partial<ExperienceConfig>) => void;
  patchEn: (updater: (en: ExperienceLocaleOverlay) => ExperienceLocaleOverlay) => void;
}) {
  const conversation = config.conversation ?? { engine: "hermes-preview", disclaimer: "", replies: [] };
  const replies = conversation.replies ?? [];
  const en = localeEn(config);
  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium">對話預覽（TKU Zen／Hermes）</p>
      <label className="grid gap-1 text-sm">
        引擎
        <select
          className="min-h-11 rounded-xl border border-line px-3"
          value={conversation.engine ?? "hermes-preview"}
          onChange={(event) =>
            patch({
              conversation: { ...conversation, engine: event.target.value as "zen-local" | "hermes-preview" },
            })
          }
        >
          <option value="zen-local">本地 Zen 引擎（非雲端 LLM）</option>
          <option value="hermes-preview">Hermes 本地說明（未連執行期）</option>
        </select>
      </label>
      <Field
        label="免責／誠實聲明"
        value={conversation.disclaimer ?? ""}
        onChange={(value) => patch({ conversation: { ...conversation, disclaimer: value } })}
        multiline
      />
      <EnField
        label="英文免責／誠實聲明"
        value={en.conversation?.disclaimer ?? ""}
        onChange={(value) =>
          patchEn((current) => ({ ...current, conversation: { ...current.conversation, disclaimer: value } }))
        }
        multiline
      />
      <Field
        label="開場白"
        value={conversation.starter ?? ""}
        onChange={(value) => patch({ conversation: { ...conversation, starter: value } })}
        multiline
      />
      <EnField
        label="英文開場白"
        value={en.conversation?.starter ?? ""}
        onChange={(value) =>
          patchEn((current) => ({ ...current, conversation: { ...current.conversation, starter: value } }))
        }
        multiline
      />
      <Field
        label="輸入提示"
        value={conversation.placeholder ?? ""}
        onChange={(value) => patch({ conversation: { ...conversation, placeholder: value } })}
      />
      <EnField
        label="英文輸入提示"
        value={en.conversation?.placeholder ?? ""}
        onChange={(value) =>
          patchEn((current) => ({ ...current, conversation: { ...current.conversation, placeholder: value } }))
        }
      />
      <Field
        label="來源說明"
        value={conversation.sourceNote ?? ""}
        onChange={(value) => patch({ conversation: { ...conversation, sourceNote: value } })}
        multiline
      />
      <EnField
        label="英文來源說明"
        value={en.conversation?.sourceNote ?? ""}
        onChange={(value) =>
          patchEn((current) => ({ ...current, conversation: { ...current.conversation, sourceNote: value } }))
        }
        multiline
      />
      <Field
        label="建議句（一行一句）"
        value={(conversation.suggestions ?? []).join("\n")}
        onChange={(value) =>
          patch({
            conversation: {
              ...conversation,
              suggestions: value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean),
            },
          })
        }
        multiline
      />
      <EnField
        label="英文建議句（一行一句）"
        value={(en.conversation?.suggestions ?? []).join("\n")}
        onChange={(value) =>
          patchEn((current) => ({
            ...current,
            conversation: {
              ...current.conversation,
              suggestions: value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean),
            },
          }))
        }
        multiline
      />
      {replies.map((reply, index) => (
        <div key={`reply-${index}`} className="grid gap-2 rounded-2xl border border-line p-3">
          <Field
            label="關鍵詞"
            value={reply.match}
            onChange={(value) =>
              patch({
                conversation: {
                  ...conversation,
                  replies: replies.map((item, i) => (i === index ? { ...item, match: value } : item)),
                },
              })
            }
          />
          <Field
            label="本地回覆"
            value={reply.reply}
            onChange={(value) =>
              patch({
                conversation: {
                  ...conversation,
                  replies: replies.map((item, i) => (i === index ? { ...item, reply: value } : item)),
                },
              })
            }
            multiline
          />
          <RemoveButton
            onClick={() =>
              patch({ conversation: { ...conversation, replies: replies.filter((_, i) => i !== index) } })
            }
          />
        </div>
      ))}
      <AddButton
        label="加關鍵詞回覆"
        onClick={() =>
          patch({ conversation: { ...conversation, replies: [...replies, { match: "關鍵詞", reply: "本地回覆" }] } })
        }
      />
      {conversation.engine === "zen-local" ? (
        <p className="text-xs text-muted">
          關鍵詞對上時用這裡的本地回覆；沒對上的句子仍走 zen.ts 引擎。不會假裝成雲端 LLM。
        </p>
      ) : (
        <p className="text-xs text-muted">沒對上關鍵詞時只回本地說明，不會假裝工具已執行。</p>
      )}
    </div>
  );
}

function CanvaFields({
  config,
  onConfig,
  patch,
  patchEn,
}: {
  config: ExperienceConfig;
  onConfig: (next: ExperienceConfig) => void;
  patch: (partial: Partial<ExperienceConfig>) => void;
  patchEn: (updater: (en: ExperienceLocaleOverlay) => ExperienceLocaleOverlay) => void;
}) {
  const pages = config.canvaPageLabels ?? [];
  const en = localeEn(config);
  return (
    <div className="grid gap-2">
      {pages.length === 0 ? (
        <p className="rounded-xl bg-surface-blue/70 px-3 py-2 text-xs text-muted">
          還沒有公開 canva.com/design/{"{id}"} 分享連結時，不要加頁面標籤或虛構頁面 ID。貼上真實分享連結之後再填實際頁面。
        </p>
      ) : null}
      {pages.map((page, index) => (
        <div key={`${page.id}-${index}`} className="grid gap-2 rounded-2xl border border-line p-3 sm:grid-cols-2">
          <Field
            label="頁面 id"
            value={page.id}
            onChange={(value) =>
              patch({ canvaPageLabels: pages.map((item, i) => (i === index ? { ...item, id: value } : item)) })
            }
          />
          <Field
            label="頁面標籤"
            value={page.label}
            onChange={(value) =>
              patch({ canvaPageLabels: pages.map((item, i) => (i === index ? { ...item, label: value } : item)) })
            }
          />
          <EnField
            label="英文頁面標籤"
            value={fieldById(en.canvaPageLabels, page.id, "label")}
            onChange={(value) =>
              patchEn((current) => ({
                ...current,
                canvaPageLabels: upsertById(current.canvaPageLabels, page.id, { label: value }),
              }))
            }
          />
          <RemoveButton
            onClick={() =>
              onConfig(
                withEn(
                  { ...config, canvaPageLabels: pages.filter((_, i) => i !== index) },
                  (current) => ({
                    ...current,
                    canvaPageLabels: (current.canvaPageLabels ?? []).filter((row) => row.id !== page.id),
                  }),
                ),
              )
            }
          />
        </div>
      ))}
      <AddButton
        label="加頁面標籤"
        onClick={() => patch({ canvaPageLabels: [...pages, { id: `page-${pages.length + 1}`, label: `第 ${pages.length + 1} 頁` }] })}
      />
    </div>
  );
}

function FileHintFields({
  config,
  patch,
}: {
  config: ExperienceConfig;
  patch: (partial: Partial<ExperienceConfig>) => void;
}) {
  const hints = config.fileHints ?? [];
  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium">GitHub 檔案提示（點檔案時的用途／階段）</p>
      {hints.map((hint, index) => (
        <div key={`${hint.path}-${index}`} className="grid gap-2 rounded-2xl border border-line p-3 sm:grid-cols-3">
          <Field
            label="路徑"
            value={hint.path}
            onChange={(value) =>
              patch({ fileHints: hints.map((item, i) => (i === index ? { ...item, path: value } : item)) })
            }
          />
          <Field
            label="用途"
            value={hint.purpose}
            onChange={(value) =>
              patch({ fileHints: hints.map((item, i) => (i === index ? { ...item, purpose: value } : item)) })
            }
          />
          <Field
            label="階段"
            value={hint.stage}
            onChange={(value) =>
              patch({ fileHints: hints.map((item, i) => (i === index ? { ...item, stage: value } : item)) })
            }
          />
          <RemoveButton onClick={() => patch({ fileHints: hints.filter((_, i) => i !== index) })} />
        </div>
      ))}
      <AddButton
        label="加檔案提示"
        onClick={() =>
          patch({ fileHints: [...hints, { path: `src/untitled-${hints.length + 1}.ts`, purpose: "", stage: "" }] })
        }
      />
    </div>
  );
}
