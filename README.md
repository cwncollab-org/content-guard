# Content Guard

A React library for protecting content during online exams by enforcing fullscreen mode and detecting browser extensions.

## Installation

```bash
npm install @cwncollab-org/content-guard
```

## Publishing to AWS CodeArtifact

This package publishes to the `cwncollab` AWS CodeArtifact npm repository in `ap-southeast-1`.

### Prerequisites

- AWS CLI v2
- Node 20 or 22 LTS for publish-time validation
- AWS credentials with permission to publish to CodeArtifact

### Supported environment variables

- `AWS_PROFILE` to use a named local AWS profile
- `AWS_REGION` defaults to `ap-southeast-1`
- `CODEARTIFACT_DOMAIN` defaults to `cwncollab`
- `CODEARTIFACT_DOMAIN_OWNER` defaults to `619005574504`
- `CODEARTIFACT_REPOSITORY` defaults to `cwncollab`
- `CODEARTIFACT_REGISTRY` defaults to `https://cwncollab-619005574504.d.codeartifact.ap-southeast-1.amazonaws.com/npm/cwncollab/`
- `DEFAULT_NPM_REGISTRY` defaults to `https://registry.npmjs.org/`

### Required IAM permissions

- `codeartifact:GetAuthorizationToken`
- `sts:GetServiceBearerToken`
- `codeartifact:PublishPackageVersion`
- `codeartifact:ReadFromRepository`

### Publish flow

Validate the package before the first publish:

```bash
npm run clean
npm run build:lib
npm pack --dry-run
```

Publish through the shared wrapper:

```bash
npm run publish:aws
```

Pass extra `npm publish` flags after `--`:

```bash
npm run publish:aws -- --tag beta
```

The publish wrapper runs `aws codeartifact login --tool npm`, restores your user-level npm registry back to `https://registry.npmjs.org/`, and then publishes explicitly to CodeArtifact. Credentials stay in your local AWS and npm config and are not committed to this repo.

## Usage

```jsx
import { ContentGuard, ContentGuardProvider, useContentGuard } from '@cwncollab-org/content-guard';

function App() {
  return (
    <ContentGuardProvider>
      <AppContent />
    </ContentGuardProvider>
  );
}

function AppContent() {
  const { requestFullscreen, isFullscreen } = useContentGuard();

  return (
    <div>
      <ContentGuard
        replacement={<div>Please enter fullscreen mode to view content</div>}
      >
        <div>Your protected content here</div>
      </ContentGuard>
      
      {!isFullscreen && (
        <button onClick={requestFullscreen}>
          Enter Fullscreen
        </button>
      )}
    </div>
  );
}
```

## Components and Hooks

### ContentGuardProvider

A context provider that manages the fullscreen state and browser extension detection.

### ContentGuard

A component that wraps content that should only be visible in fullscreen mode.

#### Props

- `replacement`: React node to display when not in fullscreen mode
- `style`: Optional CSS styles for the wrapper
- `children`: Content to protect

### useContentGuard

A hook that provides access to the content guard functionality.

#### Returns

- `requestFullscreen`: Function to request fullscreen mode
- `isFullscreen`: Boolean indicating if the app is in fullscreen mode
- `shouldHideContent`: Boolean indicating if the guarded content must be replaced
- `isExtensionDetected`: Boolean indicating if a browser extension was detected
- `detectedExtensions`: Object keyed by extension id with the latched detections
- `state`: Low level state (`eventHistory`, `hasFocus`, `windowState`, `possibleToolWindowOpen`, `detectedExtensions`)

## Detection

Detection runs once on mount and then reacts to DOM changes (no polling) over
`document.body`, so markers injected anywhere in the page are found.

Detected markers:

| Extension | Markers |
| --- | --- |
| Google Translate | `#gtx-trans`, `#gtx-anchor`, `#goog-gt-tt`, `.goog-te-balloon-frame`, `.skiptranslate`, and `<html class="translated-ltr">` / `translated-rtl` |
| BrowserBetter Gemini | `#gemini_sidebar_cext_t` |
| Aitopia ChatGPT | `#aitopia` |
| Quick Translate | `#qt_translate_popup` |

Rules:

- Only element presence is checked. iframe `src` attributes are never read and the documents
  inside iframes are never inspected.
- Detections are latched: once an extension has been seen it stays detected for the lifetime of
  the provider, even after its marker or the guarded content disappears.
- A detected page translation adds `google_translate` to `detectedExtensions` and forces
  `shouldHideContent`, so `ContentGuard` renders its `replacement`. Other extensions are reported
  through `isExtensionDetected` but do not hide content on their own.

## License

MIT
