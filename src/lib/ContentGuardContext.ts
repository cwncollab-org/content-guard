import { createContext, RefObject } from "react";

export type ContentGuardContext = {
  requestFullscreen: () => void;
  isFullscreen: boolean;
  shouldHideContent: boolean;
  rootRef: RefObject<HTMLElement | null>;
  state: Record<string, unknown>;
};

export const contentGuardContext = createContext<ContentGuardContext>(null!);
