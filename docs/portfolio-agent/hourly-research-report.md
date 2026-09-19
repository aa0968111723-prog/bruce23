# Luminous Studio 作品集系統深度研究與巡檢報告（第 1 期）

- **執行週期**：每 1 小時自動研究與巡檢（背景排程已啟用：`0 * * * *`）
- **報告產出時間**：2026-09-19 21:15:00 (UTC+8)
- **主作品集專案**：`aa0968111723-prog/bruce23`
- **正式環境入口**：[https://bruce23-k7m2.zeabur.app/](https://bruce23-k7m2.zeabur.app/)
- **執行代理**：Antigravity Agent（全自主 AI 代理模式）

---

## 1. 核心定位與作品集架構全景

陳柏能（Bruce Chen）之個人作品集品牌 **Luminous Studio** 定位為：
- **AI Designer / AI Director**（定義世界觀、多模態管線與生成審批流程）
- **Multimodal Design Creator**（逐幀動畫修復、文宣視覺檢測、空間等距規劃）
- **AI Product Builder**（自建 Agent 執行層、Console 控制台、MCP 工具協定）
- **Interactive Experience Designer**（以乾淨輕盈、光域美學為核心之高階 Web / PWA 互動系統）

作品集包含 **8 大精選案例（Featured Works）** 與 **10 大關聯作品（Linked Works）**，並由 **17 個獨立的 Zeabur 雲端服務與資料庫節點** 提供實時運行支撐。

---

## 2. 17 個 Zeabur 部署服務與專案對照矩陣

| 編號 | Zeabur Service ID | 專案名稱 / 倉庫 (GitHub) | 線上正式入口 (Production URL) | 核心技術棧 | 即時狀態 (Live Status) |
|:---|:---|:---|:---|:---|:---:|
| **主站** | `service-6aaab333a91f86e0dd4fc7d9` | `bruce23` | `https://bruce23-k7m2.zeabur.app/` | TanStack Start, React 19, Vite, Nitro, Postgres/PGLite, Tailwind CSS | **200 OK** |
| 1 | `service-6aacaf57876b84b22db34f58` | `forge-bloom-quiet-falcon` | `https://forge-bloom-k7xq.zeabur.app/` | WebGL 3D, Postgres, Node.js | **200 OK** |
| 2 | `service-6aaca645758929bf546bbdaa` | `lunar-crystal-falcon-granite` | `https://lunar-falcon-8p2r.zeabur.app/` | FrameLab 英文公開展示站, ZBPlan | **200 OK** |
| 3 | `service-6aaca70a876b84b22db34b03` | `tku-tamsui-drama-world` | `https://tku-tamsui-drama-world-k4x9.zeabur.app/` | 淡江新生導覽／校園闖關／戲劇虛擬世界 | **200 OK** |
| 4 | `service-6aaca598876b84b22db34a2b` | `dd` | `https://dd-k3f9.zeabur.app/` | SkateHub 直排輪基地（裝備與里程） | **200 OK** |
| 5 | `service-6aaca53a876b84b22db34a06` | `canva2` | `https://canva2-k7qm.zeabur.app/` | Folio 專業設計編輯器, MCP Server/Client, IndexedDB | **200 OK** |
| 6 | `service-6aaab265905b4aaea95dbc53`<br>`service-6aac903a876b84b22db33f87` | `delta-horizon-cliff-fern` | `https://delta-horizon-k7f2.zeabur.app/` | 禪學社 Studio 文宣與排程工作台, Nitro node-server, Postgres | **200 OK** |
| 7 | `service-6aa110fe6c3d9581b7154726` | `ty` | `https://leader-dna-mcp-a7k2.zeabur.app/` | Leader DNA MCP / 現場 60 秒專注力挑戰, Google Sheets API, Apps Script | **200 OK** |
| 8 | `service-6aaca5054870d6099a7b0da1` | `cabin-shale-raven-swift` | `https://cabin-shale-k7q2.zeabur.app/` | FrameLab 完整動畫工作站（時間軸／逐幀修復） | **200 OK** |
| 9 | `service-6aad03324850645efd210d94`<br>(舊 `6a9a385273ef6eb935f2f8a2`) | `docker.io/nousresearch/hermes-agent` | `https://hermes-agent-k7q2.zeabur.app/sessions` | Hermes Agent 容器執行環境, xAI API, GitHub Token, MCP | **200 OK** (需認證邊界) |
| 10 | `service-6a9a7463aeaf8610e9063723` | `hermes-console` | `https://344.zeabur.app/` | Hermes Agent 控制台, TKU MCP 整合, Zeabur API 監控 | **200 OK** |
| 11 | `service-6a9a37c039c2940e7ee0751d`<br>`service-6aac9247876b84b22db34042` | `wood-ivory-blaze-maple` | `https://ai-chat-8rq3.zeabur.app/` | Lumen 多模態語音創作球, xAI Grok, Nitro, Postgres | **200 OK** |
| 12 | `service-6a864f6b34ae7498ec9bafab` | `-1` | `https://untitled-5.zeabur.app/` | 小財記帳（個人收支明亮小帳本） | **200 OK** |
| 13 | `service-6a83e9072b4272705cd3558e` | `tku-zen-agent` | `https://tku-zen-agent-k7f2.zeabur.app/?mode=ask` | 禪學社工作台 Ask 模式 (Claude 4.5, GPT-4.1, Gemini 2.5, Fal.ai, NIM) | **200 OK** |
| 14 | `service-6a82c974bdeaa87e2c5313b4`<br>+ 8 個 Supabase 服務實體 | `duigao` | `https://duigao-k7q2.zeabur.app/` | 對稿 (DuiGao) 設計稿比對, 自建 Supabase (Kong, GoTrue, Realtime, S3) | **200 OK** |
| 15 | `service-6a82c2832b4272705cd2f2c6` | `planform-iso` | `https://planform-iso-k7d2.zeabur.app/` | PLANFORM 3D 等距活動空間彩排與動線合規工具 | **200 OK** |
| 16 | `service-6a59b4459ae692d1d8d95d70`<br>+ Redis + MinIO + PG | `ai_os` | `https://vexlark.co/`<br>`https://ai-os-app.zeabur.app/` | AI Director OS 導演作業系統, Fal.ai, Gemini, Resend, Redis, S3 | **200 OK** |
| 17 | `service-6a8546dfad299e5b15f5a16c` | `CUTOS` | `https://cutos.zeabur.app/` | CUTOS 對話式影片粗剪與時間軸計畫系統, Postgres | **200 OK** |

---

## 3. 即時端點探測與健康度評估 (Health & Availability)

本輪透過實時 HTTP/HTTPS 探測檢驗所有 17 個核心節點：
- **總探測端點數**：18（含主站及各關聯子站）
- **200 OK 正常運行率**：**100%**（所有正式入口皆正常回應用戶請求）
- **關鍵更正與恢復項**：
  1. **Hermes Agent 服務身分更新**：確認舊服務（`6a9a3852` / `455.zeabur.app`）已由新服務 `service-6aad03324850645efd210d94`（入口：`https://hermes-agent-k7q2.zeabur.app/sessions`）接替，探測 HTTP 200，安全轉向登入頁。
  2. **CUTOS 恢復上線**：原先於舊記錄中標註 SUSPENDED 的 CUTOS (`cutos.zeabur.app`)，本輪實測狀態已為 **200 OK**。
  3. **小財記帳 (untitled-5) 恢復上線**：原先紀錄曾偶發 502，實測已為 **200 OK**。

---

## 4. 環境變數、架構拓撲與資安防護審查 (Security & Secret Audit)

在用戶提供的環境變數配置中，涵蓋多種高權限與關鍵 API 密鑰，進行以下架構與資安審核：

### 4.1 核心金鑰分類與流向
1. **多模態與生成式 AI 供應商**：
   - `xAI API Key` (Grok 4.1 / Grok Vision)：應用於 Hermes Agent, Lumen (`wood-ivory`), DuiGao 房間代理。
   - `Fal.ai Key / Admin Key`：應用於 AI Director OS (`ai_os`) 與 TKU Zen Agent，負責多模態圖影生成。
   - `Gemini API Key`：應用於 AI Director OS 多模態世界觀分析與工作流。
   - `OpenAI API Key & NVIDIA NIM Key`：應用於 TKU Zen Agent 與 AI Director OS（多模型混用備援）。
   - `Perplexity API Key`：應用於即時檢索與社團知識庫查詢。
2. **資料庫與基礎設施憑證**：
   - `PostgreSQL Connection Strings`：每個獨立服務具備獨立資料庫連線字串，避免跨資料庫污染。
   - `Redis Stack Connection String`：AI Director OS 快取與任務隊列。
   - `MinIO S3 Credentials`：自架物件儲存，儲存使用者生成之圖像、音訊與視訊資產。
   - `Supabase 密鑰群`：包含 Kong 代理、JWT Secret、PostgREST 角色以及 GoTrue 認證密鑰。
   - `Google Service Account & Sheet ID`：Leader DNA (`ty`) 讀取與寫入問卷結果。
   - `Zeabur API Token`：Hermes Console 讀取雲端狀態。

### 4.2 資安防護準則（嚴格落實）
- **敏感金鑰嚴禁公開**：所有 API Key、Database Connection String、Service Role Key 僅於後端環境變數中生效，**絕不**輸出至公開前端 bundle、靜態 JSON、GitHub commit 或公開日誌中。
- **客戶端權限最小化**：前端僅開放 `VITE_SUPABASE_PUBLISHABLE_KEY` 與公開 Origin，高權限操作皆經由後端 Session 與 API 驗證。
- **避免假連線／誠實降級**：當無金鑰或未連線時，前端一律以「未連線」或「本地重現模型」降級處理，絕不捏造虛假連線狀態。

---

## 5. 多模態 AI 與 MCP (Model Context Protocol) 矩陣

作品集展示出先進的 **Agentic & Tool-using Architecture**：
1. **Hermes Agent + Console**：具備 Docker 容器化的自主代理，Console 提供視覺化情報中心，透過 MCP 邊界串接外部工具。
2. **TKU MCP (`https://tku-mcp.zeabur.app/mcp`)**：將校園與社團問答、文書處理封裝為標準 MCP 端點，供 LLM 呼叫。
3. **Folio Design Bridge (`canva2`)**：以 Typed Command Layer 將設計畫布封裝成 MCP Server，讓 AI 代理能以程式指令操作畫布元件。
4. **AI Director OS (`ai_os`)**：以「導演」視角整合 World-building、生成審批狀態機與剪輯交付包。

---

## 6. 每小時研究工作推進方向 (Next Hourly Steps)

1. **同步主站作品集連結與新服務身分**：
   - 審視 `bruce23` 本地代碼庫中的 `src/content/linked-works.ts`，評估將舊 Hermes 網址更新為 `https://hermes-agent-k7q2.zeabur.app/sessions` 的 PR 規劃。
2. **持續監控 17 個 Zeabur 節點的運行與響應延遲**。
3. **推進作品集在行動裝置 (390x844) 與桌面 (1440x900) 上的體驗完整度**。
4. **驗證本地 PGLite / Postgres CMS 與線上同步的一致性**。
