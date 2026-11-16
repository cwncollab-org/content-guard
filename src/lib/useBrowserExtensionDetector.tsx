import { useEffect, useState } from "react";
import { DetectedExtensions, ExtensionId } from "./type";

type ExtensionDefinition = {
  id: ExtensionId;
  selector: string;
};

/**
 * Markers injected into the page when a known extension is active.
 *
 * `google_translate` covers Chrome's built-in page translation: the hover tooltip
 * (`#gtx-trans`, `#gtx-anchor`), the translate tooltip frame (`#goog-gt-tt`,
 * `.goog-te-balloon-frame`) and the website-translator banner (`.skiptranslate`).
 * Markers are matched by element presence only - iframe `src` attributes and the
 * documents inside iframes are never inspected.
 */
const knownExtensions: ExtensionDefinition[] = [
  {
    id: "google_translate",
    selector:
      "#gtx-trans, #gtx-anchor, #goog-gt-tt, .goog-te-balloon-frame, .skiptranslate",
  },
  { id: "browserbetterio_gemini", selector: "#gemini_sidebar_cext_t" },
  { id: "aitopia_chatgpt", selector: "#aitopia" },
  { id: "quick_translate", selector: "#qt_translate_popup" },
];

/**
 * Classes Chrome adds to <html> as soon as the page has been translated. This fires
 * without waiting for the user to hover a translated phrase, and needs no iframe.
 */
const translatedRootClassNames = ["translated-ltr", "translated-rtl"];

type Options = {
  /**
   * Element whose subtree is scanned. Defaults to `document.body`, so markers injected
   * anywhere in the document are found regardless of where the guarded content lives.
   */
  root?: HTMLElement | null;
  /** Also treat `<html class="translated-ltr|translated-rtl">` as translation. Defaults to `true`. */
  detectDocumentTranslation?: boolean;
};

function matchesSelector(el: Element, selector: string) {
  try {
    return el.matches(selector) || el.querySelector(selector) !== null;
  } catch {
    return false;
  }
}

function hasTranslatedDocumentClass() {
  const documentElement = document.documentElement;
  if (!documentElement) {
    return false;
  }
  return translatedRootClassNames.some((className) =>
    documentElement.classList.contains(className),
  );
}

export function useBrowserExtensionDetector(options: Options = {}) {
  const { root = null, detectDocumentTranslation = true } = options;
  const [extensions, setExtensions] = useState<DetectedExtensions>({});

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const scope = root ?? document.body;
    if (!scope) {
      return;
    }

    const scan = () => {
      const found: DetectedExtensions = {};

      for (const definition of knownExtensions) {
        if (matchesSelector(scope, definition.selector)) {
          found[definition.id] = true;
        }
      }

      if (detectDocumentTranslation && hasTranslatedDocumentClass()) {
        found.google_translate = true;
      }

      return found;
    };

    // Detection is latched: hiding the guarded content unmounts it together with any
    // marker inside it, so a detected extension must not flip back to "not detected".
    const merge = (found: DetectedExtensions) => {
      setExtensions((prev) => {
        let next: DetectedExtensions | null = null;

        for (const id of Object.keys(found) as ExtensionId[]) {
          if (found[id] && !prev[id]) {
            next = next ?? { ...prev };
            next[id] = true;
          }
        }

        return next ?? prev;
      });
    };

    merge(scan());

    // One observer for injected elements (extension UI), one for the <html> class
    // Chrome toggles when it translates the page. Neither walks iframe documents.
    const subtreeObserver = new MutationObserver(() => merge(scan()));
    subtreeObserver.observe(scope, { childList: true, subtree: true });

    const documentElement = document.documentElement;
    const rootClassObserver = documentElement
      ? new MutationObserver(() => merge(scan()))
      : null;
    rootClassObserver?.observe(documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      subtreeObserver.disconnect();
      rootClassObserver?.disconnect();
    };
  }, [root, detectDocumentTranslation]);

  return extensions;
}
