"use client";

import SortixLogo from "./SortixLogo";

const C = {
  bg2: "#141210",
  text: "#f0ece6",
  textMuted: "#8a8070",
};

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
        background: C.bg2,
        padding: "40px 24px",
      }}
    >
      <SortixLogo size={112} />
      <p style={{ fontSize: 20, fontWeight: 600, color: C.text, margin: 0 }}>Let's start!</p>
      <p style={{ fontSize: 13, color: C.textMuted, textAlign: "center", maxWidth: 260, lineHeight: 1.7, margin: 0 }}>
        Hi! I'm Sortix — your intelligent assistant. Send a message to begin.
      </p>
    </div>
  );
}