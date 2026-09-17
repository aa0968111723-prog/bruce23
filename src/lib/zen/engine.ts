/**
 * Local TKU Zen engine — same contract as the public tku-zen-ai repo
 * (`src/lib/zen.ts`). Deterministic, no network, not a cloud LLM.
 */

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
}

const KOANS = [
  "The obstacle is the path.",
  "When you reach the top of the mountain, keep climbing.",
  "Sitting quietly, doing nothing, spring comes and the grass grows by itself.",
  "No snowflake ever falls in the wrong place.",
  "The quieter you become, the more you can hear.",
  "Wherever you are, be there totally.",
  "Let go, or be dragged.",
  "The mind is everything. What you think you become.",
] as const;

const BREATHS = [
  "Breathe in for 4, hold for 4, out for 6.",
  "One slow breath in through the nose, one longer breath out.",
  "Inhale calm, exhale tension — three times.",
  "Rest your attention on the next single breath.",
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
  const has = (...words: string[]) => words.some((word) => text.includes(word));
  if (has("bye", "goodbye", "see you", "farewell", "掰", "再見")) return "farewell";
  if (has("hi", "hello", "hey", "morning", "greetings", "你好", "哈囉")) return "greeting";
  if (has("stress", "anxious", "anxiety", "overwhelm", "panic", "worried", "焦慮", "壓力", "緊張"))
    return "stress";
  if (has("thank", "grateful", "gratitude", "appreciate", "謝謝", "感恩")) return "gratitude";
  if (has("focus", "distract", "procrastin", "study", "concentrate", "exam", "考試", "讀書", "分心"))
    return "focus";
  if (has("sleep", "tired", "insomnia", "rest", "exhausted", "失眠", "累")) return "sleep";
  return "reflection";
}

const RESPONSES: Record<ZenIntent, readonly string[]> = {
  greeting: [
    "Welcome. Settle in — there is nowhere else you need to be right now.",
    "Hello, friend. Let this moment be a place to pause.",
  ],
  stress: [
    "Notice the weight you are carrying, then set it down for one breath.",
    "Stress is a wave, not the ocean. Let it rise and pass.",
  ],
  gratitude: [
    "Gratitude turns what we have into enough. Hold that feeling gently.",
    "Thankfulness is the quiet root of a peaceful mind.",
  ],
  focus: [
    "Do one thing. Then the next. The path clears as you walk it.",
    "Attention is the rarest form of generosity — offer it to this task.",
  ],
  sleep: [
    "Let the day close like a book. You can rest now.",
    "Release the effort of staying awake; soften into stillness.",
  ],
  farewell: [
    "Go gently. Carry a little stillness with you.",
    "Until next time — may your steps be light.",
  ],
  reflection: [
    "Sit with the question rather than rushing to the answer.",
    "What you seek is also seeking you. Be patient.",
  ],
};

export function zenReply(message: string): ZenReply {
  const trimmed = message.trim();
  const intent = detectIntent(trimmed);
  const seed = hashString(trimmed || "silence");
  const base = pick(RESPONSES[intent], seed);
  const koan = pick(KOANS, seed >> 3);
  const breath = pick(BREATHS, seed >> 7);
  const text =
    trimmed.length === 0
      ? "In silence, the mind finds its own answer. What is on your mind?"
      : `${base} ${koan}`;
  return { intent, message: text, breath };
}
