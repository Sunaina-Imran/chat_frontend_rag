"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChatRefreshProvider, useChatRefresh } from "./ChatRefreshContext";

export default function ChatLayout({ children }) {
    return (
        <ChatRefreshProvider>
            <ChatLayoutInner>{children}</ChatLayoutInner>
        </ChatRefreshProvider>
    );
}

function ChatLayoutInner({ children }) {
    const [chats, setChats] = useState([]);
    const [message, setMessage] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const router = useRouter();
    const pathname = usePathname();
    const chatId = pathname.split("/")[2];

    const getAllChats = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/sessions");
            setChats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleNewChat = async () => {
        if (isCreating) return;
        setIsCreating(true);
        try {
            const res = await axios.post("http://localhost:8000/api/session");
            await getAllChats();
            router.push(`/chat/${res.data._id}`);
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteChat = async (e, sessionId) => {
        e.stopPropagation();
        try {
            await axios.delete(`http://localhost:8000/api/session/${sessionId}`);
            await getAllChats();
            if (sessionId === chatId) router.push("/");
        } catch (err) {
            console.error(err);
        }
    };

    const { triggerRefresh } = useChatRefresh();

    const sendMessage = async () => {
        if (!message.trim() || !chatId || isSending) return;
        setIsSending(true);
        try {
            await axios.post("http://localhost:8000/api/message", { sessionId: chatId, message });
            setMessage("");
            triggerRefresh(); // signal child to re-fetch messages
        } catch (err) {
            console.error(err);
        } finally {
            setIsSending(false);
        }
    };

    useEffect(() => { getAllChats(); }, []);

    /* Spinner keyframes injected once */
    const spinnerStyle = `
        @keyframes naina-spin { to { transform: rotate(360deg); } }
        @keyframes naina-pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes naina-dot-bounce {
            0%,80%,100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
    `;

    return (
        <div style={{ display: "flex", height: "100vh", background: "#0d0d11", fontFamily: "system-ui,sans-serif" }}>
            <style>{spinnerStyle}</style>

            {/* ── Sidebar ── */}
            <aside style={{ width: 268, background: "#13131a", borderRight: "1px solid #1e1e2a", display: "flex", flexDirection: "column", flexShrink: 0 }}>

                <div style={{ padding: "16px 14px 12px" }}>
                    {/* Brand */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: "#6c5fe8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 600, color: "#eae8ff", letterSpacing: "0.01em", flex: 1 }}>nAIna Bot</span>
                    </div>

                    {/* ★ NEW CHAT BUTTON — wide pill with icon + label + shortcut ★ */}
                    <button
                        onClick={handleNewChat}
                        disabled={isCreating}
                        style={{
                            display: "flex", alignItems: "center", gap: 10,
                            width: "100%", padding: "10px 14px",
                            background: isCreating ? "#211e36" : "#1a1829",
                            border: isCreating ? "1px solid #6c5fe8" : "1px solid #2e2b4a",
                            borderRadius: 11,
                            cursor: isCreating ? "wait" : "pointer",
                            textAlign: "left",
                            opacity: isCreating ? 0.85 : 1,
                            transition: "all .2s ease",
                        }}
                        onMouseEnter={e => { if (!isCreating) { e.currentTarget.style.background = "#211e36"; e.currentTarget.style.borderColor = "#6c5fe8"; } }}
                        onMouseLeave={e => { if (!isCreating) { e.currentTarget.style.background = "#1a1829"; e.currentTarget.style.borderColor = "#2e2b4a"; } }}
                        onMouseDown={e => { if (!isCreating) e.currentTarget.style.transform = "scale(0.98)"; }}
                        onMouseUp={e => { if (!isCreating) e.currentTarget.style.transform = "scale(1)"; }}
                    >
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "#6c5fe8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {isCreating ? (
                                <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.25)", borderTopColor: "#fff", borderRadius: "50%", animation: "naina-spin .6s linear infinite" }} />
                            ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            )}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#c8c4f0", flex: 1 }}>
                            {isCreating ? "Creating…" : "New chat"}
                        </span>
                        {!isCreating && (
                            <span style={{ fontSize: 10, color: "#3e3a5c", background: "#0f0f17", border: "1px solid #252336", borderRadius: 5, padding: "2px 6px", letterSpacing: "0.04em" }}>
                                ⌘ N
                            </span>
                        )}
                    </button>
                </div>

                {/* Section label */}
                <div style={{ fontSize: 10, fontWeight: 500, color: "#3a3758", letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 14px 6px" }}>
                    Recent
                </div>

                {/* Chat list */}
                <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 8px", display: "flex", flexDirection: "column", gap: 1 }}>
                    {chats.map((chat) => {
                        const isActive = chat._id === chatId;
                        return (
                            <div
                                key={chat._id}
                                onClick={() => router.push(`/chat/${chat._id}`)}
                                className="group"
                                style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "8px 10px", borderRadius: 9, cursor: "pointer",
                                    background: isActive ? "#1b1830" : "transparent",
                                    border: isActive ? "1px solid #2b2848" : "1px solid transparent",
                                    transition: "background .12s",
                                }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#191726"; }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                            >
                                <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: isActive ? "#6c5fe8" : "#2e2b4a" }} />
                                <span style={{ fontSize: 12.5, flex: 1, color: isActive ? "#dbd8ff" : "#a09cc0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {chat.title || "lets start"}
                                </span>
                                <button
                                    onClick={(e) => handleDeleteChat(e, chat._id)}
                                    className="opacity-0 group-hover:opacity-100"
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "#c06060", fontSize: 11, padding: "2px 5px", borderRadius: 4, flexShrink: 0 }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(200,70,70,.15)")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                >✕</button>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div style={{ padding: "12px 14px", borderTop: "1px solid #1a1a26", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1f1c3a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "#8a83cc", flexShrink: 0 }}>U</div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#7e7aa0", flex: 1 }}>Your Account</span>
                    <button
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#3e3a5c", padding: 4, borderRadius: 6 }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#9b96cc"; e.currentTarget.style.background = "#1a1826"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "#3e3a5c"; e.currentTarget.style.background = "none"; }}
                        title="Settings"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0d0d11", minWidth: 0 }}>
                {/* Header */}
                <div style={{ padding: "13px 20px", borderBottom: "1px solid #1e1e2a", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#6c5fe8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                    </div>
                    <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#eae8ff", margin: 0 }}>nAIna Bot</p>
                        <p style={{ fontSize: 11, color: "#4ec87a", margin: 0, display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ec87a", display: "inline-block" }} />
                            Online
                        </p>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto" }}>{children}</div>

                {/* Input */}
                <div style={{ padding: "12px 14px", borderTop: "1px solid #1e1e2a", background: "#100f18", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#18172a", border: "1px solid #252240", borderRadius: 13, padding: "0 12px", gap: 8 }}>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#3e3a5c", padding: 4 }} title="Attach">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                            </svg>
                        </button>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Message nAIna…"
                            style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13.5, color: "#d0ccee", padding: "11px 0" }}
                        />
                    </div>
                    <button
                        onClick={sendMessage}
                        disabled={isSending}
                        style={{
                            width: 38, height: 38,
                            background: isSending ? "#5549c0" : "#6c5fe8",
                            border: "none", borderRadius: 10,
                            cursor: isSending ? "wait" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            transition: "background .15s",
                        }}
                        onMouseEnter={e => { if (!isSending) e.currentTarget.style.background = "#8072f0"; }}
                        onMouseLeave={e => { if (!isSending) e.currentTarget.style.background = "#6c5fe8"; }}
                        onMouseDown={e => { if (!isSending) e.currentTarget.style.transform = "scale(0.95)"; }}
                        onMouseUp={e => { if (!isSending) e.currentTarget.style.transform = "scale(1)"; }}
                        title="Send"
                    >
                        {isSending ? (
                            <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.25)", borderTopColor: "#fff", borderRadius: "50%", animation: "naina-spin .6s linear infinite" }} />
                        ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
}
