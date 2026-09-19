# Luminous Portfolio Integration Agent — 長期開發計畫

- Target repository: aa0968111723-prog/bruce23
- Target production service: bruce23
- Target public URL: https://bruce23-k7m2.zeabur.app/
- Schedule: 0 * * * *
- Created: 2026-09-18
- Scope: 只修改 bruce23；其他專案只讀取、驗證與建立來源資料
- Owner model: 單一代理寫入線，避免多個代理同時修改相同核心檔案
- Multi-agent collaboration: 主代理 (Codex/Antigravity)、質檢代理 (Grok Bot Sentinel)、修復代理 (Repair Bots) 協同作業；嚴禁重複建立 PR，嚴禁覆蓋已有責任範圍的 PR。

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

## 2. 每小時執行協定與多代理防重複 PR 指引

### 2.1 多代理任務分工與防重複 PR 協議 (Multi-Agent & De-duplication Protocol)

為確保多代理協同不發生衝突與重複發 PR，所有執行代理必須遵守以下任務分工與協定：

1. **查重第一（De-duplication First）**：
   - 任何代理在開 PR 或建立分支前，必須先執行 `gh pr list --state all` 檢查現有與已關閉/合併的 PR。
   - **長期整合計畫**：唯一對應 **PR #6**（分支 `codex/portfolio-agent-plan`），嚴禁開立第二個 Plan PR。
   - **原子修復任務**：若要進行單一作品修正（如 Card 1, Card 2...），必須先檢查是否已有同名或相同目標的 PR 處於 Open 或 Merged 狀態。
2. **多代理實作任務方向劃分**：
   - **主架構代理（Codex / Antigravity Agent）**：
     * 負責維護並 landing PR #6（長期開發計畫與全域 Project Registry）。
     * 負責多模態管線架構、各服務 API 邊界安全性與環境變數隔離審查。
     * 每小時整點執行全景系統研究與巡檢日誌更新。
   - **質檢代理（Grok Bot / Sentinel Agent）**：
     * 嚴格依據 `docs/GROK_BOT_PORTFOLIO_TASK.md`，每小時針對 17 個公開端點進行黑箱測試。
     * 驗收實際畫面、標題、OG Tags、認證邊界，計算 100 分制之客觀 Readiness Score。
     * 專注於質檢報告產出，不發起重構或重複的計畫型 PR。
   - **修復代理（Copilot / Repair Bots）**：
     * 依據 `docs/portfolio-agent/implementation-cards/` 下的未完成卡片，進行單一、原子化的代碼修復（如修復單一作品的 Live Demo URL、修正文字標籤或移除過期 502 標註）。
     * 每次修復獨立建 branch，通過單元測試後發起精確命名的 Repair PR。
3. **語系與名詞不變量**：
   - 全面維持繁體中文（闖關、安倢、一盞燈、發布、對稿、場佈）。
   - 不得簡體化，不得使用錯誤替換字（如將「闖」改為「闘」、「倢」改為「倕」）。

### 2.2 每小時執行步驟

每輪執行時間上限約 50 分鐘，最後 10 分鐘保留給驗證、部署狀態與紀錄。

每輪必須依序執行：
1. 璁€鍙栨湰鏂囦欢鑸囩洰鍓嶉€插害绱€閷勩€?
2. 璁€鍙?Git branch銆丠EAD銆佸伐浣滃崁鐙€鎱嬭垏鏈€杩戦儴缃茬祼鏋溿€?
3. 寤虹珛 portfolio-agent lock锛涘凡鏈?lock 鏅備笉鍙慨鏀规獢妗堛€?
4. 閬告搰涓嬩竴鍊嬫湭瀹屾垚銆侀ⅷ闅渶浣庛€佸彲鍦ㄦ湰杓璀夌殑浠诲嫏銆?
5. 淇敼鏈€灏戝繀瑕佹獢妗堛€?
6. 鍩疯鐩搁棞娓│銆乼ypecheck銆乴int 鎴?build銆?
7. 鑻ユ秹鍙?UI锛岃嚦灏戦璀?390x844 鑸?1440x900銆?
8. 鑻ユ秹鍙婇€ｇ祼锛岄璀?HTTP status銆侀爜闈?title銆丱G metadata 鑸囧闅涘皫瑕姐€?
9. 鑻ユ秹鍙?GitHub锛屼娇鐢?server-side API锛涗笉寰楁妸 token 鍌冲埌鐎忚鍣ㄣ€?
10. 鑻ユ秹鍙?Zeabur锛屽叾浠栨湇鍕欏彧璁€鍙栵紱鍙湁 bruce23 鍙互瑙哥櫦閮ㄧ讲銆?
11. 閫氶亷椹楄瓑寰屽缓绔嬪皬鍨?commit銆?
12. 鏇存柊鏈枃浠剁殑閫插害銆侀樆濉炪€佽瓑鎿氳垏涓嬩竴姝ャ€?
13. 鏇存柊 docs/portfolio-agent/state.json銆乺untime-report.json 鎴栫瓑鏁堢磤閷勩€?
14. 閲嬫斁 lock銆?
15. 鍥炲牨鏈吉绲愭灉銆?

姣忚吉涓嶅彲锛?

- 鍚屾檪铏曠悊澶氬€嬩簰鐩哥劇闂滅殑澶у姛鑳姐€?
- 閲嶅鏁村€嬪墠绔€?
- 鍙敼闈滄厠 content 鑰屼笉妾㈡煡 CMS seed 鑸囪硣鏂欏韩銆?
- 鐚滄脯澶辨晥缍插潃銆?
- 鎶?private repository銆佸€嬭硣鎴栫挵澧冭畩鏁稿叕闁嬨€?
- 鐩存帴鍩疯 destructive migration銆?
- 鍩疯 git reset --hard銆乬it checkout -- 鎴栬钃嬩娇鐢ㄨ€呮湭鎻愪氦淇敼銆?
- 鐐轰簡椤ず婕備寒鑰岃＝浣滃亣鐨勭敘鍝佹埅鍦栨垨鍋囩殑閫ｇ窔鐙€鎱嬨€?

## 3. 瀹夊叏鑸囨瑠闄?

蹇呴爤浣跨敤 Zeabur Secrets 鎴栫瓑鏁?server-side secret锛?

- GITHUB_TOKEN
- ZEABUR_API_TOKEN
- 鍏朵粬蹇呰鐨?provider credentials

绂佹锛?

- 瀵叆 source code銆?
- 瀵叆 README銆?
- 瀵叆 public JSON銆?
- 瀵叆 localStorage銆?
- 杓稿嚭鍒?log銆?
- 鍌冲埌 client bundle銆?
- 鏀惧叆绺湒 metadata銆?
- 鏀惧叆 PR body銆?

GitHub 娆婇檺锛?

- bruce23锛氬彲璁€瀵洰鍓嶇洰妯欏垎鏀紝浣嗗劒鍏堜娇鐢ㄥ皬鍨?branch 鑸?PR銆?
- 鍏朵粬 repository锛氶爯瑷彧璁€銆?
- private repository锛氬彧鑳介’绀?private锛忛渶娆婇檺锛屼笉寰楀悓姝ョ鏈夋獢妗堝埌鍏枊闋侀潰銆?

Zeabur 娆婇檺锛?

- bruce23 service锛氬彲鏌ヨ銆侀儴缃层€佽畝鍙栭儴缃茬祼鏋溿€?
- 鍏朵粬 services锛氬彧鏌ヨ service銆乨omain銆乨eployment銆乺untime status銆?
- 涓嶅彲璁€鍙栨垨杓稿嚭鍏朵粬鏈嶅嫏鐠板璁婃暩銆?
- 涓嶅彲浠绘剰閲嶅暉銆佸埅闄ゃ€佹敼瀵叾浠栨湇鍕欍€?

## 4. Project Registry

寤虹珛涓嶅惈 secrets 鐨?canonical project registry銆傝嚦灏戝寘鍚細

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

瀹樻柟灏堟娓呭柈锛?

| Repository | 寤鸿瀹氫綅 | 鍒嗛 | Live 鐙€鎱?|
|---|---|---|---|
| forge-bloom-quiet-falcon | 娣℃睙涓栫晫銆?D 鏍″湌宸＄Ξ | Spatial | 鍏堥璀?forge-bloom-k7xq |
| lunar-crystal-falcon-granite | 寰呴璀夌殑鏂颁綔鍝?| 寰呭垎椤?| 鑸?lunar-falcon-8p2r 鏈?URL 琛濈獊 |
| tku-tamsui-drama-world | 娣℃睙鏂扮敓灏庤銆佹牎鍦掗棖闂溿€佸妵鏈笘鐣?| Narrative / Spatial | 鍊欓伕 tku-tamsui-drama-world-k4x9 |
| dd | SkateHub銆佽鍌欒垏閲岀▼ | Real-world Tool | dd-k3f9 |
| canva2 | Folio 瑷▓绶ㄨ集鍣?| Creative Tool | 鍊欓伕 canva2-k7qm |
| delta-horizon-cliff-fern | 绂绀?Studio銆佹枃瀹ｈ垏鎺掔▼ | Creative Tool | delta-horizon-k7f2 |
| ty | 灏堟敞鍔涙寫鎴拌辰銆佹椿鍕曡硣鏂欏悓姝?| Real-world Experience | leader-dna-mcp-a7k2 |
| cabin-shale-raven-swift | 寰呰畝鍙?README 鑸囬儴缃查爜闈?| 寰呭垎椤?| cabin-shale-k7q2 |
| hermes-agent | Agent Runtime銆丼essions銆乀ools銆丄PI | Agent Runtime | hermes-agent-k7q2.zeabur.app/sessions锛岄渶鐧诲叆锛泂ervice 6aad03324850645efd210d94 |
| hermes-console | Agent Control Plane銆丮emory銆丮CP銆丳rojects | AI Product | 344.zeabur.app |
| wood-ivory-blaze-maple | Lumen銆佸妯℃厠瑾為煶鍓典綔 | Multimodal | ai-chat-8rq3 |
| -1 | 灏忚病瑷樺赋 | Real-world Tool | untitled-5 |
| tku-zen-agent | 绂绀惧伐浣滃彴銆丄sk 妯″紡 | AI Agent | tku-zen-agent-k7f2 |
| duigao | 鍦栫墖鑸囧奖鐗囧崝浣溿€佸皪绋胯垏鐗堟湰 | Collaboration | duigao-k7q2 |
| planform-iso | 3D 娲诲嫊绌洪枔褰╂帓鑸囧牬浣?| Spatial Design | planform-iso-k7d2 |
| ai_os | AI Director OS銆佸妯℃厠鍓典綔娴佺▼ | AI Product | vexlark.co锛廰i-os-app |
| CUTOS | Conversational Video Editor | Multimodal | cutos.zeabur.app |

bruce23 鑷韩涓嶅垪鍏ヤ笂杩?17 鍊嬪閮ㄤ綔鍝侊紱瀹冩槸浣滃搧闆嗕富楂斻€?

## 5. 宸茬煡璩囨枡琛濈獊

### tku-tamsui-drama-world

浣跨敤鑰呮彁渚涚殑缍插潃鑸?lunar-falcon-8p2r 閲嶈銆?

鐩墠鍊欓伕锛?

https://tku-tamsui-drama-world-k4x9.zeabur.app/

蹇呴爤鐢变互涓嬭瓑鎿氬叡鍚岀⒑瑾嶏細

- Zeabur service ID銆?
- 閮ㄧ讲 domain銆?
- 鍏枊闋侀潰 title銆?
- GitHub README銆?
- 闋侀潰瀵﹂殯鍔熻兘銆?

鏈璀夊墠浣跨敤 needs_verification銆?

### canva2

浣跨敤鑰呮彁渚涚殑缍插潃鑸?dd-k3f9 閲嶈銆?

鐩墠鍊欓伕锛?

https://canva2-k7qm.zeabur.app/

涓嶅緱鎶?SkateHub 鐨?live URL 瀵叆 Folio銆?

### lunar-crystal-falcon-granite

鐩墠 bruce23 鑸婅硣鏂欐浘鎶?lunar-falcon-8p2r 鐢ㄦ柤 FrameLab銆備笉鍙洿鎺ユ部鐢ㄨ垔浣滃搧鏁樹簨銆?

蹇呴爤鍏堝缓绔嬶細

- repo identity
- service identity
- canonical domain
- expected title
- actual feature summary

### cabin-shale-raven-swift

鍦?GitHub README銆佸叕闁嬮爜闈㈣垏 Zeabur metadata 椹楄瓑瀹屾垚鍓嶏紝涓嶅緱鑷鍛藉悕鎴栬櫅妲嬪姛鑳姐€?

## 6. 鐝炬湁绋嬪紡鏋舵蹇呴爤淇濈暀

鍏堣畝鍙栦甫鐞嗚В锛?

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

鐩墠璩囨枡鍚屾檪瀛樺湪闈滄厠鍏у銆丆MS seed 鑸囪硣鏂欏韩銆備换浣曚綔鍝佹洿鏂伴兘瑕佺⒑瑾嶏細

1. 闈滄厠 fallback銆?
2. CMS seed銆?
3. database schema銆?
4. public serializer銆?
5. admin editor銆?
6. public page銆?
7. tests銆?

涓嶈兘鍙慨鏀逛竴铏曘€?

## 7. 瀵﹂殯鎿嶄綔鑸囨渚嬮爜

姣忓€嬩綔鍝佸繀闋堟彁渚涳細

- 浣滃搧鐢ㄩ€斻€?
- 瑙ｆ焙鐨勫晱椤屻€?
- 瑙€鐪嬭€呭彲浠ュ闅涘仛浠€楹笺€?
- 涓夎嚦浜斿€嬫搷浣滄椹熴€?
- GitHub 渚嗘簮銆?
- Zeabur 鐙€鎱嬨€?
- 鎶€琛撳爢鐤娿€?
- 闄愬埗銆?
- 鐩墠瀹屾垚搴︺€?

鎿嶄綔绛栫暐锛?

- 宸查璀夈€佸厑瑷卞祵鍏ワ細浣跨敤 Live Demo iframe銆?
- 涓嶅厑瑷卞祵鍏ワ細鎻愪緵銆岄枊鏂板垎闋併€嶃€?
- 闇€瑕佺櫥鍏ワ細椤ず鐧诲叆閭婄晫锛屼笉鍋囪宸茬櫥鍏ャ€?
- 鏈冨鍏ヨ硣鏂欑殑浣滃搧锛氫娇鐢ㄩ殧闆?demo session 鎴栧敮璁€妯″紡銆?
- 鍚€嬭硣鐨勪綔鍝侊細鍙睍绀哄叕闁嬫搷浣滐紝涓嶅睍绀哄悕鍠€侀浕瑭便€佽〃鍠収瀹规垨璩囨枡搴硣鏂欍€?
- 閬犵鏈嶅嫏澶辨晽锛氶’绀?stale銆乷ffline銆乤uth-required 鎴?unknown锛屼笉椤ず completed銆?

## 8. 绺湒瑕忕瘎

绺湒鍎厛闋嗗簭锛?

1. 鍏枊缍茬珯瀵﹂殯鎴湒銆?
2. GitHub 鍏枊鍦栫墖銆?
3. 鎵嬫鑸囨闈?Playwright 鎴湒銆?
4. 妯欑ず鐐?studio-translation 鐨勮瑕哄皝闈€?

姣忓嫉绺湒闇€瑕侊細

- alt銆?
- provenance銆?
- source URL銆?
- capturedAt銆?
- 瀵﹂殯鐙€鎱嬨€?
- 鏄惁鐐虹敘鍝佹埅鍦栥€?

鐙€鎱嬫绫わ細

- 瀵﹂殯缍茬珯鐣潰銆?
- GitHub 鍏枊绱犳潗銆?
- 宸ヤ綔瀹よ瑕鸿綁璀€?
- 闇€瑕佺櫥鍏ャ€?
- 閮ㄧ讲寰呴璀夈€?
- 鐩墠闆㈢窔銆?

涓嶅緱鎶婅瑕鸿綁璀妯欐垚瀵﹂殯鐢㈠搧鐣潰銆?

## 9. UI/UX 瑷▓

缍寔 Luminous Studio锛?

- #F7FBFF 鏄庝寒鑳屾櫙銆?
- 钖勮嵎缍犮€佸ぉ绌鸿棈銆佹櫒鍏夐粌銆?
- 娣辫棈鏂囧瓧銆?
- 鐜荤拑鎰熴€?
- 娴嫊 3D 鍗＄墖銆?
- 鍏夌悆銆佽粚閬撱€佹煍鍜岀矑瀛愩€?
- 80% 娓呮 2D 鎿嶄綔銆?
- 20% 鏈夋剰缇╃殑 3D 绌洪枔銆?

蹇呴爤锛?

- Mobile-first銆?
- 鎵€鏈変富瑕佽Ц鎺х洰妯欒嚦灏?44px銆?
- 鏀彺閸电洡銆?
- 鏀彺 prefers-reduced-motion銆?
- 鎵嬫浣跨敤鍗＄墖鑸?bottom sheet銆?
- 妗岄潰鍙互浣跨敤鏄熷湒鑸囬棞淇傜瘈榛炪€?
- 3D 鐢ㄦ柤琛ㄩ仈浣滃搧闂滀總銆佺┖闁撴垨宸ヤ綔娴併€?

閬垮厤锛?

- 娣辫壊 Cyberpunk銆?
- HUD銆?
- 绱壊 SaaS銆?
- 瀵嗛泦琛ㄦ牸銆?
- 瑜囬洔鍋存瑒銆?
- 姣忓€嬩綔鍝侀兘杓夊叆閲嶅瀷 WebGL銆?

## 10. 鍒嗛殠娈典换鍕欎絿鍒?

### Phase 0锛氬畨鍏ㄨ垏鍩烘簴

- [x] 寤虹珛 docs/portfolio-agent/state.json銆?- [x] 寤虹珛鏈 lock 鑸囧柈涓€瀵叆绶氳鍓囷紙瑕嬬 25 绡€锛涜法涓绘浠嶉爤鍗旇锛夈€?- [ ] 鎺冩弿 secrets 鏄惁閫插叆 Git銆乸ublic銆乧lient bundle銆?
- [ ] 妾㈡煡鏈彁浜や慨鏀广€?
- [ ] 瑷橀寗鐩墠 HEAD銆侀儴缃茬媭鎱嬭垏 build baseline銆?

### Phase 1锛氫綔鍝佹竻鍠垏渚嗘簮

- [ ] 寤虹珛 canonical Project Registry銆?
- [ ] 灏嶉綂 17 鍊嬪畼鏂瑰皥妗堛€?
- [ ] 淇 tku-tamsui-drama-world URL 琛濈獊銆?
- [ ] 淇 canva2 URL 琛濈獊銆?
- [ ] 椹楄瓑 lunar 鑸?cabin銆?
- [ ] 灏囪垔浣滃搧妯欒 official銆乴egacy 鎴?archived锛屼笉鐩存帴鍒櫎銆?

### Phase 2锛欸itHub 鏁村悎

- [ ] 浣跨敤 server-side GitHub API 鍚屾鍏枊 metadata銆?
- [ ] 浣跨敤 rotated token 椹楄瓑 private repository visibility銆?
- [ ] 鍚屾 README 鎽樿銆乴anguages銆乼opics銆乴atest commit銆?
- [ ] 淇濈暀涓枃浜哄伐鏁樹簨锛屼笉璁?README 鑷嫊瑕嗚搵銆?
- [ ] 椤ず GitHub 鏈€寰屽悓姝ユ檪闁撹垏澶辨晽鍘熷洜銆?

### Phase 3锛歓eabur 鏁村悎

- [ ] 寤虹珛 server-only Zeabur client銆?
- [ ] 浠?service ID 鍙栧緱瀵﹂殯 domain銆?
- [ ] 鍙栧緱 deployment status銆?
- [ ] 鍙栧緱 runtime status銆?
- [ ] 鍙栧緱鏈€寰岄儴缃叉檪闁撹垏 commit銆?
- [ ] 鍏朵粬鏈嶅嫏鍙畝鍙栥€?
- [ ] 鍍?bruce23 鍙閮ㄧ讲銆?
- [ ] 浠讳綍 API 閷閮借钀藉叆 stale 鎴?unknown銆?

### Phase 4锛氱府鍦栬垏濯掗珨渚嗘簮

- [ ] 寤虹珛 live screenshot pipeline銆?
- [ ] 鎿峰彇 390x844銆?
- [ ] 鎿峰彇 1440x900銆?
- [ ] 鐢㈢敓 WebP 鎴?AVIF銆?
- [ ] 寤虹珛绺湒 cache銆?
- [ ] 鐐烘墍鏈夊湒鐗囧姞鍏?provenance銆?
- [ ] 閬斀鍊嬭硣銆佺鐞嗗摗闋侀潰鑸囩瀵嗗収瀹广€?

### Phase 5锛氫綔鍝侀泦 UI

- [ ] 鍗囩礆 Project Card銆?
- [ ] 鍔犲叆鍒嗛鑸?capability chips銆?
- [ ] 鍔犲叆 runtime status badge銆?
- [ ] 鍔犲叆瀵﹂殯鎿嶄綔鍏ュ彛銆?
- [ ] 鍔犲叆渚嗘簮璀夋摎銆?
- [ ] 鍗囩礆妗堜緥闋併€?
- [ ] 鍔犲叆 mobile bottom sheet銆?
- [ ] 淇濈暀鐝炬湁 3D 鏄熷湒銆?

### Phase 6锛氫簰鍕曟渚?

- [ ] AI Agent锛廋onsole 椤ず鐪熷鐧诲叆閭婄晫銆?
- [ ] Planform 椤ず 3D 鍫翠綀浜掑嫊銆?
- [ ] Duigao 椤ず瑕栬灏嶇浜掑嫊銆?
- [ ] Folio 椤ず绶ㄨ集鍣?walkthrough銆?
- [ ] CUTOS 椤ず鏅傞枔杌镐簰鍕曘€?
- [ ] tku drama 椤ず鏍″湌闂栭棞銆?
- [ ] ty 椤ず瀹夊叏鐨勫叕闁嬫寫鎴版祦绋嬨€?
- [ ] 璨″嫏鑸囨嫑鐢熶綔鍝佷笉鍙睍绀虹湡瀵﹀€嬭硣銆?

### Phase 7锛氬搧璩垏閮ㄧ讲

- [ ] npm run typecheck銆?
- [ ] npm run lint銆?
- [ ] npm run build銆?
- [ ] 鐩搁棞 unit tests銆?
- [ ] Playwright mobile smoke test銆?
- [ ] Playwright desktop smoke test銆?
- [ ] broken link 妾㈡煡銆?
- [ ] broken image 妾㈡煡銆?
- [ ] console error 妾㈡煡銆?
- [ ] secret scan銆?
- [ ] 椹楄瓑 Zeabur production deployment銆?
- [ ] 鏇存柊 runtime report銆?

## 11. 棰ㄩ毆鍒嗙礆

鍙嚜鍕曞煼琛岋細

- 鏂囨銆?
- 鍒嗛銆?
- 绺湒銆?
- 渚嗘簮妯欑堡銆?
- CSS銆?
- 鐒＄牬澹炴€?schema 娆勪綅銆?
- 娓│銆?
- README 鑸囪▓鐣枃浠躲€?

闇€瑕佸厛寤虹珛 branch 涓﹂璀夛細

- CMS migration銆?
- GitHub API銆?
- Zeabur API銆?
- public serializer銆?
- authentication boundary銆?
- deployment command銆?

蹇呴爤鍋滀笅涓﹀洖鍫憋細

- 鍒櫎璩囨枡銆?
- destructive migration銆?
- 鏀硅畩鏃㈡湁鐧诲叆瀹夊叏銆?
- 鏆撮湶 secrets銆?
- 瀵叆鍏朵粬 repository銆?
- 淇敼鍏朵粬 Zeabur service銆?
- 灏嶅鐧煎竷鍊嬭硣銆?
- 娌掓湁璀夋摎鍗昏灏囦綔鍝佹瑷樼偤 verified銆?

## 12. Definition of Done

鏈▓鐣畬鎴愭檪锛?

- 17 鍊嬪畼鏂逛綔鍝侀兘鏈?registry entry銆?
- 姣忓€嬩綔鍝侀兘鏈夋槑纰哄垎椤炪€?
- 姣忓€嬩綔鍝侀兘鏈夌府鍦栨垨鏄庣⒑鐨勫緟椹楄瓑鐙€鎱嬨€?
- GitHub銆乑eabur銆丩ive Demo 鐙€鎱嬩笉浜掔浉鐭涚浘銆?
- tku drama 鑸?canva2 涓嶅啀浣跨敤閷閲嶈缍插潃銆?
- private repository 涓嶆渻娲╂紡鍏у銆?
- 闇€瑕佺櫥鍏ョ殑浣滃搧鏄庣⒑妯欑ず銆?
- 姣忓€嬩綔鍝侀兘鏈夊闅涙搷浣滄垨瑾犲鐨勬浛浠ｅ叆鍙ｃ€?
- 鎵嬫鑸囨闈㈤兘鑳戒娇鐢ㄣ€?
- 娌掓湁 secrets 閫插叆 Git 鎴?client bundle銆?
- build銆乴int銆乼ypecheck 鑸囧繀瑕佹脯瑭﹂€氶亷銆?
- bruce23 鎴愬姛閮ㄧ讲銆?
- state銆乺untime report 鑸?changelog 鎸佺簩鏇存柊銆?

## 13. 姣忚吉鍥炲牨鏍煎紡

RUN_ID锛?
鏅傞枔锛?

鏈吉鍞竴浠诲嫏锛?

瀹屾垚鍏у锛?

淇敼妾旀锛?

GitHub 椹楄瓑锛?

Zeabur 椹楄瓑锛?

Build锛廡est 绲愭灉锛?

Mobile锛廌esktop 绲愭灉锛?

鐩墠闃诲锛?

棰ㄩ毆锛?

涓嬩竴杓敮涓€浠诲嫏锛?



## 14. 浣滃搧鐪熸鍙敤鐨?70 鍒嗛杸妾?

浣滃搧闆嗘敹閷勪笉绛夋柤浣滃搧宸插畬鎴愩€?

姣忓€嬫斁鍏ヤ綔鍝侀泦鐨勫皥妗堬紝閮藉繀闋堝缓绔?readiness score锛屾豢鍒?100 鍒嗭紱鑷冲皯 70 鍒嗘墠鍙互妯欒鐐恒€屽彲鎿嶄綔浣滃搧銆嶆垨鍒楀叆 Featured銆?

瑭曞垎锛?

| 闋呯洰 | 鍒嗘暩 | 鏈€浣庤姹?|
|---|---:|---|
| 鍙缓缃垏鍙儴缃?| 15 | build 鎴愬姛銆佹湇鍕欏彲鍟熷嫊銆乸roduction 涓嶆寔绾?5xx |
| 鏍稿績娴佺▼鍙娇鐢?| 25 | 浣跨敤鑰呰兘瀹屾垚瑭蹭綔鍝佹渶閲嶈鐨勪富瑕佷换鍕?|
| 璩囨枡鑸囩媭鎱?| 15 | 璩囨枡鍙纰轰繚瀛樸€佽畝鍙栥€佹仮寰╋紝鎴栨槑纰虹偤鍞畝鐢㈠搧 |
| 閷鑸囩櫥鍏ラ倞鐣?| 10 | 娆婇檺涓嶈冻銆侀洟绶氥€侀尟瑾よ几鍏ヨ垏鏈嶅嫏澶辨晽閮芥湁娓呮铏曠悊 |
| 鎵嬫鑸囨闈?UX | 10 | 390x844 鑸?1440x900 閮借兘瀹屾垚鏍稿績鎿嶄綔 |
| 娓│鑸囧彲瑙€娓€?| 10 | 鑷冲皯鏈?smoke test銆佸仴搴锋鏌ユ垨鍙噸鐝鹃璀?|
| 浣滃搧瑾槑鑸?Demo | 10 | README銆佹搷浣滄椹熴€侀檺鍒惰垏鍏枊鍏ュ彛涓€鑷?|
| 璩囧畨鑸囪硣鏂欎繚璀?| 5 | 娌掓湁 secrets銆佸€嬭硣澶栨穿鎴栦笉鍙楁帶鐨勭鐞嗗姛鑳?|

### 涓嶅彲濡ュ崝鐨勬渶浣庢浠?

鍗充娇绺藉垎閬斿埌 70锛屼互涓嬩换涓€闋呬笉绗﹀悎锛屼粛涓嶅緱妯欒鐐?ready锛?

- 棣栭爜鎴栦富瑕佽矾鐢辩劇娉曢枊鍟熴€?
- 鏍稿績鎸夐垥鐒℃硶瀹屾垚涓昏浠诲嫏銆?
- 璩囨枡瀵叆寰屾秷澶憋紝涓旂敘鍝佸绋辨敮鎻翠繚瀛樸€?
- 鏈櫥鍏ュ彲浠ラ€插叆涓嶆噳鍏枊鐨勭鐞嗗姛鑳姐€?
- 鐧肩敓閷鏅傜暙闈㈠崱姝绘垨鐒￠檺 loading銆?
- 鎵嬫鐗堢劇娉曟痪鍕曘€佽几鍏ユ垨鎻愪氦銆?
- 灏嶅娲╂紡 API key銆佸瘑纰笺€佸€嬭硣鎴?service role銆?
- 浣滃搧闆嗘弿杩拌垏瀵﹂殯鍔熻兘瀹屽叏涓嶄竴鑷淬€?

### 鍒嗘暩涓婇檺

- build 澶辨晽锛氭渶楂?39 鍒嗐€?
- 鏍稿績娴佺▼鐒℃硶瀹屾垚锛氭渶楂?59 鍒嗐€?
- 璩囨枡鎴栨瑠闄愭湁閲嶅ぇ瀹夊叏鍟忛锛欱locked锛屼笉閫插叆鍏枊浣滃搧闆嗐€?
- 鍙湁 landing page銆佹矑鏈夊彲浣跨敤鏍稿績鍔熻兘锛氭渶楂?49 鍒嗐€?
- 鍙湁瑕栬 mockup銆佹矑鏈夌湡瀵︽搷浣滐細鏈€楂?49 鍒嗐€?

姣忓€嬪皥妗堝繀闋堝湪 registry 淇濆瓨锛?

- readinessScore
- readinessStatus
- scoredAt
- scoreEvidence
- failedCriteria
- nextRepairTask

鐙€鎱嬶細

- ready锛?0 鍒嗕互涓婁笖閫氶亷鏈€浣庢浠躲€?
- repair-needed锛? 鑷?69 鍒嗐€?
- blocked锛氭湁瀹夊叏銆佹瑠闄愭垨璩囨枡閲嶅ぇ鍟忛銆?
- unknown锛氬皻鏈畬鎴愬娓€?

## 15. 浠ｇ悊淇京澶栭儴灏堟鐨勬瑠闄愯鍓?

鐐轰簡璁撲綔鍝佺湡姝ｅ彲鐢紝鏈▓鐣厑瑷变唬鐞嗕慨寰╁畼鏂规竻鍠収鐨勫閮?repository锛屼絾蹇呴爤閬靛畧锛?

1. 姣忓€嬪閮?repository 浣跨敤鐛ㄧ珛 branch銆?
2. 姣忓€?repository 寤虹珛鐛ㄧ珛淇京 PR銆?
3. 涓嶇洿鎺ヨ钃嬪閮?repository 鐨?main/master銆?
4. 涓嶄慨鏀瑰閮ㄦ湇鍕欑殑鐠板璁婃暩锛岄櫎闈炰娇鐢ㄨ€呭彟琛屾巿娆娿€?
5. 涓嶆妸 bruce23 鐨勫睍绀洪渶姹傜‖濉為€插閮ㄧ敘鍝併€?
6. 鍏堜慨寰╂渻闃绘鏍稿績娴佺▼浣跨敤鐨勯尟瑾わ紝鍐嶅仛瑕栬缇庡寲銆?
7. 姣忔鍙慨涓€鍊?repository 鐨勪竴鍊嬫牳蹇冩祦绋嬨€?
8. 淇京寰屽繀闋堝湪瑭?repository 鍩疯 build銆乻moke test 鑸囧叕闁嬬恫鍧€椹楄瓑銆?
9. bruce23 鍙湁鍦?readinessScore 閬斿埌 70 浠ヤ笂寰岋紝鎵嶆妸浣滃搧妯欑ず鐐哄彲鎿嶄綔鎴?Featured銆?
10. 濡傛灉澶栭儴 repository 娌掓湁鍙敤瀵叆娆婇檺锛屽缓绔?repair specification 鑸?issue锛屼笉鑳藉亣瑁濆凡淇京銆?

淇京 PR 鍛藉悕锛?

[Repair] Make <project> core workflow usable

淇京 PR 蹇呴爤鍖呭惈锛?

- 閲嶇従姝ラ銆?
- 鏍规湰鍘熷洜銆?
- 淇敼鍏у銆?
- 鏍稿績娴佺▼椹楄瓑銆?
- 鎵嬫椹楄瓑銆?
- 閮ㄧ讲绲愭灉銆?
- readiness score銆?
- 灏氭湭瑙ｆ焙鐨勯檺鍒躲€?

## 16. 姣忓€嬪皥妗堢殑淇京寰挵

浠ｇ悊璁€鍙栦竴鍊嬩綔鍝佸緦锛屼緷搴忓煼琛岋細

### A. 寤虹珛浣跨敤鑰呮牳蹇冩梾绋?

鐢ㄤ竴鍙ヨ┍瀹氱京锛?

銆屼竴浣嶇涓€娆′娇鐢ㄧ殑瑷锛屾噳瑭茶兘鍦ㄥ咕鍒嗛悩鍏у畬鎴愪粈楹硷紵銆?

渚嬪锛?

- PLANFORM锛氬缓绔嬩竴鍊嬬┖闁擄紝鏀剧疆妗屾鑸囪蛋閬擄紝鐪嬪埌鍙搷浣滅殑鍫翠綀绲愭灉銆?
- Duigao锛氬缓绔嬩竴鍊嬭瑕鸿◣璜栧収瀹癸紝鏌ョ湅绱犳潗锛岀暀涓嬭璜栨垨妯欒銆?
- Folio锛氬缓绔嬫垨闁嬪暉瑷▓锛屼慨鏀瑰熀鏈厓绱狅紝闋愯鎴栧尟鍑恒€?
- ty锛氬畬鎴愬叕闁嬫寫鎴帮紝鐪嬪埌绲愭灉锛屽畨鍏ㄥ湴閫佸嚭璩囨枡銆?
- AI OS锛氬缓绔嬪皥妗堬紝杓稿叆涓婁笅鏂囷紝瀹屾垚涓€鍊嬪妯℃厠宸ヤ綔姝ラ銆?
- Hermes Console锛氭煡鐪?runtime锛屽煼琛屼竴鍊嬪畨鍏ㄧ殑 agent锛弔ool workflow銆?
- CUTOS锛氳几鍏ュ奖鐗囦换鍕欙紝寰楀埌鏅傞枔杌告垨鍓集瑷堢暙銆?

### B. 瀵﹂殯閲嶇従

- 璁€鍙?README銆乸ackage.json銆佺挵澧冮渶姹傝垏閮ㄧ讲瑷畾銆?
- 闁嬪暉 production URL銆?
- 浣跨敤 Playwright 閲嶇従鎵嬫鑸囨闈㈡祦绋嬨€?
- 瑷橀寗绗竴鍊嬮樆濉為粸銆?
- 涓嶅洜鐐洪爜闈㈡紓浜氨鍒ゅ畾鍙敤銆?

### C. 鍎厛淇京 Blocker

淇京闋嗗簭锛?

1. build锛忓暉鍕曞け鏁椼€?
2. production 5xx銆?
3. 鏍稿績璺敱涓嶅瓨鍦ㄣ€?
4. 鏍稿績鎸夐垥鐒′綔鐢ㄣ€?
5. API 鍛煎彨澶辨晽寰岀暙闈㈠崱姝汇€?
6. 璩囨枡淇濆瓨鎴栬畝鍙栭尟瑾ゃ€?
7. 鐧诲叆鑸囨瑠闄愰尟瑾ゃ€?
8. 鎵嬫涓嶈兘鎿嶄綔銆?
9. 绌虹媭鎱嬭垏閷鐙€鎱嬨€?
10. 鏈€寰屾墠鏄瑕虹窗绡€銆?

### D. 椹楄瓑鏍稿績娴佺▼

姣忓€嬩綔鍝佽嚦灏戣鏈夛細

- 棣栨閫插叆銆?
- 涓€娆℃牳蹇冭几鍏ャ€?
- 涓€娆′富瑕佹搷浣溿€?
- 涓€娆＄祼鏋滃憟鐝俱€?
- 涓€娆￠噸鏂版暣鐞嗘垨杩斿洖寰岀殑鐙€鎱嬮璀夈€?
- 涓€娆￠尟瑾ゆ儏澧冮璀夈€?

### E. 瑷堝垎鑸囧洖瀵?

淇京瀹屾垚寰岋細

1. 閲嶆柊鍩疯 build銆?
2. 鍩疯娓│銆?
3. 鍩疯 production smoke test銆?
4. 鏇存柊 readinessScore銆?
5. 灏囪瓑鎿氬鍏?registry銆?
6. 鏇存柊浣滃搧闆嗙殑鐙€鎱嬨€?
7. 鍙湁閬旀鎵嶉枊鏀?Featured 鎴栥€岀珛鍗虫搷浣溿€嶄富鎸夐垥銆?

## 17. 姣忓皬鏅傜殑淇京浠诲嫏閬告搰闋嗗簭

浠ｇ悊涓嶅彲姣忚吉闅ㄦ鏀?UI锛屾噳渚濈収浠ヤ笅鍎厛闋嗗簭锛?

1. 鏈?production 5xx 鐨勫皥妗堛€?
2. 鏈?build failure 鐨勫皥妗堛€?
3. 鏍稿績娴佺▼鐒℃硶瀹屾垚涓斿凡鏈夋槑纰洪噸鐝炬椹熺殑灏堟銆?
4. 宸叉湁 PR 浣?CI 澶辨晽鐨勫皥妗堛€?
5. readinessScore 鏈€浣庝笖璺濋洟 70 鍒嗘渶杩戠殑灏堟銆?
6. 鎵嬫鐗堟牳蹇冩祦绋嬮樆濉炵殑灏堟銆?
7. 鍙湁璩囨枡鍚屾鎴栦締婧愮媭鎱嬫湭瀹屾垚鐨勫皥妗堛€?
8. 鏈€寰屾墠铏曠悊绺湒銆佸嫊鐣垏绱伴儴瑕栬銆?

姣忚吉鏈€澶氾細

- 淇京涓€鍊嬫牳蹇?blocker锛涙垨
- 瀹屾垚涓€鍊嬪皬鍨嬪彲椹楄瓑鏀瑰杽锛涙垨
- 瀹屾垚涓€鍊嬪皥妗堢殑 readiness scoring銆?

涓嶅緱鍦ㄥ悓涓€杓悓鏅備慨鏀瑰鍊嬪閮?repository銆?

## 18. 鏂板 Definition of Done

鏁撮珨瑷堢暙瀹屾垚涓嶅彧浠ｈ〃浣滃搧闆嗛爜闈㈠畬鎴愶紝閭勫繀闋堢鍚堬細

- 瀹樻柟娓呭柈鍏ф瘡鍊嬪彲鍏枊灞曠ず浣滃搧閮芥湁 readiness score銆?
- 鑷冲皯 70 鍒嗙殑浣滃搧鎵嶅垪鐐哄彲鎿嶄綔浣滃搧銆?
- 浣庢柤 70 鍒嗙殑浣滃搧椤ず repair-needed锛屼笉寰楀亣瑁濆畬鎴愩€?
- blocked 浣滃搧涓嶆彁渚涜灏庢€х殑绔嬪嵆鎿嶄綔鍏ュ彛銆?
- 姣忓€嬩綔鍝佽嚦灏戣兘瀹屾垚涓€姊濇牳蹇冧娇鐢ㄦ梾绋嬶紝鎴栨竻妤氭绀虹洰鍓嶄笉鍙敤銆?
- 姣忓€嬪閮ㄤ慨寰╅兘鏈夌崹绔?PR銆佹脯瑭﹁瓑鎿氳垏閮ㄧ讲椹楄瓑銆?
- bruce23 鐨勬渚嬫晿浜嬨€丟itHub銆乑eabur銆丩ive Demo 鑸?readiness score 涓€鑷淬€?
- 浠ｇ悊姣忓皬鏅傝兘寰炴湰鏂囦欢鑸?state 绻肩簩锛屼笉闇€瑕侀噸鏂扮寽娓€插害銆?



## 19. 鍏ㄤ綔鍝佺窔涓婂彲鎿嶄綔鑸囪硣瑷婂畬鏁寸‖鎬?Gate

鏈綔鍝侀泦鐨勫畬鎴愭浠朵笉鏄€屽ぇ閮ㄥ垎浣滃搧鍙互灞曠ず銆嶃€?

瀹樻柟娓呭柈鍏х殑 17 鍊嬪皥妗堝繀闋堝叏閮ㄥ畬鎴愶細

- 17/17 鏈夊彲闁嬪暉鐨勬寮忕窔涓婄恫鍧€銆?
- 17/17 姝ｅ紡缍插潃鍙湪鍏枊缍茶矾姝ｅ父杓夊叆銆?
- 17/17 鍙互瀹屾垚鍚勮嚜瀹氱京鐨勬牳蹇冧娇鐢ㄦ梾绋嬨€?
- 17/17 鑷冲皯閬斿埌 readiness score 70 鍒嗐€?
- 17/17 鏈夊畬鏁寸殑 GitHub锛忎締婧愮媭鎱嬨€?
- 17/17 鏈夊畬鏁寸殑 Zeabur锛忛儴缃茬媭鎱嬨€?
- 17/17 鏈夌湡瀵︾府鍦栨垨缍撻亷妯欒鐨勫闅涚暙闈€?
- 17/17 鏈夊畬鏁寸殑涓枃浣滃搧瑾槑銆?
- 17/17 鏈夎嫳鏂囧熀鏈鏄庢垨鑻辨枃瑁滃姪璩囪▕銆?
- 17/17 鏈夋槑纰虹殑鎿嶄綔姝ラ銆?
- 17/17 鏈夋妧琛撳爢鐤婅垏鍔熻兘绡勫湇銆?
- 17/17 鏈夐檺鍒躲€佺櫥鍏ラ渶姹傝垏璩囨枡瀹夊叏瑾槑銆?
- 17/17 閫氶亷鎵嬫鑸囨闈?smoke test銆?
- 17/17 涓嶅緱瀛樺湪鏈檿鐞嗙殑 broken link銆乥roken image銆佷富瑕佽矾鐢?404 鎴栨寔绾?5xx銆?

### 鏁撮珨瀹屾垚鍒ゅ畾

鍙湁浠ヤ笅姊濅欢鍏ㄩ儴鎴愮珛锛屾墠鍙互鎶?Portfolio Agent Plan 妯欒鐐哄畬鎴愶細

ONLINE_READY_COUNT = 17
CORE_FLOW_PASS_COUNT = 17
READINESS_SCORE_GE_70_COUNT = 17
COMPLETE_INFO_COUNT = 17
THUMBNAIL_VERIFIED_COUNT = 17
MOBILE_SMOKE_PASS_COUNT = 17
DESKTOP_SMOKE_PASS_COUNT = 17
SECURITY_BLOCKER_COUNT = 0

浠讳綍涓€闋呬笉鏄?17锛屾暣楂旂媭鎱嬪繀闋堜繚鎸侊細

PORTFOLIO_STATUS = IN_PROGRESS

涓嶅緱浣跨敤銆屽咕涔庡畬鎴愩€嶃€併€屽ぇ鑷村彲鐢ㄣ€嶃€併€岄儴鍒嗗畬鎴愩€嶅彇浠ｆ暩瀛楄瓑鎿氥€?

## 20. 姣忓€嬩綔鍝佺殑瀹屾暣璩囨枡濂戠磩

姣忓€嬪皥妗堝湪 registry 鑸?CMS 閮戒笉寰楃己灏戜互涓嬫瑒浣嶏細

### 韬垎

- slug
- title
- titleEn
- repository URL
- repository visibility
- canonical live URL
- Zeabur service identity
- current deployed commit 鎴?deployment reference

### 浣滃搧瑾槑

- 涓€鍙ヨ┍瀹氫綅
- 瑙ｆ焙鐨勫晱椤?
- 鐩浣跨敤鑰?
- 涓昏鍔熻兘
- 浣跨敤鑰呮牳蹇冩梾绋?
- 浠ｇ悊鎴栦綔鑰呭湪鍏朵腑鍋氫簡浠€楹?
- 鎶€琛撳爢鐤?
- 澶氭ā鎱嬭兘鍔?
- 鐩墠鐙€鎱?
- 鐗堟湰鎴栨渶寰屾洿鏂版檪闁?

### 绶氫笂鎿嶄綔

- 绶氫笂缍插潃
- 鍏枊锛忛渶鐧诲叆锛忓彈闄愮媭鎱?
- 闁嬪暉鏂瑰紡
- 涓夎嚦浜斿€嬫搷浣滄椹?
- 闋愭湡绲愭灉
- 鍙噸鐝炬脯瑭︽椹?
- 鏈€寰岄璀夋檪闁?
- HTTP status
- page title
- mobile smoke status
- desktop smoke status

### 瑕栬绱犳潗

- 涓荤府鍦?
- 鎵嬫鎴湒
- 妗岄潰鎴湒
- alt text
- 鍦栫墖渚嗘簮
- 鍦栫墖 provenance
- 鍦栫墖鐢㈢敓鏅傞枔
- 鏄惁鐐哄闅涚敘鍝佺暙闈?

### 鎶€琛撹瓑鎿?

- GitHub README 鐙€鎱?
- latest commit
- language
- topics
- 閲嶈妾旀璺緫
- Zeabur deployment status
- runtime health
- 渚濊炒鏈嶅嫏
- 鐩墠闄愬埗
- 灏氭湭瀹屾垚闋呯洰

### 璩囧畨鑸囪硣鏂?

- 鏄惁闇€瑕佺櫥鍏?
- 鏄惁浣跨敤鐪熷璩囨枡
- 鏄惁浣跨敤闅旈洟 demo data
- 瑷鑳藉仛浠€楹?
- 瑷涓嶈兘鍋氫粈楹?
- 鏄惁鍚€嬭硣
- 鏄惁鏈夌鐞嗗摗閭婄晫
- 鏄惁鏈?API 鎴?provider 渚濊炒

浠讳綍娆勪綅缂哄皯鏅傦紝瑭蹭綔鍝佺殑 COMPLETE_INFO 鐙€鎱嬪繀闋堟槸 false銆?

## 21. 鍏ㄩ儴灏堟绶氫笂淇京娴佺▼

浠ｇ悊涓嶈兘鍥犵偤鏌愬€嬪皥妗堢従鍦ㄧ劇娉曟搷浣滐紝灏辨妸瀹冨緸浣滃搧闆嗙Щ闄ゆ垨妯欒瀹屾垚銆?

姣忎竴鍊嬬劇娉曠窔涓婃搷浣滅殑灏堟蹇呴爤锛?

1. 鏌ユ槑鏄?GitHub build銆乑eabur deploy銆佺挵澧冭畩鏁搞€佽硣鏂欏韩銆乺untime銆佽矾鐢便€佺櫥鍏ユ垨澶栭儴 provider 鍝竴灞ゅけ鏁椼€?
2. 寤虹珛鍙噸鐝剧殑 failure report銆?
3. 鍦ㄨ┎ repository 寤虹珛鐛ㄧ珛淇京 branch銆?
4. 寤虹珛淇京 PR銆?
5. 淇京鏍稿績鍔熻兘銆?
6. 鍩疯鏈湴 build 鑸囨脯瑭︺€?
7. 閮ㄧ讲鍒版寮忕窔涓婃湇鍕欐垨鍙璀夌殑 preview銆?
8. 鐢ㄦ墜姗熻垏妗岄潰 Playwright 椹楄瓑銆?
9. 鏇存柊 readiness score銆?
10. 鍥炲 bruce23 registry銆?
11. 閲嶆柊椹楄瓑浣滃搧闆嗗叆鍙ｃ€?
12. 鍙湁瀹屾暣閫氶亷寰岋紝鎵嶅彲灏囪┎灏堟妯欒鐐?online-ready銆?

濡傛灉閬囧埌锛?

- 娌掓湁 repository 瀵叆娆婇檺銆?
- 娌掓湁 Zeabur 閮ㄧ讲娆婇檺銆?
- 缂哄皯蹇呰 provider credential銆?
- 绉佹湁璩囨枡涓嶅彲瀹夊叏灞曠ず銆?
- 鍘熷皥妗堝凡鐒℃硶鎭㈠京銆?
- 澶栭儴鏈嶅嫏宸插仠姝笖娌掓湁鏇夸唬鏂规銆?

浠ｇ悊蹇呴爤鍦ㄥ牨鍛婁腑鏄庣⒑妯欒 BLOCKED锛屼甫鎸佺簩鍒楃偤鏈畬鎴愰爡鐩€備笉寰椾娇鐢ㄥ亣缍插潃銆佸亣鐨?demo銆佸亣鐨?API 鍥炴噳鎴栧亣鐨勫畬鎴愮媭鎱嬨€?

## 22. 鍏ㄤ綔鍝侀€ｇ簩椹楄瓑

姣忔 bruce23 閮ㄧ讲鍓嶅緦锛岄兘瑕佸皪 17 鍊嬪皥妗堝煼琛屽畬鏁存鏌ワ細

### 鍏ュ彛妾㈡煡

- canonical URL 鍙互閫ｇ窔銆?
- HTTP status 鐐哄彲鎺ュ彈鐙€鎱嬨€?
- page title 鑸囦綔鍝佽韩浠戒竴鑷淬€?
- 娌掓湁琚皫鍚戦尟瑾ゅ皥妗堛€?
- 娌掓湁浣跨敤閲嶈鎴栭亷鏈熺恫鍧€銆?

### 鎿嶄綔妾㈡煡

- 棣栭爜鍙枊鍟熴€?
- 鏍稿績 CTA 鍙粸鎿娿€?
- 鏍稿績杓稿叆鍙畬鎴愩€?
- 涓昏绲愭灉鍙嚭鐝俱€?
- 閲嶆柊鏁寸悊寰岀媭鎱嬬鍚堢敘鍝佽ō瑷堛€?
- 閷鐙€鎱嬪彲鎭㈠京銆?
- 鐧诲叆閭婄晫姝ｇ⒑銆?
- 涓嶆渻瀵叆涓嶆噳瀵叆鐨勭湡瀵﹁硣鏂欍€?

### 瑕栬妾㈡煡

- 涓荤府鍦栧瓨鍦ㄣ€?
- 鎵嬫鎴湒瀛樺湪銆?
- 妗岄潰鎴湒瀛樺湪銆?
- alt text 瀛樺湪銆?
- 渚嗘簮妯欑堡姝ｇ⒑銆?
- 鍦栫墖涓嶆渻 broken銆?
- 妗堜緥闋佽垏瀵﹂殯缍茬珯涓嶇煕鐩俱€?

### 璩囪▕妾㈡煡

- 涓枃瑾槑瀛樺湪銆?
- 鑻辨枃鍩烘湰璩囪▕瀛樺湪銆?
- 鎿嶄綔姝ラ瀛樺湪銆?
- 鎶€琛撳爢鐤婂瓨鍦ㄣ€?
- 闄愬埗瀛樺湪銆?
- GitHub 鐙€鎱嬪瓨鍦ㄣ€?
- Zeabur 鐙€鎱嬪瓨鍦ㄣ€?
- readiness score 瀛樺湪銆?
- 鏈€寰岄璀夋檪闁撳瓨鍦ㄣ€?

## 23. 鏈€绲傚叕闁嬪憟鐝捐鍓?

鍦ㄦ墍鏈?17 鍊嬪皥妗堥兘閬旀鍓嶏細

- 棣栭爜鍙互椤ず閫插害锛屼絾涓嶅彲瀹ｇū瀹屾垚銆?
- Featured 鍗€鍩熷彧鑳芥斁宸查仈 70 鍒嗕笖 online-ready 鐨勪綔鍝併€?
- 鏈仈妯欎綔鍝佸繀闋堥’绀恒€屼慨寰╀腑銆嶈€屼笉鏄亣瑁濆彲鎿嶄綔銆?
- 浣滃搧闆嗙附瑕藉繀闋堥’绀哄闅涘畬鎴愭暩锛屼緥濡?12/17銆?
- 銆屽叏閮ㄤ綔鍝佸凡瀹屾垚銆嶆寜閳曟垨鏂囨涓嶅緱鍑虹従銆?
- 涓嶅彲浠ョ敤闈滄厠 mockup 鍙栦唬鐪熸鐨勭窔涓婃搷浣溿€?
- 涓嶅彲浠ュ彧鍥犵偤 GitHub 瀛樺湪锛屽氨鎶婁綔鍝佹瑷樼偤 online-ready銆?

鏈€绲傚繀闋堢湅鍒帮細

17/17 ONLINE
17/17 CORE FLOW PASS
17/17 COMPLETE INFO
17/17 READY >= 70



## 24. Grok Bot 鍗斾綔鍏ュ彛

Grok Bot 鐨勫皥鐢ㄤ换鍕欐枃浠讹細

docs/GROK_BOT_PORTFOLIO_TASK.md

Grok Bot 鏄崹绔嬬殑 Portfolio Sentinel锛岃矤璨粦绠卞娓€侀€插害瑜囨牳銆佽硣瑷婂畬鏁存€ф鏌ヨ垏 70 鍒嗛杸妾昏鏍搞€?

涓讳唬鐞嗚垏 Grok Bot 蹇呴爤閬靛畧锛?

- 涓讳唬鐞嗚矤璨富瑕佸浣滆垏淇京銆?
- Grok Bot 璨犺铂鐛ㄧ珛椹楄瓑鑸囨壘鍑洪伜婕忋€?
- 鍚屼竴鏅傞枔涓嶅彲璁撳叐鍊嬩唬鐞嗕慨鏀瑰悓涓€鍊?repository 鐨勭浉鍚屾獢妗堛€?
- Grok Bot 鐧肩従鍟忛鏅傦紝鍎厛瀵?review comment 鎴?failure report銆?
- 娌掓湁涓讳唬鐞嗘鍦ㄨ檿鐞嗘檪锛屾墠鍙缓绔?grok/repair/<project>/<date> 淇京 branch銆?
- Grok Bot 涓嶅緱鐩存帴鎺ㄩ€?main/master銆?
- Grok Bot 蹇呴爤浣跨敤瀵︽脯璀夋摎锛屼笉寰楀彧渚濊炒 README 鎴栧崱鐗囦笂鐨勭媭鎱嬨€?
- Grok Bot 鐨?PORTFOLIO_READY 蹇呴爤鑸囦富浠ｇ悊鐨勫畬鎴愬牨鍛婄浉浜掓牳灏嶃€?
## 25. 棣栬吉鍟熷嫊鑸囨湰姗熷煼琛屽崝瀹氾紙2026-09-19锛?
鏈吉鍞竴浠诲嫏锛歅hase 0 鍩疯鍩烘簴鑸囧柈涓€瀵叆閹栥€傚伐浣滅洰閷勭偤 `D:\bruce23`锛屾部鐢?PR #6 鍒嗘敮銆?
- Codex 姣忓皬鏅傛暣榛炵簩璺戝凡鍟熺敤锛宎utomation ID锛歚bruce23`銆?- Grok Bot 灏氭湭鍟熷嫊锛涙湰娆℃矑鏈夊凡瑷畾鐨?Grok 鍩疯绠￠亾銆?- 鏂板 `scripts/portfolio-agent-lock.mjs`銆備慨鏀瑰墠鍩疯 `node scripts/portfolio-agent-lock.mjs acquire <unique-run-id>`锛涚祼鏉熷緦浠ョ浉鍚?ID 鍩疯 `release`銆俙status` 鍙畝鍙栫洰鍓嶆寔鏈変汉銆?- 閹栦綅鏂?Git common directory锛屼笉閫插叆 Git 鎴?client bundle锛屽悓涓€ clone 鐨?worktree 鍏辩敤銆傚叾浠?clone锛忎富姗熶笉鍏辩敤姝ら帠锛涘暉鍕曞彟涓€瀵叆鑰呭墠蹇呴爤鍙﹁鍗旇銆備笉寰楀儏鍥犻帠閬庢湡渚垮埅闄わ紱涓柗鐣欎笅鐨勯帠闇€鍏堢⒑瑾嶅師鍩疯鑰呭凡鍋滄銆?- 鍏ュ彛瀵︽脯锛氫綔鍝侀泦 HTTP 200锛涘閮ㄤ綔鍝?16/17 HTTP 200锛孒ermes Agent 涓夋 HTTP 502銆侶TTP 200 涓嶄唬琛?online-ready 鎴栨牳蹇冩祦绋嬮€氶亷銆?- lunar 鑸?cabin 閮藉洖鍌?FrameLab title锛屼粛闋堟牳灏?repo 鑸?Zeabur service锛屾湭纰鸿獚 canonical identity銆?- typecheck 閫氶亷锛沴int 0 errors銆? 鍊嬫棦鏈?warnings锛涢帠鐨勭鐖紡鎸佹湁浜烘脯瑭﹂€氶亷銆?- 鍘熸湁 `npm run build` 鍦?Windows 鍥?`spawn vite ENOENT` 澶辨晽銆備娇鐢ㄧ浉鍚岀挵澧?wrapper 鐩存帴鍛煎彨 `node node_modules/vite/bin/vite.js build` 鎴愬姛锛孭GLite 绱犳潗瑜囪＝鎴愬姛锛涙湭瑷畾 DATABASE_URL锛岃硣鏂欏韩 migration 璺抽亷銆?- 鐩墠绋嬪紡鑸囩敓鎴?client assets 鐨勫父瑕?token锛弍rivate-key pattern 鎺冩弿鏈懡涓紱閫欎笉鏄畬鏁磋硣瀹夋垨 Git 姝峰彶绋芥牳銆?- 鏈吉娌掓湁淇敼 UI銆丆MS銆佽硣鏂欏韩銆佸閮ㄤ綔鍝佹垨閮ㄧ讲銆侻obile锛廳esktop 鏍稿績鎿嶄綔鑸?production deployment 浠嶆湭椹楄瓑锛屾墍鏈夊畬鎴?gate 缍寔鏈€氶亷銆?
鍏枊鍏ュ彛璀夋摎锛歚docs/portfolio-agent/endpoint-evidence.json`銆傚畬鏁寸祼鏋滆 `runtime-report.json`銆?
涓嬩竴杓敮涓€浠诲嫏锛氱⒑瑾?Hermes Agent 鐨?repo 鑸?Zeabur service 韬垎锛屽畾浣嶉噸瑜?HTTP 502 鐨勫師鍥狅紝鍐嶄緷澶栭儴淇京娴佺▼铏曠悊銆?
## 26. Hermes Agent 502 瑷烘柗锛?026-09-19 09:03 UTC 杓锛?
- RUN_ID锛歚codex-20260919-0903`銆傚敮涓€浠诲嫏锛氭牳灏嶄締婧愪甫寤虹珛鍙噸鐝剧殑 502 瑷烘柗銆?- 涓荤恫鍩?`/sessions`銆佹牴闋佸強鏃㈡湁 API 缍插煙鍧囧け鏁楋紱鐎忚鍣ㄧ⒑瑾?Zeabur `502: SERVICE_UNAVAILABLE`锛屽皻鏈埌鐧诲叆闋併€?- 宸茶畝鍙栧叕闁嬩笂娓?NousResearch/hermes-agent 鐨?Dockerfile/Compose锛涘闅涢儴缃叉槧鍍?digest銆乻ervice ID 鑸?runtime 鏃ヨ獙浠嶆湭纰鸿獚锛屼笉鎶婁笂娓告渶鏂扮増鏈暥浣滈儴缃茶瓑鎿氥€?- 鐩墠娌掓湁鍙敤 Zeabur connector锛廋LI锛廇PI token锛屼娇鐢ㄤ腑鐨勭€忚鍣ㄦ帶鍒跺彴鏈櫥鍏ワ紱鏁呴殰鏍瑰洜鍒ゅ畾琚儴缃茶娓瑠闄愰樆濉炪€?- 淇京瑕忔牸鑸囪瓑鎿氾細`docs/portfolio-agent/hermes-agent-failure.md`銆乣hermes-agent-evidence.json`锛涜拷韫?[issue #7](https://github.com/aa0968111723-prog/bruce23/issues/7)銆傛湭淇敼澶栭儴 repo 鎴栨湇鍕欍€?- 閲嶆柊鎺㈡脯鍏ㄩ儴瀹樻柟鍏ュ彛锛岀祼鏋滆 endpoint-evidence.json銆侶TTP 鍙仈浠嶄笉绛夋柤瀹屾垚鏍稿績鎿嶄綔銆傜€忚鍣ㄥ昂瀵?override 鏈敓鏁堬紝瀵﹂殯鐐?1280脳721锛屾湭灏囧叾绠椾綔 mobile锛廳esktop pass銆?- 鏈吉鍙洿鏂版枃浠讹紡鐙€鎱嬶紝鍩疯 JSON銆?7 绛嗚硣鏂欎竴鑷存€с€乬ate 鑸?diff 椹楄瓑锛屼笉閲嶈窇鏈敼鍕曠敘鍝佺殑 build銆?- 鏁撮珨缍寔 IN_PROGRESS锛屾墍鏈夐鏀堕€氶亷鏁镐粛鐐?0/17锛岃硣瀹夋湭椹楄瓑銆?- 涓嬩竴杓敮涓€鍙崹绔嬮€茶浠诲嫏锛氫慨寰?bruce23 Windows command launcher锛屽畬鎴愭婧栧缓缃璀夈€傛湁 Zeabur 鍞畝鏈嶅嫏璩囪▕寰屽啀鎭㈠京 Hermes 瑷烘柗锛岄伩鍏嶆瘡杓劇鏁堥噸瑭︺€?
## 27. Zeabur 渚嗘簮纰鸿獚鑸?Hermes 鏆仠鐙€鎱?
浣跨敤鑰呰鍏?service ID 鑸?API 瑾嶈瓑寰岋紝宸插畬鎴愬敮璁€鏍稿皪锛岃瓑鎿氬瓨鏂?`zeabur-service-evidence.json` 鑸?`hermes-zeabur-evidence.json`锛屾矑鏈変繚瀛樻啈璀夈€?
- bruce23 鍙?16 鍊嬪閮ㄦ湇鍕?RUNNING锛汬ermes Agent SUSPENDED銆?- 18 鍊嬫湇鍕欙紙浣滃搧闆嗭紜17 浣滃搧锛夌殑 domain 宸叉牳灏嶏紱17 鍊?Git 閮ㄧ讲绱€閷勭殑 repo锛廲ommit 宸插彇寰楋紝Hermes 浣跨敤 Docker 鏄犲儚涓?deployments 娓呭柈鐐虹┖銆?- tku-tamsui-drama-world 姝ｅ紡 domain 鏄?`tku-tamsui-drama-world-k4x9.zeabur.app`锛宑anva2 鏄?`canva2-k7qm.zeabur.app`锛屼笉娌跨敤浣跨敤鑰呮竻鍠腑鐨勯噸瑜?URL銆?- lunar 鑸?cabin 鐨?repo锛弒ervice 鍒嗗垾纰鸿獚锛涘姛鑳借垏鏁樹簨浠嶉爤鐛ㄧ珛娓│锛屼笉鑳藉洜鍏╄€呭悓鍚嶅氨娣风敤銆?- Hermes 鏄犲儚 tag 鐐?`v2026.7.7.2`锛宒ashboard 9119銆丄PI 5000锛屽叐鍊?domain 宸查厤缃€傜従闅庢涓嶆槸鏈彇寰?API 娆婇檺锛岃€屾槸鏈嶅嫏鏆仠銆?- 宸叉彁鍑烘部鐢ㄦ棦鏈夎ō瀹氭仮寰╂湇鍕欑殑鏄庣⒑鎺堟瑠璜嬫眰锛涘湪鏀跺埌鍚屾剰鍓嶄笉鍩疯 resume锛弐estart 鎴栬畩鏇寸挵澧冭畩鏁搞€?- RUNNING銆乨omain 鑸?repo 鏍稿皪涓嶇瓑鏂兼牳蹇冩祦绋嬪畬鎴愶紱鎵€鏈夊姛鑳?gate 缍寔鏈€氶亷銆?
## 28. 浣跨敤鑰呮洿姝?Hermes 鏈嶅嫏锛堝彇浠ｇ 26銆?7 绡€鐨勭洰鍓嶅皪璞★級

- 姝ｇ⒑ service ID锛歚6aad03324850645efd210d94`锛汚PI 纰鸿獚 RUNNING銆?- 姝ｇ⒑鍏ュ彛锛歚https://hermes-agent-k7q2.zeabur.app/sessions`锛汬TTP 200锛岀€忚鍣ㄥ皫鍚戠櫥鍏ラ爜锛岄’绀?AUTH REQUIRED銆?- 鑸?`6a9a385273ef6eb935f2f8a2`锛?55 缍插煙涓嶆槸鐩墠浣滃搧鐨勬湇鍕欙紝鎾ゅ洖鎭㈠京璜嬫眰涓︿繚鎸佸師鐙€銆傝垔 502 杩借工鐢辨娆¤韩鍒嗘洿姝ｅ彇浠ｃ€?- 鏇存柊 agent registry銆乪ndpoint 鑸?Zeabur 璀夋摎锛涙矑鏈夋敼鐠板璁婃暩銆佹湇鍕欑媭鎱嬫垨鍢楄│鐧诲叆銆?- 鍚堜降鏈€杩戞帰娓瓑鎿氱偤 17/17 HTTP 200锛堝悇绛嗘檪闁撲笉鍚岋級锛屼粛鏄?0/17 鍔熻兘椹楁敹閫氶亷銆?- 涓嬩竴杓細鍚屾鐢㈠搧 fallback銆佽嫳鏂囧収瀹硅垏鏃㈡湁 CMS 鐨勬纰?Hermes 鍏ュ彛锛涗笉寰楀彧鏀?seed 灏卞绋卞凡鏇存柊 production 璩囨枡銆傚叾寰岄璀夐殧闆㈢殑鐧诲叆寰屾祦绋嬨€?

