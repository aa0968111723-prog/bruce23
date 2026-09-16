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
  "吸氣四拍，停四拍，吐氣六拍。",
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
  if (has("bye", "goodbye", "see you", "farewell", "再見", "掰")) return "farewell";
  if (has("hi", "hello", "hey", "morning", "greetings", "你好", "哈囉")) return "greeting";
  if (has("stress", "anxious", "anxiety", "overwhelm", "panic", "worried", "壓力", "焦慮", "煩"))
    return "stress";
  if (has("thank", "grateful", "gratitude", "appreciate", "謝謝", "感恩")) return "gratitude";
  if (has("focus", "distract", "procrastin", "study", "concentrate", "exam", "專注", "考試"))
    return "focus";
  if (has("sleep", "tired", "insomnia", "rest", "exhausted", "睡", "累")) return "sleep";
  return "reflection";
}

const RESPONSES: Record<ZenIntent, readonly string[]> = {
  greeting: [
    "Welcome. Settle in — there is nowhere else you need to be right now.",
    "你好。先把這一口氣坐下來。",
  ],
  stress: [
    "Notice the weight you are carrying, then set it down for one breath.",
    "壓力是浪，不是整片海。讓它過去。",
  ],
  gratitude: [
    "Gratitude turns what we have into enough. Hold that feeling gently.",
    "謝謝這件事本身，已經是安靜的練習。",
  ],
  focus: [
    "Do one thing. Then the next. The path clears as you walk it.",
    "一次只做一件。路會在走的時候出現。",
  ],
  sleep: [
    "Let the day close like a book. You can rest now.",
    "把今天闔上。你可以休息了。",
  ],
  farewell: [
    "Go gently. Carry a little stillness with you.",
    "慢慢走。帶一點安靜離開。",
  ],
  reflection: [
    "Sit with the question rather than rushing to the answer.",
    "先陪著問題坐一會兒，不必急著給答案。",
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
      ? "In silence, the mind finds its own answer. 此刻想說什麼？"
      : `${base} ${koan}`;
  return { intent, message: text, breath };
}
