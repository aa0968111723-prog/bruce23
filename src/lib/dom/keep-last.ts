/** Keep the last node matching `selector`; remove earlier copies. */
export function keepLastMatches(root: ParentNode, selector: string): number {
  const nodes = [...root.querySelectorAll(selector)];
  const keep = nodes.at(-1) ?? null;
  let removed = 0;
  for (const node of nodes) {
    if (node !== keep) {
      node.remove();
      removed += 1;
    }
  }
  return removed;
}
