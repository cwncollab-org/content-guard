# Content Guard

A React library for protecting content during online exams by enforcing fullscreen mode and detecting browser extensions.

## Installation

```bash
npm install @cwncollab-org/content-guard
```

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
- `isExtensionDetected`: Boolean indicating if a browser extension was detected

## License

MIT
