import { useLayoutEffect } from "react";

type ChapterSnapOptions = { enabled?: boolean; reduced?: boolean };

/** Declare native chapter snapping; the browser owns the entire scroll operation. */
export function useChapterSnap({ enabled = true, reduced = false }: ChapterSnapOptions = {}) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute("data-chapter-snap");
    root.dataset.chapterSnap = enabled && !reduced && CSS.supports("scroll-snap-type", "y proximity")
      ? "proximity" : "off";
    return () => {
      if (previous === null) root.removeAttribute("data-chapter-snap");
      else root.setAttribute("data-chapter-snap", previous);
    };
  }, [enabled, reduced]);
}
