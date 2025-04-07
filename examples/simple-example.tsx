import React from "react";
import {
  ContentGuard,
  ContentGuardProvider,
  useContentGuard,
} from "../src/lib";

function SimpleExample() {
  return (
    <ContentGuardProvider>
      <AppContent />
    </ContentGuardProvider>
  );
}

function AppContent() {
  const { requestFullscreen, isFullscreen } = useContentGuard();

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>Content Guard Example</h1>

      <ContentGuard
        replacement={
          <div
            style={{
              padding: "20px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h2>Content Protected</h2>
            <p>This content is only visible in fullscreen mode.</p>
          </div>
        }
      >
        <div
          style={{
            padding: "20px",
            backgroundColor: "#e6f7ff",
            borderRadius: "8px",
          }}
        >
          <h2>Protected Content</h2>
          <p>
            This is the content that is protected and only visible in fullscreen
            mode.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in
            dui mauris.
          </p>
        </div>
      </ContentGuard>

      {!isFullscreen && (
        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
          }}
        >
          <button
            onClick={requestFullscreen}
            style={{
              padding: "10px 20px",
              backgroundColor: "#1890ff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Enter Fullscreen
          </button>
        </div>
      )}
    </div>
  );
}

export default SimpleExample;
