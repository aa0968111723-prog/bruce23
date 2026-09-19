# Luminous Studio UI/UX 質感優化與技術方向演進藍圖

- **建立時間**：2026-09-19
- **目標專案**：a0968111723-prog/bruce23
- **正式入口**：https://bruce23-k7m2.zeabur.app/
- **核心方針**：保持技術完全真實正確，打造國際頂級 AI/多模態設計師的「光域（Luminous）」美學體驗

---

## 1. 視覺美學哲學：光域工作室 (Luminous Studio Aesthetic)

本專案拒絕廉價、冰冷的「深色 Cyberpunk」或擁擠密集「SaaS 儀表板」，全面奠定**「明亮、柔和、空氣感、有 3D 質感」**的高階數位作品集風格：

### 1.1 色彩與光譜 (Chromatic Palette)
- **空間晨光基底**：#f7fbff（淡天青色，提供廣闊透光感，取代刺眼的死白）
- **霧面磨砂表面**：gba(255, 255, 255, 0.82)，搭配 16px - 24px backdrop blur，營造透光的物理玻璃質感
- **生命力能量點綴**：
  - 薄荷綠 (#63e6be / #2bb894)：代表 AI 生命力、運作正常、自然呼吸
  - 天空藍 (#72b7ff)：代表空間導航、焦點環（Focus Ring）與星圖連線
  - 暖陽金 (#ffd166)：代表靈感亮點與精選推薦
- **沉穩閱讀墨色**：#17324d（深群青墨色，提供高對比又具人文厚度的文字閱讀體驗）

### 1.2 排版與層次 (Typographic Hierarchy)
- **展示型大標 (Display)**：Fraunces（經典人文襯線體）+ Noto Serif TC（思源宋體），傳遞導演級作品的文藝與思想深度。
- **操作型介面 (Sans-serif)**：Figtree（現代幾何無襯線）+ Noto Sans TC，清晰、乾淨、高可讀性。
- **微排版標準**：文字採用 	ext-wrap: balance 與 	ext-wrap: pretty，確保標題行長優雅，杜絕孤字成行。

---

## 2. 四大 UI/UX 質感升級專案

### 專案一：首頁 3D 星圖 (Constellation Canvas) 質感進化
- **現狀**：已具備 SVG 節點佈局與模態分群（圖像、3D、敘事、語音、互動）。
- **升級方向**：
  1. **動態微漫射光流 (Ambient Constellation Glow)**：當使用者 hover 或切換上方模態標籤時，相應節點的連線產生淡藍/薄荷綠的漸變發光脈衝。
  2. **景深立體浮動 (Organic Floating Depth)**：在桌面端以 CSS 輕量 3D perspective (otateX, otateY) 賦予星圖微幅的懸浮視差，創造探索宇宙星圖的沉浸感。
  3. **節點晶片 (Node Chips)**：邊框加入微弱的光澤反射 (order: 1px solid color-mix(in oklab, var(--color-line) 80%, white))，卡片懸浮時帶來柔順的光影回饋。

### 專案二：作品體驗面板 (ExperiencePanel) 沉浸式分頁與骨架過渡
- **現狀**：包含 play、isual、github、canva、how、source 六大視角。
- **升級方向**：
  1. **光感分頁切換 (Fluid Pill Transitions)**：使用平滑彈性動效，切換分頁時指示底色流暢滑移，按鈕保持至少 44px（min-h-11）點擊熱區。
  2. **磨砂骨架屏 (Frosted Glass Skeleton)**：在載入 Live Demo iframe、Canvas 渲染或 GitHub 檔案樹時，顯示帶有柔和微光流動的磨砂玻璃骨架，徹底告別生硬的空白閃爍。
  3. **沉浸式暗角光場 (Vignette Light Field)**：彈窗背面覆蓋淡藍半透光暈，使視線自然聚焦於作品內容本體。

### 專案三：誠實性徽章 (Honesty Badges) 的高級感微排版
- **現狀**：以文字誠實標註「工作室視覺轉譯」、「公開站實際畫面」、「本地重現引擎」。
- **升級方向**：
  1. **將「誠實」昇華為極致奢華的設計語言**：
     - 設計專屬的微膠囊徽章（微邊框 + 0.5px 精緻內陰影 + 薄荷綠微小呼吸燈指示點）。
     - 訪客一眼即能感知：這是一個「敢於呈現真實邊界與真實技術」的頂尖工程師/設計師作品集，而非誇大不實的展示頁。

### 專案四：多端設備 (Mobile 390px ~ Desktop 1440px) 的流暢響應
- **現狀**：已建立基礎流動排版，但部分小螢幕需要注意水平邊距與導覽列摺疊。
- **升級方向**：
  1. **手機端單手操作流**：體驗面板底部設計滑動抽屜（Bottom Sheet），便於拇指切換分頁。
  2. **超寬螢幕 (1440px+) 視野錨定**：雙欄對齊排版，左側固定核心脈絡與技術堆疊，右側流動展示 3D/Canvas 互動視圖。

---

## 3. 技術方向正確性：不可動搖之四大基石

1. **真實端點與部署狀態對齊**：
   - 17 個 Zeabur 服務節點（包含全套 PostgreSQL、Supabase 微服務、Hermes 容器、Redis 快取與前端應用）必須持續監控且如實反映在作品集。
2. **安全第一（Zero Secret Exposure）**：
   - 所有多模態 AI API Key (xAI, Fal.ai, Gemini, NVIDIA, OpenAI) 與資料庫帳密只存在於後端環境變數，絕對禁止在前端代碼、公開 JSON 或 Commit 中暴露。
3. **誠實降級原則（Honest Degradation）**：
   - 當第三方 API 或金鑰未配置時，系統以本地結構化引擎或明確的 Fallback 呈現，絕不捏造虛假連線或偽造生成截圖。
4. **多代理防重複發 PR 協議**：
   - 長期計畫唯一錨定 PR #6。
   - 所有代理開 PR 前必查 gh pr list，嚴禁開立重複 PR，確保多代理協作秩序清晰。

---

## 4. 持續一小時一次的研究巡檢架構

每小時整點喚醒時，自動落實以下雙向檢驗：
- **【技術維度】**：17 節點 HTTP 健康探測、Git 分支演進、資料層狀態同步、安全憑證防護審查。
- **【UI/UX 維度】**：首頁星圖流暢度、卡片微動效、字體排版層次、移動端適配與無障礙（Accessibility / Reduced Motion）合規性。
