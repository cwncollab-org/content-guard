# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

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
