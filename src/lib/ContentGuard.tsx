import { PropsWithChildren, useEffect, useRef } from "react";
import { useContentGuard } from "./useContentGuard";
import { injectStyleRecursively } from "./utils";

type Props = PropsWithChildren & {
  replacement?: React.ReactNode;
  style?: React.CSSProperties;
  /**
   * Turns the guard on or off. Defaults to `true`.
   *
   * Pass `false` to always render `children` and to skip the copy-protection
   * styles, which is handy while developing. No other guard behaviour in
   * `ContentGuardProvider` is affected.
   */
  enabled?: boolean;
};

export function ContentGuard(props: Props) {
  const { replacement, children, style, enabled = true } = props;
  const { shouldHideContent } = useContentGuard();
  const hideContent = enabled && shouldHideContent;

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hideContent && ref.current) {
      injectStyleRecursively(ref.current, {
        userSelect: "none",
      });
    }
  }, [hideContent]);

  if (hideContent) {
    return <>{replacement}</>;
  }

  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
}
