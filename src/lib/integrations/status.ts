import type { IntegrationStatus } from "@/lib/cms/schema";

export const statusLabelZh: Record<IntegrationStatus, string> = {
  connected: "已連線",
  pending: "處理中",
  unavailable: "無法使用",
  failed: "失敗",
  not_configured: "尚未設定",
  verified: "已驗證",
  stale: "可能過期",
};

export function isSuccessStatus(status: IntegrationStatus): boolean {
  return status === "connected" || status === "verified";
}

export function fromHttpStatus(
  status: number,
  rateLimited: boolean,
): IntegrationStatus {
  if (rateLimited || status === 429) return "failed";
  if (status === 404) return "unavailable";
  if (status >= 200 && status < 300) return "verified";
  if (status === 0) return "failed";
  return "failed";
}
