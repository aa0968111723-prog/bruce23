import type { GithubDiffRow } from "@/lib/github/diff";

export function GithubSyncDiff({ rows }: { rows: GithubDiffRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <p className="px-3 py-2 text-xs text-muted">
        只比對 GitHub 中繼資料。中文敘事、SEO、體驗設定不會被同步覆寫。
      </p>
      <table className="min-w-full text-left text-sm">
        <thead className="bg-surface-blue text-xs text-muted">
          <tr>
            <th className="px-3 py-2 font-medium">欄位</th>
            <th className="px-3 py-2 font-medium">目前</th>
            <th className="px-3 py-2 font-medium">即將寫入</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.field} className={row.changed ? "bg-surface-mint/70" : "bg-surface"}>
              <td className="px-3 py-2 align-top font-medium">{row.label}</td>
              <td className="max-w-48 px-3 py-2 align-top text-muted">{row.current}</td>
              <td className="max-w-48 px-3 py-2 align-top">{row.incoming}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
