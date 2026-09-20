"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#08060c",
          color: "#ffffff",
          padding: "1.5rem",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            textAlign: "center",
            padding: "2.5rem",
            borderRadius: "24px",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 25px 80px rgba(0, 0, 0, 0.8)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: "999px",
              border: "1px solid rgba(168, 85, 247, 0.35)",
              background: "rgba(88, 28, 135, 0.3)",
              fontSize: "11px",
              fontFamily: "monospace",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#c084fc",
              marginBottom: "1.25rem",
            }}
          >
            SAVISKAR 2026 • CORE ENGINE
          </div>

          <h1
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              margin: "0 0 1rem",
              lineHeight: 1.2,
            }}
          >
            Critical System Anomaly
          </h1>

          <p
            style={{
              fontSize: "14px",
              color: "rgba(255, 255, 255, 0.65)",
              margin: "0 0 2rem",
              lineHeight: 1.65,
            }}
          >
            A core runtime exception was intercepted at the root layout. Your registration sessions remain protected.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{
                background: "#ffffff",
                color: "#08060c",
                border: "none",
                borderRadius: "12px",
                padding: "12px 28px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
            >
              Restart Engine
            </button>
            <a
              href="/"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "12px",
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Mainstage
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
