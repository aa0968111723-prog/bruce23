import { useRef, type KeyboardEvent } from "react";

/** Pure index math for experience/work/archive tablists. Null = ignore the key. */
export function nextRovingTabIndex(length: number, idx: number, key: string): number | null {
  if (length <= 0 || idx < 0) return null;
  if (key === "ArrowRight" || key === "ArrowDown") return (idx + 1) % length;
  if (key === "ArrowLeft" || key === "ArrowUp") return (idx - 1 + length) % length;
  if (key === "Home") return 0;
  if (key === "End") return length - 1;
  return null;
}

export function useRovingTabs<T extends string>(
  items: readonly T[],
  value: T,
  onChange: (next: T) => void,
) {
  const refs = useRef(new Map<T, HTMLElement>());

  const setRef = (id: T) => (el: HTMLElement | null) => {
    if (el) refs.current.set(id, el);
    else refs.current.delete(id);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const idx = items.indexOf(value);
    const next = nextRovingTabIndex(items.length, idx, event.key);
    if (next === null) return;
    event.preventDefault();
    const id = items[next];
    onChange(id);
    queueMicrotask(() => refs.current.get(id)?.focus());
  };

  return {
    setRef,
    onKeyDown,
    tabIndex: (id: T) => (id === value ? 0 : -1),
  };
}
