export function moveTabIndex(
  current: number,
  key: string,
  length: number,
): number {
  if (length <= 0) return 0;
  if (key === "ArrowRight" || key === "ArrowDown") return (current + 1) % length;
  if (key === "ArrowLeft" || key === "ArrowUp") {
    return (current - 1 + length) % length;
  }
  if (key === "Home") return 0;
  if (key === "End") return length - 1;
  return current;
}

export function motionEnabled(prefersReducedMotion: boolean): boolean {
  return !prefersReducedMotion;
}

export function iframeFallbackCopy(kind: "canva" | "demo") {
  if (kind === "canva") {
    return {
      titleZh: "Canva 嵌入無法顯示",
      bodyZh: "可能需要分享權限，或瀏覽器阻擋了嵌入。請用「在 Canva 開啟原作」。",
      titleEn: "Canva embed unavailable",
      bodyEn: "The design may need permission, or the browser blocked the embed.",
    };
  }
  return {
    titleZh: "即時預覽無法載入",
    bodyZh: "公開網址狀態會變動。請改用新分頁開啟，或稍後再試。",
    titleEn: "Live preview unavailable",
    bodyEn: "Public demo URLs can drift. Open in a new tab, or try later.",
  };
}
