export const site = {
  nameZh: "柏能 · 光域工作室",
  nameEn: "Luminous Studio",
  person: "陳柏能 / Bruce Chen",
  role: "AI Designer · Multimodal Design Creator · AI Product Builder",
  headline: "把 AI、設計與多模態創作，轉化成可使用的體驗。",
  subhead:
    "Designing bright, usable experiences with AI and multimodal creativity.",
  narrative:
    "我把 AI、設計、影像、動畫、3D、互動與真實工作流程，轉化成看得懂、用得上的數位體驗。",
  email: "aa0968111723@gmail.com",
  github: "https://github.com/aa0968111723-prog",
  githubHandle: "aa0968111723-prog",
  location: "Taipei",
} as const;

export const processSteps = [
  {
    n: "01",
    title: "釐清真實問題",
    body: "先對現場：社團文宣、教室場佈、逐幀動畫或協作審稿，而不是先選模型。",
  },
  {
    n: "02",
    title: "編排多模態",
    body: "文字、圖像、影片、聲音、3D 與互動各自負責什麼，先畫清楚再進工具。",
  },
  {
    n: "03",
    title: "讓 AI 做它能驗證的事",
    body: "像素運算、結構化解析、MCP 工具、生成候選。模型沒接上就標示不可用，不給假分數。",
  },
  {
    n: "04",
    title: "回到現場驗證",
    body: "手機、教室、LINE 分享、夥伴是否 10 秒看懂。能用才算完成，不是畫面好看。",
  },
] as const;

export const modalities = [
  { label: "文字", note: "腳本、對稿意見、指令層、結構化提示" },
  { label: "圖像", note: "海報、文宣、畫布、熱圖與構圖分析" },
  { label: "影片", note: "分鏡、逐幀、時間軸、對稿時間座標" },
  { label: "聲音", note: "多模態生成鏈中的音訊節點，不假裝已完成配樂產品" },
  { label: "3D / 空間", note: "等角場佈、教室尺度、動線與碰撞" },
  { label: "互動", note: "社博遊戲、手機工作區、MCP 代理操作" },
] as const;

export const nav = [
  { to: "/", label: "首頁" },
  { to: "/work", label: "作品" },
  { to: "/archive", label: "Archive" },
  { to: "/about", label: "關於" },
] as const;
