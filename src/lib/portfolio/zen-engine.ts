export type ZenReply = {
  intent: string;
  message: string;
  breath: string;
};

const RULES: Array<{ intent: string; tests: RegExp[]; message: string; breath: string }> = [
  {
    intent: "stress",
    tests: [/緊張|壓力|焦慮|stress|anxious|worried|考試|忙/i],
    message: "先把這一輪呼吸做完。事情還在，但你不必一次扛完。",
    breath: "吸氣四拍，停一拍，吐氣六拍。重複三次。",
  },
  {
    intent: "tired",
    tests: [/累|疲倦|tired|睡|exhausted/i],
    message: "身體已經給過訊號。允許自己慢一拍，比再撐一次更有用。",
    breath: "肩膀放下，吐氣比吸氣長。",
  },
  {
    intent: "gratitude",
    tests: [/謝謝|感恩|開心|平靜|thank|calm|peace/i],
    message: "把這一點亮的感覺記住位置。它不需要被解釋才算數。",
    breath: "輕輕吸氣，微笑不必做給誰看。",
  },
  {
    intent: "anger",
    tests: [/生氣|怒|煩|angry|annoyed|不爽/i],
    message: "怒氣是邊界在說話。先命名它，再決定要不要行動。",
    breath: "腳踩實地面，吐氣時數到四。",
  },
];

export function localZenReply(input: string): ZenReply {
  const text = input.trim();
  if (!text) {
    return {
      intent: "empty",
      message: "先寫下一句就好。不一定要完整。",
      breath: "吸氣，停，吐氣。",
    };
  }
  for (const rule of RULES) {
    if (rule.tests.some((re) => re.test(text))) {
      return { intent: rule.intent, message: rule.message, breath: rule.breath };
    }
  }
  return {
    intent: "presence",
    message: "我在。這句話被接住了，不必立刻變成答案。",
    breath: "看著呼吸進出鼻尖三次。",
  };
}
