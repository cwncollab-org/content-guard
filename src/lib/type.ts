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
