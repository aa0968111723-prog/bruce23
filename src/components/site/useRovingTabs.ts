import { useRef, type KeyboardEvent } from "react";

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
    if (idx < 0) return;
    let next = idx;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (idx + 1) % items.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (idx - 1 + items.length) % items.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = items.length - 1;
    } else {
      return;
    }
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
