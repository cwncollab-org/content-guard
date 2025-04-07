import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { contentGuardContext } from "./ContentGuardContext";
import { useBrowserExtensionDetector } from "./useBrowserExtensionDetector";
import { useList } from "react-use";
import {
  BrowserEvent,
  BrowserEventType,
  BrowserFocusEvent,
  BrowserKeyEvent,
  BrowserWindowEvent,
  WindowState,
} from "./type";

type Props = PropsWithChildren & {};

export function ContentGuardProvider({ children }: Props) {
  const ref = useRef<HTMLElement>(document.body);

  const [hasFocus, setHasFocus] = useState(document.hasFocus());
  const [windowState, setWindowState] = useState<WindowState | null>(null);
  const mouseDownEvent = useRef<MouseEvent | null>(null);
  const [eventHistory, { push: pushBrowserEvent }] = useList<BrowserEvent>();

  const requestFullscreen = useCallback(() => {
    return ref.current?.requestFullscreen();
  }, []);

  const isFullscreen =
    Boolean(document.fullscreenElement) &&
    document.fullscreenElement === ref.current;

  const isPageHidden = document.hidden;

  const possibleToolWindowOpen =
    windowState?.fullscreen && windowState?.ratioDiff > 0.1;

  const shouldHideContent = useMemo(() => {
    if (!isFullscreen || !hasFocus || isPageHidden || possibleToolWindowOpen) {
      return true;
    }
    return false;
  }, [isFullscreen, hasFocus, isPageHidden, possibleToolWindowOpen]);

  const captureWindowState = useCallback(() => {
    const dpr = window.devicePixelRatio;
    const normalizedInnerWidth = window.innerWidth * 1;
    const normalizedInnerHeight = window.innerHeight * 1;

    const diffWidth = Math.abs(window.outerWidth - normalizedInnerWidth);
    const diffHeight = Math.abs(window.outerHeight - normalizedInnerHeight);

    const ratioInner = window.innerWidth / window.innerHeight;
    const ratioOuter = window.outerWidth / window.outerHeight;
    const ratioDiff = Math.abs(ratioInner - ratioOuter);
    const windowState = {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      dpr,
      fullscreen:
        Boolean(document.fullscreenElement) &&
        document.fullscreenElement === ref.current,
      diffWidth,
      diffHeight,
      ratioInner,
      ratioOuter,
      ratioDiff,
      hidden: document.hidden ? true : false,
    };
    setWindowState(windowState);
    return windowState;
  }, [setWindowState]);

  const addBrowserEvent = useCallback(
    (type: BrowserEventType) => {
      pushBrowserEvent({
        timestamp: Date.now(),
        type,
      } as BrowserEvent);
    },
    [pushBrowserEvent]
  );

  const addBrowserKeyEvent = useCallback(
    (type: "keyup" | "keydown", key: string) => {
      pushBrowserEvent({
        timestamp: Date.now(),
        type,
        key: key,
      } as BrowserKeyEvent);
    },
    [pushBrowserEvent]
  );

  const addBrowserWindowEvent = useCallback(
    (
      type:
        | "resize"
        | "fullscreenchange"
        | "visibilitychange"
        | "beforeprint"
        | "afterprint"
        | "beforeunload",
      windowState: WindowState
    ) => {
      pushBrowserEvent({
        timestamp: Date.now(),
        type,
        windowState,
      } as BrowserWindowEvent);
    },
    [pushBrowserEvent]
  );

  const addBrowserFocusEvent = useCallback(
    (type: "focus" | "blur", focus: boolean) => {
      pushBrowserEvent({
        timestamp: Date.now(),
        type,
        focus,
      } as BrowserFocusEvent);
    },
    [pushBrowserEvent]
  );

  useEffect(() => {
    const controller = new AbortController();

    window.addEventListener(
      "beforeprint",
      () => addBrowserEvent("beforeprint"),
      {
        signal: controller.signal,
      }
    );

    window.addEventListener("afterprint", () => addBrowserEvent("afterprint"), {
      signal: controller.signal,
    });

    window.addEventListener(
      "beforeunload",
      () => addBrowserEvent("beforeunload"),
      {
        signal: controller.signal,
      }
    );

    window.addEventListener(
      "blur",
      () => {
        setHasFocus(false);
        addBrowserFocusEvent("blur", false);
      },
      {
        signal: controller.signal,
      }
    );

    window.addEventListener(
      "focus",
      () => {
        setHasFocus(true);
        addBrowserFocusEvent("focus", false);
      },
      {
        signal: controller.signal,
      }
    );

    window.addEventListener(
      "resize",
      () => {
        const windowState = captureWindowState();
        addBrowserWindowEvent("resize", windowState);
      },
      {
        signal: controller.signal,
      }
    );

    document.addEventListener("copy", () => addBrowserEvent("copy"), {
      signal: controller.signal,
    });
    document.addEventListener("cut", () => addBrowserEvent("cut"), {
      signal: controller.signal,
    });
    document.addEventListener("paste", () => addBrowserEvent("paste"), {
      signal: controller.signal,
    });
    document.addEventListener(
      "keydown",
      (event) => addBrowserKeyEvent("keydown", event.key),
      {
        signal: controller.signal,
      }
    );

    document.addEventListener(
      "visibilitychange",
      () => {
        const windowState = captureWindowState();
        addBrowserWindowEvent("visibilitychange", windowState);
      },
      {
        signal: controller.signal,
      }
    );

    document.addEventListener(
      "fullscreenchange",
      () => {
        const windowState = captureWindowState();
        addBrowserWindowEvent("fullscreenchange", windowState);
      },
      {
        signal: controller.signal,
      }
    );

    ref.current?.addEventListener(
      "contextmenu",
      (e) => {
        e.preventDefault();
        addBrowserEvent("contextmenu");
      },
      { signal: controller.signal }
    );

    ref.current?.addEventListener(
      "mousedown",
      (e) => {
        if (e.button === 0) {
          mouseDownEvent.current = e;
        }
        if (e.button === 2) {
          e.preventDefault();
        }
      },
      { signal: controller.signal }
    );

    ref.current?.addEventListener(
      "mouseup",
      (e) => {
        if (e.button === 0 && mouseDownEvent.current) {
          const diffX = e.clientX - mouseDownEvent.current.clientX;
          const diffY = e.clientY - mouseDownEvent.current.clientY;
          mouseDownEvent.current = null;

          if (Math.abs(diffX) > 10 || Math.abs(diffY) > 5) {
            console.log("drag attempt");
          }
        }
      },
      { signal: controller.signal }
    );

    captureWindowState();
    return () => {
      controller.abort();
    };
  }, [
    captureWindowState,
    addBrowserEvent,
    addBrowserKeyEvent,
    addBrowserFocusEvent,
    addBrowserWindowEvent,
  ]);

  useBrowserExtensionDetector();

  return (
    <contentGuardContext.Provider
      value={{
        requestFullscreen,
        isFullscreen: windowState?.fullscreen ?? false,
        shouldHideContent,
        rootRef: ref,
        state: {
          eventHistory,
          hasFocus,
          windowState,
          possibleToolWindowOpen,
        },
      }}
    >
      {children}
    </contentGuardContext.Provider>
  );
}
