import { Link } from "@tanstack/react-router";
import { useViewerLocale } from "./LocaleProvider";

export function NotFoundView() {
  const { ui } = useViewerLocale();
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-mint-deep">{ui.notFoundKicker}</p>
      <h1 className="mt-3 font-display text-4xl font-semibold">{ui.notFoundTitle}</h1>
      <p className="mt-3 text-muted">{ui.notFoundBody}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center rounded-full bg-mint px-5 text-sm font-semibold text-primary-foreground"
        >
          {ui.navHome}
        </Link>
        <Link
          to="/work"
          className="inline-flex min-h-11 items-center rounded-full bg-surface px-5 text-sm font-medium shadow-card"
        >
          {ui.navWork}
        </Link>
      </div>
    </div>
  );
}
