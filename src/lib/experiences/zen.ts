export type ZenIntent =
  | "greeting"
  | "stress"
  | "gratitude"
  | "focus"
  | "sleep"
  | "farewell"
  | "reflection";

export interface ZenReply {
  intent: ZenIntent;
  message: string;
  breath: string;
  local: true;
}

const KOANS = [
  "障礙即是道路。",
  "坐到山頂，還是要繼續走。",
  "靜坐無事，春天來了，草自己長。",
  "沒有一片雪花落錯地方。",
  "愈安靜，愈聽得見。",
  "你在哪裡，就完整地在哪裡。",
] as const;

const BREATHS = [
  "吸氣 4，停 4，吐氣 6。",
  "鼻子慢慢吸，嘴巴再長一點地吐。",
  "吸進平靜，吐出緊繃，三次就好。",
  "只把注意力放在下一次呼吸。",
] as const;

export function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return hash >>> 0;
}

function pick<T>(items: readonly T[], seed: number): T {
  const index = ((Math.trunc(seed) % items.length) + items.length) % items.length;
  return items[index];
}

export function detectIntent(message: string): ZenIntent {
  const text = message.toLowerCase();
  const has = (...words: string[]) => words.some((w) => text.includes(w));
  if (has("bye", "再見", "掰", "goodbye", "farewell")) return "farewell";
  if (has("hi", "hello", "hey", "你好", "哈囉", "早安")) return "greeting";
  if (has("stress", "anxious", "焦慮", "壓力", "緊張", "煩", "慌")) return "stress";
  if (has("thank", "grateful", "謝謝", "感恩")) return "gratitude";
  if (has("focus", "exam", "考試", "念書", "分心", "deadline", "作業")) return "focus";
  if (has("sleep", "tired", "累", "失眠", "想睡", "exhausted")) return "sleep";
  return "reflection";
}

const RESPONSES: Record<ZenIntent, readonly string[]> = {
  greeting: ["歡迎。此刻不用趕去別處。", "你好。讓這一秒先停一下。"],
  stress: ["先看見你正在扛的重量，再為一次呼吸把它放下。", "壓力是浪，不是整片海。"],
  gratitude: ["謝謝把心裡的光說出來。", "感恩讓已經擁有的，變得足夠。"],
  focus: ["一次只做一件。路是走出來的。", "把注意力當成禮物，送給眼前這件事。"],
  sleep: ["讓今天像書一樣闔上。你可以休息。", "不必再用力醒著。"],
  farewell: ["慢慢走。帶一點安靜離開。", "下次見。步子輕一點。"],
  reflection: ["先陪著問題坐一會兒，再急著找答案。", "你找的，也正在找你。"],
};

export function zenReply(message: string): ZenReply {
  const trimmed = message.trim();
  const intent = detectIntent(trimmed);
  const seed = hashString(trimmed || "silence");
  const base = pick(RESPONSES[intent], seed);
  const koan = pick(KOANS, seed >> 3);
  const breath = pick(BREATHS, seed >> 7);
  return {
    intent,
    local: true,
    breath,
    message:
      trimmed.length === 0
        ? "沉默裡也有答案。你現在想說一句什麼？"
        : `${base} ${koan}`,
  };
}
