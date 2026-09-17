import type { TimelineFrame } from "../cms/schema.ts";

/** Linear-blend a problem frame toward its neighbors. Demo of region-repair, not Wan/RIFE. */
export function repairProblemFrame(frames: TimelineFrame[], index: number): TimelineFrame[] {
  if (index < 0 || index >= frames.length) return frames;
  const current = frames[index];
  if (!current?.problem) return frames;
  const prev = frames.slice(0, index).reverse().find((frame) => !frame.problem) ?? frames[index - 1];
  const next = frames.slice(index + 1).find((frame) => !frame.problem) ?? frames[index + 1];
  if (!prev || !next) {
    return frames.map((frame, i) => (i === index ? { ...frame, problem: false } : frame));
  }
  return frames.map((frame, i) =>
    i === index
      ? {
          ...frame,
          x: Math.round((prev.x + next.x) / 2),
          y: Math.round((prev.y + next.y) / 2),
          problem: false,
        }
      : frame,
  );
}

export type FolioKind = "text" | "shape";

export type FolioNode = {
  id: string;
  kind: FolioKind;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
};

export type FolioBoard = { id: string; name: string; nodes: FolioNode[] };

export function initialFolioDoc(): FolioBoard[] {
  return [
    {
      id: "board-a",
      name: "A1",
      nodes: [
        { id: "n-text", kind: "text", x: 12, y: 18, w: 48, h: 14, label: "招生" },
        { id: "n-shape", kind: "shape", x: 16, y: 40, w: 22, h: 22, label: "" },
      ],
    },
    {
      id: "board-b",
      name: "Story",
      nodes: [{ id: "n-story", kind: "text", x: 14, y: 22, w: 54, h: 12, label: "茶會" }],
    },
  ];
}

export function applyFolioCommand(
  boards: FolioBoard[],
  boardId: string,
  command: "insert-text" | "add-shape",
  label: string,
  id?: string,
  pos?: { x: number; y: number },
): FolioBoard[] {
  return boards.map((board) => {
    if (board.id !== boardId) return board;
    const offset = board.nodes.length * 6;
    const nextId = id ?? `n-${board.nodes.length + 1}`;
    const x = pos ? Math.min(78, Math.max(4, Math.round(pos.x))) : 10 + (offset % 40);
    const y = pos ? Math.min(72, Math.max(8, Math.round(pos.y))) : 16 + (offset % 28);
    const node: FolioNode =
      command === "insert-text"
        ? {
            id: nextId,
            kind: "text",
            x,
            y,
            w: 46,
            h: 12,
            label,
          }
        : {
            id: nextId,
            kind: "shape",
            x: pos ? x : 18 + (offset % 36),
            y: pos ? y : 38 + (offset % 20),
            w: 20,
            h: 20,
            label: "",
          };
    return { ...board, nodes: [...board.nodes, node] };
  });
}

export function folioAudit(board: FolioBoard | undefined): { contrast: boolean; overflow: boolean } {
  if (!board) return { contrast: false, overflow: false };
  const overflow = board.nodes.some((node) => node.kind === "text" && node.label.length > 6);
  const contrast = board.nodes.some((node) => node.kind === "text");
  return { contrast, overflow };
}
