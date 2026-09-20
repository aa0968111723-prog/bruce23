# Hermes Agent：入口 502 診斷與修復交接

初次 RUN_ID：codex-20260919-0903。後續 RUN_ID：codex-20260919-zeabur。

## 使用者更正後結論：先前調查對象為舊服務

2026-09-19 使用者指出目前 Hermes Agent 是 `6aad03324850645efd210d94`。API 已確認該服務 RUNNING，production environment 為 `6aad03314eff8b1a632f15c2`。正式入口為 `https://hermes-agent-k7q2.zeabur.app/sessions`，HTTP 200，真實瀏覽器轉向 `/login?next=%2Fsessions`，顯示 Sign in 與 AUTH REQUIRED。

先前 `6a9a385273ef6eb935f2f8a2` 與 455/API 網域屬於舊服務，SUSPENDED／502 證據有效但不適用於目前作品。**恢復舊服務的授權請求撤回，不需要重啟。** 沒有對任何服務執行 mutation。

本 issue 的舊服務診斷已被身分更正取代；目前作品的核心旅程尚未驗證，不能因此標記 ready。下一步須同步作品集 fallback／既有 CMS 中的旧網址，再以安全隔離方式驗證登入後流程。API port 5000 存在，但新服務僅有 web domain，不能沿用舊 API 網域。以下內容為歷史紀錄。

## 最新確認：服務已暫停（取代下方歷史存取阻塞）

使用者提供連線資訊後，Zeabur 唯讀 API 已可查詢。服務 `6a9a385273ef6eb935f2f8a2` 在 production 環境 `6a9a380fa34c0097521b74ae` 的狀態為 **SUSPENDED**。這是目前入口不可用的直接阻塞；暫停原因仍未知，不推測為 port 或程式錯誤。

- 映像：`docker.io/nousresearch/hermes-agent`，tag `v2026.7.7.2`，digest 回傳 null。
- 網域 `455.zeabur.app` 已 PROVISIONED，對應 `web:9119`；`hermes-agent-api.zeabur.app` 已 PROVISIONED，對應 `api:5000`。
- deployments 查詢未回傳紀錄。證據：`hermes-zeabur-evidence.json`。
- 擬執行動作：經使用者明確授權後，恢復上述既有服務，保持目前映像、port 與所有環境變數；再驗證兩個入口、登入邊界與隔離的核心流程。
- 計畫第 3 節禁止任意重啟外部服務，因此已提出恢復授權問題，目前 **AWAITING_AUTHORIZATION**。未發出任何服務 mutation。
- 憑證僅用於本次 API 認證，未寫入程式、文件、PR、環境設定或自動化 prompt。

以下為初次無部署存取時的歷史診斷，保留可追溯性。

## 已重現

- `https://455.zeabur.app/sessions`、同網域根頁與 `https://hermes-agent-api.zeabur.app/` 均回傳 HTTP 502。
- 真實瀏覽器 `/sessions` 顯示 `502: SERVICE_UNAVAILABLE`，無登入表單、sessions 或可操作功能。Zeabur 錯誤頁請求 ID：`f012f7c2-d37b-4999-99c5-3d02c35ac51d`。
- HTTP client 收到 `text/plain` 的 `Bad Gateway`；瀏覽器收到 Zeabur 錯誤頁。兩者均未證實 runtime 正常。
- 瀏覽器實際 viewport 為 1280×721。嘗試 390×844 和 1440×900 override 後實際尺寸未改變；不可據此宣稱通過要求的 mobile／desktop smoke。

## 身分證據與限制

- bruce23 `src/content/linked-works.ts` 記載映像為 `docker.io/nousresearch/hermes-agent`，兩個網域屬於同一服務。這是既有內容，尚未以 Zeabur metadata 複核。
- 公開上游為 [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)，本輪讀取 commit `44945d224c2ccd6e0a55f16223c7ab0dd39331bf`。
- 上游 [Dockerfile](https://github.com/NousResearch/hermes-agent/blob/44945d224c2ccd6e0a55f16223c7ab0dd39331bf/Dockerfile) 使用 entrypoint dispatcher；[docker-compose.yml](https://github.com/NousResearch/hermes-agent/blob/44945d224c2ccd6e0a55f16223c7ab0dd39331bf/docker-compose.yml) 將 gateway 與 dashboard 分開，dashboard 範例綁定 127.0.0.1。這些只供診斷參考，**不是已部署版本或根因證據**。
- GitHub 帳戶清單可見公開的 hermes-console 與 hermes-console-b，未找到名為 hermes-agent 的自有 repo。不能因此假定 console repo 就是故障服務原始碼。
- 沒有可呼叫的 Zeabur connector／CLI；本執行環境未設定 ZEABUR_API_TOKEN；目前使用的瀏覽器控制台顯示登入入口，無已授權服務檢視。
- 尚未知 service ID、environment ID、部署 image digest、啟動命令、實際 port、最近 deployment、runtime logs。無法判定是程序退出、錯誤 port、綁定介面或暫停服務；不能把錯誤頁列出的可能原因當成結論。

## 可重現步驟

1. 未登入開啟 `/sessions`，確認錯誤標題及請求 ID。
2. GET 主網域根頁與已記錄的 API 網域，確認同樣失敗。
3. 對照 `hermes-agent-evidence.json` 中的時間與狀態。不要嘗試登入、建立 session 或呼叫收費模型來掩蓋入口失敗。

## 待有部署唯讀存取後

1. 以兩個 domain 找到 service／environment，確認映像來源、tag 與 digest；只讀 metadata，不讀取或輸出秘密值。
2. 檢查服務狀態、deployment 結果與經遮蔽的啟動錯誤，確認 gateway/dashboard 是否實際啟動。
3. 比對部署 network port 與程序監聽介面、port；對照**部署版本**的文件，不直接套用最新 main。
4. 確認根因與管理此服務的 repo 後，才建立獨立修復 branch/PR。若是平台設定而非程式錯誤，記錄精確變更需求；依計畫不得自行重啟、修改外部服務或環境變數。
5. 修復後重新驗證公開入口、登入邊界、隔離的安全核心流程、390×844 與 1440×900，以及結果保存／錯誤恢復。證據完整後才計分。

## 本轮結論

`onlineReady=false`、`coreFlowPass=false`、`completeInfo=false`；readiness 分數仍為 null，未捏造分數。服務入口已知失敗，修復工作因缺少部署觀測而 blocked。整體 IN_PROGRESS。

本輪只更新交接文件與狀態；未改第三方上游、自有 console、CMS、部署設定或秘密。其他可獨立進行的下一輪工作：修复 bruce23 Windows command launcher，解除本機標準建置與瀏覽器驗證的障礙。
