/**
 * Notion adapter — interface only.
 * Notion is not connected in this environment. Do not invent page content.
 * Record sync items in PORTFOLIO_TASK_STATE.md instead of blocking the site.
 */

export interface NotionPortfolioPage {
  id: string;
  title: string;
  slug?: string;
  lastEdited?: string;
}

export interface NotionAdapter {
  isConnected(): boolean;
  listPortfolioPages(): Promise<NotionPortfolioPage[]>;
}

export const notionAdapter: NotionAdapter = {
  isConnected() {
    return false;
  },
  async listPortfolioPages() {
    return [];
  },
};

export const notionSyncTodo = [
  "Connect Notion workspace when OAuth is available",
  "Map public case-study pages to Project.slug",
  "Never sync private club rosters, phone numbers, or test accounts",
] as const;
