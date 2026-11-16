import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ContentGuard, ContentGuardProvider } from "../index";

// Tells React that the act() calls below are the intended test environment.
(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const HIDDEN_TEXT = "Content is hidden";
const VISIBLE_TEXT = "Protected content";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  // jsdom reports an unfocused, hidden document, so the provider decides that the
  // content must be hidden. That is exactly the state the `enabled` prop overrides.
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
});

describe("ContentGuard enabled prop", () => {
  it("hides the content when the prop is omitted", async () => {
    const element = document.createElement("div");
    container.appendChild(element);

    await act(async () => {
      root = createRoot(element);
      root.render(
        <ContentGuardProvider>
          <ContentGuard replacement={<div>{HIDDEN_TEXT}</div>}>
            <div>{VISIBLE_TEXT}</div>
          </ContentGuard>
        </ContentGuardProvider>,
      );
    });

    expect(element.textContent).toBe(HIDDEN_TEXT);
  });

  it("renders the children when enabled is false", async () => {
    const element = document.createElement("div");
    container.appendChild(element);

    await act(async () => {
      root = createRoot(element);
      root.render(
        <ContentGuardProvider>
          <ContentGuard enabled={false} replacement={<div>{HIDDEN_TEXT}</div>}>
            <div>{VISIBLE_TEXT}</div>
          </ContentGuard>
        </ContentGuardProvider>,
      );
    });

    expect(element.textContent).toBe(VISIBLE_TEXT);
  });

  it("re-enables the guard when the prop flips back to true", async () => {
    const element = document.createElement("div");
    container.appendChild(element);

    const render = (enabled: boolean) =>
      act(async () => {
        root.render(
          <ContentGuardProvider>
            <ContentGuard
              enabled={enabled}
              replacement={<div>{HIDDEN_TEXT}</div>}
            >
              <div>{VISIBLE_TEXT}</div>
            </ContentGuard>
          </ContentGuardProvider>,
        );
      });

    await act(async () => {
      root = createRoot(element);
    });
    await render(false);
    expect(element.textContent).toBe(VISIBLE_TEXT);

    await render(true);
    expect(element.textContent).toBe(HIDDEN_TEXT);
  });
});
