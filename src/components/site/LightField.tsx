import { cn } from "@/lib/cn";

export function LightField({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <span className="orb drift absolute -left-16 top-10 size-64 rounded-full bg-mint/40 blur-3xl" />
      <span className="orb drift absolute right-[-4rem] top-24 size-72 rounded-full bg-sky/35 blur-3xl" />
      <span className="orb absolute bottom-10 left-1/3 size-40 rounded-full bg-sun/35 blur-3xl" />
      <span className="orbit absolute left-1/2 top-20 size-80 -translate-x-1/2 rounded-full border border-line/70" />
    </div>
  );
}
