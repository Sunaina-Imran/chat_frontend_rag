"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import SortixLogo from "./chat/SortixLogo";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // Check auth
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace("/login");
            return;
        }

        // Check if user has a persona first
        const bootstrap = async () => {
            try {
                const personasRes = await api.get("/personas");
                if (!personasRes.data || personasRes.data.length === 0) {
                    router.replace("/persona");
                    return;
                }
            } catch {
                router.replace("/persona");
                return;
            }

            // Try to load existing sessions; redirect to the first one,
            // or create a brand-new session if none exist.
            try {
                const res = await api.get("/chat/sessions");
                if (res.data && res.data.length > 0) {
                    // Go straight to the most-recent chat
                    router.replace(`/chat/${res.data[0].session_id}`);
                } else {
                    // No existing chats — create one and navigate to it
                    const newSession = await api.post("/chat/session");
                    router.replace(`/chat/${newSession.data.session_id}`);
                }
            } catch {
                // If backend is unreachable, fall back to the chat list page
                router.replace("/chat");
            }
        };

        bootstrap();
    }, [router]);

    // Minimal splash while redirecting — themed with Sora orange
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                background: "#0e0d0c",
                gap: 16,
                fontFamily: "'Sora', sans-serif",
            }}
        >
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
            `}</style>

            {/* Brand icon — Sortix logo at 2× size */}
            <SortixLogo size={112} style={{ animation: "pulse 2s infinite ease-in-out" }} />

            <p style={{ fontSize: 16, fontWeight: 600, color: "#f0ece6", margin: 0, letterSpacing: "0.02em" }}>
                Starting Sortix…
            </p>

            {/* Spinner — Orange themed */}
            <div
                style={{
                    width: 24, height: 24,
                    border: "3px solid rgba(232,115,74,0.15)",
                    borderTopColor: "#e8734a",
                    borderRadius: "50%",
                    animation: "spin .7s linear infinite",
                }}
            />
        </div>
    );
}
