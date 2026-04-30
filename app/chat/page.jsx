"use client";

import SortixLogo from "./SortixLogo";

export default function Page() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: 16,
        background: "#111317",
        padding: "40px 24px",
      }}
    >
      <SortixLogo size={112} />
      <p style={{ fontSize: 20, fontWeight: 600, color: "#e2e2e8", margin: 0 }}>Let&apos;s start!</p>
      <p style={{ fontSize: 13, color: "#6b6885", textAlign: "center", maxWidth: 260, lineHeight: 1.7, margin: 0 }}>
        Hi! I&apos;m Sortix — your intelligent assistant. Send a message to begin.
      </p>
    </div>
  );
}