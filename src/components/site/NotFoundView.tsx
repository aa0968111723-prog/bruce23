import { Link } from "@tanstack/react-router";

export function NotFoundView() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-mint-deep">找不到這一頁</p>
      <h1 className="mt-3 font-display text-4xl font-semibold">這頁還沒被放進光域</h1>
      <p className="mt-3 text-muted">
        連結可能打錯，或內容還在下一輪。回到首頁或作品總覽。
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground"
        >
          首頁
        </Link>
        <Link
          to="/work"
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-5 text-sm font-medium shadow-card"
        >
          作品
        </Link>
      </div>
    </div>
  );
}
