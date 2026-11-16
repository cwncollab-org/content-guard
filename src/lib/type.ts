export type WindowState = {
  innerWidth: number;
  innerHeight: number;
  outerWidth: number;
  outerHeight: number;
  dpr: number;
  fullscreen: boolean;
  diffWidth: number;
  diffHeight: number;
  ratioInner: number;
  ratioOuter: number;
  ratioDiff: number;
  hidden: boolean;
};

export type BrowserEventType =
  | "keydown"
  | "mousedown"
  | "mouseup"
  | "resize"
  | "fullscreenchange"
  | "visibilitychange"
  | "beforeprint"
  | "afterprint"
  | "beforeunload"
  | "blur"
  | "focus"
  | "copy"
  | "cut"
  | "paste"
  | "contextmenu";

export type BrowserEvent = {
  timestamp: number;
  type: BrowserEventType;
};

export type BrowserKeyEvent = BrowserEvent & {
  type: "keydown" | "keyup";
  key: string;
};

export type BrowserWindowEvent = BrowserEvent & {
  type:
    | "resize"
    | "fullscreenchange"
    | "visibilitychange"
    | "beforeprint"
    | "afterprint"
    | "beforeunload";
  windowState: WindowState;
};

export type BrowserFocusEvent = BrowserEvent & {
  type: "focus" | "blur";
  focus: boolean;
};

export type ExtensionId =
  | "google_translate"
  | "browserbetterio_gemini"
  | "aitopia_chatgpt"
  | "quick_translate";

/** Extensions that have been detected. Detection is latched: once seen, a key stays true. */
export type DetectedExtensions = Partial<Record<ExtensionId, boolean>>;

export type ContentGuardState = {
  eventHistory: BrowserEvent[];
  hasFocus: boolean;
  windowState: WindowState | null;
  possibleToolWindowOpen: boolean | undefined;
  detectedExtensions: DetectedExtensions;
};
