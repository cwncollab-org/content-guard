import { createContext, RefObject } from "react";
import { ContentGuardState, DetectedExtensions } from "./type";

export type ContentGuardContext = {
  requestFullscreen: () => Promise<void>;
  isFullscreen: boolean;
  shouldHideContent: boolean;
  /** True when any known browser extension marker has been seen. */
  isExtensionDetected: boolean;
  /** Latched detections, keyed by extension id. */
  detectedExtensions: DetectedExtensions;
  rootRef: RefObject<HTMLElement | null>;
  state: ContentGuardState;
};

export const contentGuardContext = createContext<ContentGuardContext>(null!);
