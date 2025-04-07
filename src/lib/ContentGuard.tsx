import { PropsWithChildren, useEffect, useRef } from "react";
import { useContentGuard } from "./useContentGuard";
import { injectStyleRecursively } from "./utils";

type Props = PropsWithChildren & {
  replacement?: React.ReactNode;
  style?: React.CSSProperties;
};

export function ContentGuard({ replacement, children, style }: Props) {
  const { shouldHideContent } = useContentGuard();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shouldHideContent && ref.current) {
      injectStyleRecursively(ref.current, {
        userSelect: "none",
      });
    }
  }, [shouldHideContent]);

  if (shouldHideContent) {
    return replacement;
  }

  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
}
