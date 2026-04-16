"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // Try to load existing sessions; redirect to the first one,
        // or create a brand-new session if none exist.
        const bootstrap = async () => {
            try {
                const res = await axios.get("http://localhost:8000/api/sessions");
                if (res.data && res.data.length > 0) {
                    // Go straight to the most-recent chat
                    router.replace(`/chat/${res.data[0]._id}`);
                } else {
                    // No existing chats — create one and navigate to it
                    const newSession = await axios.post("http://localhost:8000/api/session");
                    router.replace(`/chat/${newSession.data._id}`);
                }
            } catch {
                // If backend is unreachable, fall back to the chat list page
                router.replace("/chat");
            }
        };

        bootstrap();
    }, [router]);

    // Minimal splash while redirecting
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                background: "#0d0d11",
                gap: 16,
                fontFamily: "system-ui, sans-serif",
            }}
        >
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            {/* Brand icon */}
            <div
                style={{
                    width: 52, height: 52,
                    borderRadius: 14,
                    background: "linear-gradient(135deg, #7c6ef7, #5b51cc)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 8px 32px rgba(108,95,232,0.4)",
                }}
            >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                    stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10
                             15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
            </div>

            <p style={{ fontSize: 15, fontWeight: 500, color: "#8a85b0", margin: 0 }}>
                Starting nAIna…
            </p>

            {/* Spinner */}
            <div
                style={{
                    width: 20, height: 20,
                    border: "2px solid rgba(108,95,232,.2)",
                    borderTopColor: "#7c6ef7",
                    borderRadius: "50%",
                    animation: "spin .7s linear infinite",
                }}
            />
        </div>
    );
}
