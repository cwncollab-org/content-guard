export function injectStyleRecursively(
  el: HTMLElement,
  style: Record<string, string>
) {
  if (!el) {
    return;
  }
  for (const key in style) {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    el.style[key as any] = style[key];
  }
  for (let i = 0; i < el.children.length; i++) {
    injectStyleRecursively(el.children[i] as HTMLElement, style);
  }
}

export function findElementRecursively(
  el: HTMLElement,
  predicate: (el: HTMLElement) => boolean
): HTMLElement | null {
  if (!el) {
    return null;
  }

  if (predicate(el)) {
    return el;
  }
  for (let i = 0; i < el.children.length; i++) {
    const found = findElementRecursively(
      el.children[i] as HTMLElement,
      predicate
    );
    if (found) {
      return found;
    }
  }
  return null;
}
