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



## 14. 作品真正可用的 70 分門檻

作品集收錄不等於作品已完成。

每個放入作品集的專案，都必須建立 readiness score，滿分 100 分；至少 70 分才可以標記為「可操作作品」或列入 Featured。

評分：

| 項目 | 分數 | 最低要求 |
|---|---:|---|
| 可建置與可部署 | 15 | build 成功、服務可啟動、production 不持續 5xx |
| 核心流程可使用 | 25 | 使用者能完成該作品最重要的主要任務 |
| 資料與狀態 | 15 | 資料可正確保存、讀取、恢復，或明確為唯讀產品 |
| 錯誤與登入邊界 | 10 | 權限不足、離線、錯誤輸入與服務失敗都有清楚處理 |
| 手機與桌面 UX | 10 | 390x844 與 1440x900 都能完成核心操作 |
| 測試與可觀測性 | 10 | 至少有 smoke test、健康檢查或可重現驗證 |
| 作品說明與 Demo | 10 | README、操作步驟、限制與公開入口一致 |
| 資安與資料保護 | 5 | 沒有 secrets、個資外洩或不受控的管理功能 |

### 不可妥協的最低條件

即使總分達到 70，以下任一項不符合，仍不得標記為 ready：

- 首頁或主要路由無法開啟。
- 核心按鈕無法完成主要任務。
- 資料寫入後消失，且產品宣稱支援保存。
- 未登入可以進入不應公開的管理功能。
- 發生錯誤時畫面卡死或無限 loading。
- 手機版無法滾動、輸入或提交。
- 對外洩漏 API key、密碼、個資或 service role。
- 作品集描述與實際功能完全不一致。

### 分數上限

- build 失敗：最高 39 分。
- 核心流程無法完成：最高 59 分。
- 資料或權限有重大安全問題：Blocked，不進入公開作品集。
- 只有 landing page、沒有可使用核心功能：最高 49 分。
- 只有視覺 mockup、沒有真實操作：最高 49 分。

每個專案必須在 registry 保存：

- readinessScore
- readinessStatus
- scoredAt
- scoreEvidence
- failedCriteria
- nextRepairTask

狀態：

- ready：70 分以上且通過最低條件。
- repair-needed：1 至 69 分。
- blocked：有安全、權限或資料重大問題。
- unknown：尚未完成實測。

## 15. 代理修復外部專案的權限規則

為了讓作品真正可用，本計畫允許代理修復官方清單內的外部 repository，但必須遵守：

1. 每個外部 repository 使用獨立 branch。
2. 每個 repository 建立獨立修復 PR。
3. 不直接覆蓋外部 repository 的 main/master。
4. 不修改外部服務的環境變數，除非使用者另行授權。
5. 不把 bruce23 的展示需求硬塞進外部產品。
6. 先修復會阻止核心流程使用的錯誤，再做視覺美化。
7. 每次只修一個 repository 的一個核心流程。
8. 修復後必須在該 repository 執行 build、smoke test 與公開網址驗證。
9. bruce23 只有在 readinessScore 達到 70 以上後，才把作品標示為可操作或 Featured。
10. 如果外部 repository 沒有可用寫入權限，建立 repair specification 與 issue，不能假裝已修復。

修復 PR 命名：

[Repair] Make <project> core workflow usable

修復 PR 必須包含：

- 重現步驟。
- 根本原因。
- 修改內容。
- 核心流程驗證。
- 手機驗證。
- 部署結果。
- readiness score。
- 尚未解決的限制。

## 16. 每個專案的修復循環

代理讀取一個作品後，依序執行：

### A. 建立使用者核心旅程

用一句話定義：

「一位第一次使用的訪客，應該能在幾分鐘內完成什麼？」

例如：

- PLANFORM：建立一個空間，放置桌椅與走道，看到可操作的場佈結果。
- Duigao：建立一個視覺討論內容，查看素材，留下評論或標記。
- Folio：建立或開啟設計，修改基本元素，預覽或匯出。
- ty：完成公開挑戰，看到結果，安全地送出資料。
- AI OS：建立專案，輸入上下文，完成一個多模態工作步驟。
- Hermes Console：查看 runtime，執行一個安全的 agent／tool workflow。
- CUTOS：輸入影片任務，得到時間軸或剪輯計畫。

### B. 實際重現

- 讀取 README、package.json、環境需求與部署設定。
- 開啟 production URL。
- 使用 Playwright 重現手機與桌面流程。
- 記錄第一個阻塞點。
- 不因為頁面漂亮就判定可用。

### C. 優先修復 Blocker

修復順序：

1. build／啟動失敗。
2. production 5xx。
3. 核心路由不存在。
4. 核心按鈕無作用。
5. API 呼叫失敗後畫面卡死。
6. 資料保存或讀取錯誤。
7. 登入與權限錯誤。
8. 手機不能操作。
9. 空狀態與錯誤狀態。
10. 最後才是視覺細節。

### D. 驗證核心流程

每個作品至少要有：

- 首次進入。
- 一次核心輸入。
- 一次主要操作。
- 一次結果呈現。
- 一次重新整理或返回後的狀態驗證。
- 一次錯誤情境驗證。

### E. 計分與回寫

修復完成後：

1. 重新執行 build。
2. 執行測試。
3. 執行 production smoke test。
4. 更新 readinessScore。
5. 將證據寫入 registry。
6. 更新作品集的狀態。
7. 只有達標才開放 Featured 或「立即操作」主按鈕。

## 17. 每 30 分鐘的修復任務選擇順序

代理不可每輪隨機改 UI，應依照以下優先順序：

1. 有 production 5xx 的專案。
2. 有 build failure 的專案。
3. 核心流程無法完成且已有明確重現步驟的專案。
4. 已有 PR 但 CI 失敗的專案。
5. readinessScore 最低且距離 70 分最近的專案。
6. 手機版核心流程阻塞的專案。
7. 只有資料同步或來源狀態未完成的專案。
8. 最後才處理縮圖、動畫與細部視覺。

每輪最多：

- 修復一個核心 blocker；或
- 完成一個小型可驗證改善；或
- 完成一個專案的 readiness scoring。

不得在同一輪同時修改多個外部 repository。

## 18. 新增 Definition of Done

整體計畫完成不只代表作品集頁面完成，還必須符合：

- 官方清單內每個可公開展示作品都有 readiness score。
- 至少 70 分的作品才列為可操作作品。
- 低於 70 分的作品顯示 repair-needed，不得假裝完成。
- blocked 作品不提供誤導性的立即操作入口。
- 每個作品至少能完成一條核心使用旅程，或清楚標示目前不可用。
- 每個外部修復都有獨立 PR、測試證據與部署驗證。
- bruce23 的案例敘事、GitHub、Zeabur、Live Demo 與 readiness score 一致。
- 代理每 30 分鐘能從本文件與 state 繼續，不需要重新猜測進度。

