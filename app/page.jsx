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

            {/* Brand icon — Sortix logo at 2× size */}
            <SortixLogo size={104} />

            <p style={{ fontSize: 15, fontWeight: 500, color: "#8a85b0", margin: 0 }}>
                Starting Sortix…
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
