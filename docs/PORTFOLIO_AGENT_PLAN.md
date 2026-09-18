# Luminous Portfolio Integration Agent — 長期開發計畫

- Target repository: aa0968111723-prog/bruce23
- Target production service: bruce23
- Target public URL: https://bruce23-k7m2.zeabur.app/
- Schedule: */30 * * * *
- Created: 2026-09-18
- Scope: 只修改 bruce23；其他專案只讀取、驗證與建立來源資料
- Owner model: 單一代理寫入線，避免多個代理同時修改相同核心檔案

## 1. 最終目標

把 bruce23 建成一個可持續同步的 Luminous Studio Portfolio OS：

1. 連結 GitHub 真實專案。
2. 連結 Zeabur 實際部署與 runtime 狀態。
3. 每個作品都有分類、縮圖、案例說明、操作入口與來源證據。
4. 作品不是單純連結牆，而是讓訪客看懂、操作、理解技術與限制。
5. 保留現有 CMS、後台、GitHub 同步、Canva OAuth、Live Demo、Experience Mode 與 3D 星圖。
6. 明亮、柔和、有空氣感、有 3D 質感；不做深色 Cyberpunk、HUD 或密集 SaaS 儀表板。
7. 所有狀態必須誠實反映 GitHub、Zeabur 與公開網站實際結果。

作品集定位：

- AI Designer
- Multimodal Design Creator
- AI Product Builder
- Interactive Experience Designer

## 2. 每 30 分鐘執行協定

每輪執行時間上限約 24 分鐘，最後 6 分鐘保留給驗證、部署狀態與紀錄。

每輪必須依序執行：

1. 讀取本文件與目前進度紀錄。
2. 讀取 Git branch、HEAD、工作區狀態與最近部署結果。
3. 建立 portfolio-agent lock；已有 lock 時不可修改檔案。
4. 選擇下一個未完成、風險最低、可在本輪驗證的任務。
5. 修改最少必要檔案。
6. 執行相關測試、typecheck、lint 或 build。
7. 若涉及 UI，至少驗證 390x844 與 1440x900。
8. 若涉及連結，驗證 HTTP status、頁面 title、OG metadata 與實際導覽。
9. 若涉及 GitHub，使用 server-side API；不得把 token 傳到瀏覽器。
10. 若涉及 Zeabur，其他服務只讀取；只有 bruce23 可以觸發部署。
11. 通過驗證後建立小型 commit。
12. 更新本文件的進度、阻塞、證據與下一步。
13. 更新 docs/portfolio-agent/state.json、runtime-report.json 或等效紀錄。
14. 釋放 lock。
15. 回報本輪結果。

每輪不可：

- 同時處理多個互相無關的大功能。
- 重寫整個前端。
- 只改靜態 content 而不檢查 CMS seed 與資料庫。
- 猜測失效網址。
- 把 private repository、個資或環境變數公開。
- 直接執行 destructive migration。
- 執行 git reset --hard、git checkout -- 或覆蓋使用者未提交修改。
- 為了顯示漂亮而製作假的產品截圖或假的連線狀態。

## 3. 安全與權限

必須使用 Zeabur Secrets 或等效 server-side secret：

- GITHUB_TOKEN
- ZEABUR_API_TOKEN
- 其他必要的 provider credentials

禁止：

- 寫入 source code。
- 寫入 README。
- 寫入 public JSON。
- 寫入 localStorage。
- 輸出到 log。
- 傳到 client bundle。
- 放入縮圖 metadata。
- 放入 PR body。

GitHub 權限：

- bruce23：可讀寫目前目標分支，但優先使用小型 branch 與 PR。
- 其他 repository：預設只讀。
- private repository：只能顯示 private／需權限，不得同步私有檔案到公開頁面。

Zeabur 權限：

- bruce23 service：可查詢、部署、讀取部署結果。
- 其他 services：只查詢 service、domain、deployment、runtime status。
- 不可讀取或輸出其他服務環境變數。
- 不可任意重啟、刪除、改寫其他服務。

## 4. Project Registry

建立不含 secrets 的 canonical project registry。至少包含：

- slug
- title
- titleEn
- category
- tags
- githubUrl
- githubVisibility
- liveUrlCandidates
- canonicalLiveUrl
- expectedPageTitle
- zeaburServiceId
- runtimeStatus
- runtimeCheckedAt
- demoAccess
- thumbnailSource
- thumbnailProvenance
- experienceMode
- interactionSteps
- sourceEvidence
- limitations
- lastVerifiedAt

官方專案清單：

| Repository | 建議定位 | 分類 | Live 狀態 |
|---|---|---|---|
| forge-bloom-quiet-falcon | 淡江世界、3D 校園巡禮 | Spatial | 先驗證 forge-bloom-k7xq |
| lunar-crystal-falcon-granite | 待驗證的新作品 | 待分類 | 與 lunar-falcon-8p2r 有 URL 衝突 |
| tku-tamsui-drama-world | 淡江新生導覽、校園闖關、劇本世界 | Narrative / Spatial | 候選 tku-tamsui-drama-world-k4x9 |
| dd | SkateHub、裝備與里程 | Real-world Tool | dd-k3f9 |
| canva2 | Folio 設計編輯器 | Creative Tool | 候選 canva2-k7qm |
| delta-horizon-cliff-fern | 禪學社 Studio、文宣與排程 | Creative Tool | delta-horizon-k7f2 |
| ty | 專注力挑戰賽、活動資料同步 | Real-world Experience | leader-dna-mcp-a7k2 |
| cabin-shale-raven-swift | 待讀取 README 與部署頁面 | 待分類 | cabin-shale-k7q2 |
| hermes-agent | Agent Runtime、Sessions、Tools、API | Agent Runtime | 455.zeabur.app/sessions，需登入 |
| hermes-console | Agent Control Plane、Memory、MCP、Projects | AI Product | 344.zeabur.app |
| wood-ivory-blaze-maple | Lumen、多模態語音創作 | Multimodal | ai-chat-8rq3 |
| -1 | 小財記帳 | Real-world Tool | untitled-5 |
| tku-zen-agent | 禪學社工作台、Ask 模式 | AI Agent | tku-zen-agent-k7f2 |
| duigao | 圖片與影片協作、對稿與版本 | Collaboration | duigao-k7q2 |
| planform-iso | 3D 活動空間彩排與場佈 | Spatial Design | planform-iso-k7d2 |
| ai_os | AI Director OS、多模態創作流程 | AI Product | vexlark.co／ai-os-app |
| CUTOS | Conversational Video Editor | Multimodal | cutos.zeabur.app |

bruce23 自身不列入上述 17 個外部作品；它是作品集主體。

## 5. 已知資料衝突

### tku-tamsui-drama-world

使用者提供的網址與 lunar-falcon-8p2r 重複。

目前候選：

https://tku-tamsui-drama-world-k4x9.zeabur.app/

必須由以下證據共同確認：

- Zeabur service ID。
- 部署 domain。
- 公開頁面 title。
- GitHub README。
- 頁面實際功能。

未驗證前使用 needs_verification。

### canva2

使用者提供的網址與 dd-k3f9 重複。

目前候選：

https://canva2-k7qm.zeabur.app/

不得把 SkateHub 的 live URL 寫入 Folio。

### lunar-crystal-falcon-granite

目前 bruce23 舊資料曾把 lunar-falcon-8p2r 用於 FrameLab。不可直接沿用舊作品敘事。

必須先建立：

- repo identity
- service identity
- canonical domain
- expected title
- actual feature summary

### cabin-shale-raven-swift

在 GitHub README、公開頁面與 Zeabur metadata 驗證完成前，不得自行命名或虛構功能。

## 6. 現有程式架構必須保留

先讀取並理解：

- src/content/projects.ts
- src/content/linked-works.ts
- src/lib/cms/schema.ts
- src/lib/cms/seed.ts
- src/lib/cms/store.ts
- src/lib/cms/privacy.ts
- src/lib/github
- src/lib/demo
- src/components/experience
- src/components/admin
- src/styles.css

目前資料同時存在靜態內容、CMS seed 與資料庫。任何作品更新都要確認：

1. 靜態 fallback。
2. CMS seed。
3. database schema。
4. public serializer。
5. admin editor。
6. public page。
7. tests。

不能只修改一處。

## 7. 實際操作與案例頁

每個作品必須提供：

- 作品用途。
- 解決的問題。
- 觀看者可以實際做什麼。
- 三至五個操作步驟。
- GitHub 來源。
- Zeabur 狀態。
- 技術堆疊。
- 限制。
- 目前完成度。

操作策略：

- 已驗證、允許嵌入：使用 Live Demo iframe。
- 不允許嵌入：提供「開新分頁」。
- 需要登入：顯示登入邊界，不假裝已登入。
- 會寫入資料的作品：使用隔離 demo session 或唯讀模式。
- 含個資的作品：只展示公開操作，不展示名單、電話、表單內容或資料庫資料。
- 遠端服務失敗：顯示 stale、offline、auth-required 或 unknown，不顯示 completed。

## 8. 縮圖規範

縮圖優先順序：

1. 公開網站實際截圖。
2. GitHub 公開圖片。
3. 手機與桌面 Playwright 截圖。
4. 標示為 studio-translation 的視覺封面。

每張縮圖需要：

- alt。
- provenance。
- source URL。
- capturedAt。
- 實際狀態。
- 是否為產品截圖。

狀態標籤：

- 實際網站畫面。
- GitHub 公開素材。
- 工作室視覺轉譯。
- 需要登入。
- 部署待驗證。
- 目前離線。

不得把視覺轉譯誤標成實際產品畫面。

## 9. UI/UX 設計

維持 Luminous Studio：

- #F7FBFF 明亮背景。
- 薄荷綠、天空藍、晨光黃。
- 深藍文字。
- 玻璃感。
- 浮動 3D 卡片。
- 光球、軌道、柔和粒子。
- 80% 清楚 2D 操作。
- 20% 有意義的 3D 空間。

必須：

- Mobile-first。
- 所有主要觸控目標至少 44px。
- 支援鍵盤。
- 支援 prefers-reduced-motion。
- 手機使用卡片與 bottom sheet。
- 桌面可以使用星圖與關係節點。
- 3D 用於表達作品關係、空間或工作流。

避免：

- 深色 Cyberpunk。
- HUD。
- 紫色 SaaS。
- 密集表格。
- 複雜側欄。
- 每個作品都載入重型 WebGL。

## 10. 分階段任務佇列

### Phase 0：安全與基準

- [ ] 建立 docs/portfolio-agent/state.json。
- [ ] 建立 lock 與單一寫入線規則。
- [ ] 掃描 secrets 是否進入 Git、public、client bundle。
- [ ] 檢查未提交修改。
- [ ] 記錄目前 HEAD、部署狀態與 build baseline。

### Phase 1：作品清單與來源

- [ ] 建立 canonical Project Registry。
- [ ] 對齊 17 個官方專案。
- [ ] 修正 tku-tamsui-drama-world URL 衝突。
- [ ] 修正 canva2 URL 衝突。
- [ ] 驗證 lunar 與 cabin。
- [ ] 將舊作品標記 official、legacy 或 archived，不直接刪除。

### Phase 2：GitHub 整合

- [ ] 使用 server-side GitHub API 同步公開 metadata。
- [ ] 使用 rotated token 驗證 private repository visibility。
- [ ] 同步 README 摘要、languages、topics、latest commit。
- [ ] 保留中文人工敘事，不讓 README 自動覆蓋。
- [ ] 顯示 GitHub 最後同步時間與失敗原因。

### Phase 3：Zeabur 整合

- [ ] 建立 server-only Zeabur client。
- [ ] 以 service ID 取得實際 domain。
- [ ] 取得 deployment status。
- [ ] 取得 runtime status。
- [ ] 取得最後部署時間與 commit。
- [ ] 其他服務只讀取。
- [ ] 僅 bruce23 可被部署。
- [ ] 任何 API 錯誤都要落入 stale 或 unknown。

### Phase 4：縮圖與媒體來源

- [ ] 建立 live screenshot pipeline。
- [ ] 擷取 390x844。
- [ ] 擷取 1440x900。
- [ ] 產生 WebP 或 AVIF。
- [ ] 建立縮圖 cache。
- [ ] 為所有圖片加入 provenance。
- [ ] 遮蔽個資、管理員頁面與私密內容。

### Phase 5：作品集 UI

- [ ] 升級 Project Card。
- [ ] 加入分類與 capability chips。
- [ ] 加入 runtime status badge。
- [ ] 加入實際操作入口。
- [ ] 加入來源證據。
- [ ] 升級案例頁。
- [ ] 加入 mobile bottom sheet。
- [ ] 保留現有 3D 星圖。

### Phase 6：互動案例

- [ ] AI Agent／Console 顯示真實登入邊界。
- [ ] Planform 顯示 3D 場佈互動。
- [ ] Duigao 顯示視覺對稿互動。
- [ ] Folio 顯示編輯器 walkthrough。
- [ ] CUTOS 顯示時間軸互動。
- [ ] tku drama 顯示校園闖關。
- [ ] ty 顯示安全的公開挑戰流程。
- [ ] 財務與招生作品不可展示真實個資。

### Phase 7：品質與部署

- [ ] npm run typecheck。
- [ ] npm run lint。
- [ ] npm run build。
- [ ] 相關 unit tests。
- [ ] Playwright mobile smoke test。
- [ ] Playwright desktop smoke test。
- [ ] broken link 檢查。
- [ ] broken image 檢查。
- [ ] console error 檢查。
- [ ] secret scan。
- [ ] 驗證 Zeabur production deployment。
- [ ] 更新 runtime report。

## 11. 風險分級

可自動執行：

- 文案。
- 分類。
- 縮圖。
- 來源標籤。
- CSS。
- 無破壞性 schema 欄位。
- 測試。
- README 與計畫文件。

需要先建立 branch 並驗證：

- CMS migration。
- GitHub API。
- Zeabur API。
- public serializer。
- authentication boundary。
- deployment command。

必須停下並回報：

- 刪除資料。
- destructive migration。
- 改變既有登入安全。
- 暴露 secrets。
- 寫入其他 repository。
- 修改其他 Zeabur service。
- 對外發布個資。
- 沒有證據卻要將作品標記為 verified。

## 12. Definition of Done

本計畫完成時：

- 17 個官方作品都有 registry entry。
- 每個作品都有明確分類。
- 每個作品都有縮圖或明確的待驗證狀態。
- GitHub、Zeabur、Live Demo 狀態不互相矛盾。
- tku drama 與 canva2 不再使用錯誤重複網址。
- private repository 不會洩漏內容。
- 需要登入的作品明確標示。
- 每個作品都有實際操作或誠實的替代入口。
- 手機與桌面都能使用。
- 沒有 secrets 進入 Git 或 client bundle。
- build、lint、typecheck 與必要測試通過。
- bruce23 成功部署。
- state、runtime report 與 changelog 持續更新。

## 13. 每輪回報格式

RUN_ID：
時間：

本輪唯一任務：

完成內容：

修改檔案：

GitHub 驗證：

Zeabur 驗證：

Build／Test 結果：

Mobile／Desktop 結果：

目前阻塞：

風險：

下一輪唯一任務：

