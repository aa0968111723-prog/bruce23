export function nextIndex(length: number, current: number, dir: 1 | -1): number {
  if (length <= 0) return 0;
  return (current + dir + length) % length;
}
