import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ContentGuard, ContentGuardProvider, useContentGuard } from "../index";

// Tells React that updates triggered from MutationObserver callbacks are wrapped in act().
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const HIDDEN_TEXT = "Content is hidden";
const VISIBLE_TEXT = "Protected content";

function Probe() {
  const { isExtensionDetected, detectedExtensions } = useContentGuard();
  return (
    <span>
      {`detected:${isExtensionDetected};${JSON.stringify(detectedExtensions)}`}
    </span>
  );
}

function App() {
  return (
    <ContentGuardProvider>
      <Probe />
      <ContentGuard replacement={<div>{HIDDEN_TEXT}</div>}>
        <div>{VISIBLE_TEXT}</div>
      </ContentGuard>
    </ContentGuardProvider>
  );
}

let container: HTMLDivElement;
let root: Root;

function mockFullscreen(isActive: boolean) {
  Object.defineProperty(document, "fullscreenElement", {
    configurable: true,
    get: () => (isActive ? document.body : null),
  });
}

/**
 * jsdom reports `hasFocus: false` and `hidden: true`, which the provider treats as
 * "content must be hidden" regardless of extension detection.
 */
function mockActiveDocument() {
  Object.defineProperty(document, "hasFocus", {
    configurable: true,
    value: () => true,
  });
  Object.defineProperty(document, "hidden", {
    configurable: true,
    get: () => false,
  });
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => "visible",
  });
}

/** Lets MutationObserver callbacks and the resulting React updates settle. */
async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

async function appendToBody(element: HTMLElement) {
  await act(async () => {
    document.body.appendChild(element);
  });
  await flush();
  return element;
}

function createMarker(id: string) {
  const marker = document.createElement("div");
  marker.id = id;
  return marker;
}

beforeEach(async () => {
  mockFullscreen(true);
  mockActiveDocument();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(<App />);
  });
  await flush();
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
  document.body.innerHTML = "";
  document.documentElement.className = "";
  mockFullscreen(false);
});

describe("Google Translate detection", () => {
  it("starts visible when nothing is detected", () => {
    expect(container.textContent).toContain(VISIBLE_TEXT);
    expect(container.textContent).toContain("detected:false");
  });

  it("hides guarded content when the translate tooltip is injected", async () => {
    expect(container.textContent).toContain(VISIBLE_TEXT);

    await appendToBody(createMarker("gtx-trans"));

    expect(container.textContent).toContain(HIDDEN_TEXT);
    expect(container.textContent).not.toContain(VISIBLE_TEXT);
  });

  it("hides guarded content when Chrome marks the document as translated", async () => {
    await act(async () => {
      document.documentElement.classList.add("translated-ltr");
    });
    await flush();

    expect(container.textContent).toContain(HIDDEN_TEXT);
    expect(container.textContent).toContain("google_translate");
  });

  it("hides guarded content for a translated-rtl document as well", async () => {
    await act(async () => {
      document.documentElement.classList.add("translated-rtl");
    });
    await flush();

    expect(container.textContent).toContain(HIDDEN_TEXT);
  });

  it("ignores iframe src and markers inside iframes", async () => {
    const iframe = document.createElement("iframe");
    iframe.src = "https://translate.googleapis.com/translate_static/banner.html";

    await appendToBody(iframe);

    const innerDocument = iframe.contentDocument;
    if (innerDocument?.body) {
      const innerMarker = innerDocument.createElement("div");
      innerMarker.id = "gtx-trans";
      innerDocument.body.appendChild(innerMarker);
    }
    await flush();

    expect(container.textContent).toContain(VISIBLE_TEXT);
    expect(container.textContent).toContain("detected:false");
  });

  it("reports other extensions without hiding the content", async () => {
    await appendToBody(createMarker("aitopia"));

    expect(container.textContent).toContain("detected:true");
    expect(container.textContent).toContain("aitopia_chatgpt");
    expect(container.textContent).toContain(VISIBLE_TEXT);
  });

  it("keeps the content hidden after the marker disappears", async () => {
    const marker = await appendToBody(createMarker("gtx-anchor"));
    expect(container.textContent).toContain(HIDDEN_TEXT);

    await act(async () => {
      marker.remove();
    });
    await flush();

    expect(container.textContent).toContain(HIDDEN_TEXT);
  });
});
