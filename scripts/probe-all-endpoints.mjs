import { hrtime } from "node:process";

const ENDPOINTS = [
  { id: "main", name: "Luminous Studio 主作品集", url: "https://bruce23-k7m2.zeabur.app/" },
  { id: "forge-bloom", name: "淡江世界 3D 校園巡禮", url: "https://forge-bloom-k7xq.zeabur.app/" },
  { id: "lunar-falcon", name: "FrameLab 英文首頁", url: "https://lunar-falcon-8p2r.zeabur.app/" },
  { id: "tku-drama", name: "淡江新生導覽 (戲劇世界)", url: "https://tku-tamsui-drama-world-k4x9.zeabur.app/" },
  { id: "skatehub", name: "SkateHub 直排輪圖鑑", url: "https://dd-k3f9.zeabur.app/" },
  { id: "folio", name: "Folio 設計編輯器 & MCP", url: "https://canva2-k7qm.zeabur.app/" },
  { id: "delta-horizon", name: "禪學社 Studio 工作台", url: "https://delta-horizon-k7f2.zeabur.app/" },
  { id: "ty", name: "專注力挑戰賽", url: "https://leader-dna-mcp-a7k2.zeabur.app/" },
  { id: "cabin-shale", name: "FrameLab 中文工作站", url: "https://cabin-shale-k7q2.zeabur.app/" },
  { id: "hermes-agent", name: "Hermes Agent 後台", url: "https://hermes-agent-k7q2.zeabur.app/sessions" },
  { id: "hermes-console", name: "Hermes Console 免登入情報台", url: "https://344.zeabur.app/" },
  { id: "lumen", name: "Lumen 語音創作球", url: "https://ai-chat-8rq3.zeabur.app/" },
  { id: "xiaocai", name: "小財記帳", url: "https://untitled-5.zeabur.app/" },
  { id: "tku-zen-agent", name: "禪學社工作台 (Ask 模式)", url: "https://tku-zen-agent-k7f2.zeabur.app/?mode=ask" },
  { id: "duigao", name: "對稿 DuiGao 協作白板", url: "https://duigao-k7q2.zeabur.app/" },
  { id: "planform", name: "PLANFORM 空間彩排", url: "https://planform-iso-k7d2.zeabur.app/" },
  { id: "ai_os", name: "AI Director OS (Vexlark)", url: "https://vexlark.co/" },
  { id: "ai_os-alt", name: "AI Director OS (備用)", url: "https://ai-os-app.zeabur.app/" },
  { id: "cutos", name: "CUTOS 對話影片剪輯", url: "https://cutos.zeabur.app/" },
];

async function probeUrl(item) {
  const start = hrtime.bigint();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(item.url, {
      signal: controller.signal,
      headers: { "User-Agent": "Luminous-Portfolio-Sentinel/3.0" },
    });
    clearTimeout(timeout);
    const end = hrtime.bigint();
    const latency = Number(end - start) / 1e6;
    return {
      ...item,
      status: res.status,
      ok: res.status >= 200 && res.status < 400,
      latencyMs: Math.round(latency),
    };
  } catch (err) {
    const end = hrtime.bigint();
    const latency = Number(end - start) / 1e6;
    return {
      ...item,
      status: "ERR",
      ok: false,
      latencyMs: Math.round(latency),
      error: err.message,
    };
  }
}

async function main() {
  console.log(`[Sentinel] 開始探測 ${ENDPOINTS.length} 個端點...`);
  const results = await Promise.all(ENDPOINTS.map(probeUrl));
  console.log(JSON.stringify(results, null, 2));
}

main();
