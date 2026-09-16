import { AdminConfigError, ForbiddenError } from "./errors.ts";

export const DEFAULT_ADMIN_EMAIL = "aa0968111723@gmail.com";
const DEV_USER_ID = "dev-user";

export function parseAdminEmails(raw: string | undefined | null): string[] {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(/[,;\s]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function adminAllowlist(): string[] {
  return parseAdminEmails(
    typeof process === "undefined" ? undefined : process.env.PORTFOLIO_ADMIN_EMAILS,
  );
}

export function isAdminAllowlistConfigured(emails = adminAllowlist()): boolean {
  return emails.length > 0;
}

export function assertAdminAccess(input: {
  userId: string;
  email: string | null | undefined;
  allowlist?: string[];
}): { email: string } {
  const allowlist = input.allowlist ?? adminAllowlist();
  if (allowlist.length === 0) {
    throw new AdminConfigError(
      "PORTFOLIO_ADMIN_EMAILS 尚未設定。後台已關閉，不會讓任何已登入帳號進入。",
    );
  }
  if (input.userId === DEV_USER_ID) {
    throw new ForbiddenError("開發用帳號不能讀寫後台資料。");
  }
  const email = input.email?.trim().toLowerCase() ?? "";
  if (!email || !allowlist.includes(email)) {
    throw new ForbiddenError("這個帳號不在後台允許名單。");
  }
  return { email };
}
