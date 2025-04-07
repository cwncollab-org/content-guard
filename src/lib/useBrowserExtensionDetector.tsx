import { useInterval, useMap } from "react-use";
import { findElementRecursively } from "./utils";

type KnownExtension = {
  [key: string]: string[];
};
const knownExtensions: KnownExtension = {
  google_transalate: ["gtx-trans", "gtx-anchor"],
  browserbetterio_gemini: ["gemini_sidebar_cext_t"],
  aitopia_chatgpt: ["aitopia"],
  quick_translate: ["qt_translate_popup"],
} as const;

export function useBrowserExtensionDetector() {
  const [extensions, { set }] = useMap();

  useInterval(() => {
    if (!document) {
      return;
    }

    findElementRecursively(document.documentElement, (el) => {
      if (!el.id) {
        return false;
      }

      for (const key in knownExtensions) {
        if (knownExtensions[key].includes(el.id) && !extensions.has(key)) {
          set(key, true);
          return true;
        }
      }
      return false;
    });
  }, 1000);
}
