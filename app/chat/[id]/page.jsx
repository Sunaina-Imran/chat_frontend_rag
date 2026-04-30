"use client";

import React, { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChatRefresh } from "../ChatRefreshContext";
import SortixLogo from "../SortixLogo";

/* ─── Markdown prose styles injected once ─── */
const MD_STYLES = `
    .md-prose { line-height: 1.7; color: #d1d1d6; font-size: 13.5px; word-break: break-word; }
    .md-prose p  { margin: 0 0 8px; }
    .md-prose p:last-child { margin-bottom: 0; }
    .md-prose h1,.md-prose h2,.md-prose h3,.md-prose h4 {
        color: #e2e2e8; font-weight: 600; margin: 14px 0 6px;
    }
    .md-prose h1 { font-size: 18px; }
    .md-prose h2 { font-size: 16px; }
    .md-prose h3 { font-size: 14.5px; }
    .md-prose ul,.md-prose ol { margin: 6px 0 8px 18px; padding: 0; }
    .md-prose li { margin-bottom: 4px; }
    .md-prose strong { color: #e2e2e8; font-weight: 600; }
    .md-prose em { color: #b8b4d8; font-style: italic; }
    .md-prose a  { color: #c2652a; text-decoration: underline; }
    .md-prose a:hover { color: #b0a8ff; }
    .md-prose blockquote {
        border-left: 3px solid #733a08;
        margin: 8px 0; padding: 6px 12px;
        color: #9590b8; background: rgba(194,101,42,0.06);
        border-radius: 0 6px 6px 0;
    }
    .md-prose hr { border: none; border-top: 1px solid #2a2a3c; margin: 12px 0; }
    .md-prose table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 12.5px; }
    .md-prose th { background: #1e1e30; color: #c4beff; padding: 6px 10px; text-align: left; border: 1px solid #2d2d45; }
    .md-prose td { padding: 5px 10px; border: 1px solid #2d2d45; color: #b8b4d8; }
    .md-prose tr:nth-child(even) td { background: rgba(194,101,42,0.04); }

    /* Inline code */
    .md-prose code {
        background: #1e1e30;
        border: 1px solid #2d2d45;
        border-radius: 4px;
        padding: 1px 5px;
        font-family: "Fira Code", "Cascadia Code", monospace;
        font-size: 12px;
        color: #b4a0ff;
    }

    /* Code blocks */
    .md-prose pre {
        background: #141420;
        border: 1px solid #2a2a3c;
        border-radius: 8px;
        padding: 12px 14px;
        margin: 10px 0;
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(194,101,42,.3) transparent;
    }
    .md-prose pre code {
        background: none;
        border: none;
        padding: 0;
        font-size: 12px;
        color: #c8c4f0;
        line-height: 1.65;
    }

    @keyframes naina-loading-pulse {
        0%, 100% { opacity: 0.3; transform: scale(0.85); }
        50% { opacity: 1; transform: scale(1); }
    }
    @keyframes naina-shimmer {
        0%   { background-position: -200% 0; }
        100% { background-position:  200% 0; }
    }
    @keyframes msgIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
    }
`;

const ChildChatComponent = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef(null);

    const params = useParams();
    const chatId = params.id;

    const { refreshToken } = useChatRefresh();

    const getMessages = async () => {
        if (!chatId) return;
        setIsLoading(true);
        try {
            const response = await api.get(`/chat/history/${chatId}`);
            setMessages(response.data.messages || []);
        } catch (error) {
            console.error(error);
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getMessages();
    }, [chatId, refreshToken]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);

    /* ── Loading state ── */
    if (isLoading) {
        return (
            <div
                style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", height: "100%", gap: 16,
                    background: "#111317", padding: "40px 24px",
                }}
            >
                <style>{MD_STYLES}</style>
                <div
                    style={{
                        animation: "naina-loading-pulse 1.8s ease-in-out infinite",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >
                    <SortixLogo size={112} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 500, color: "#8a85b0", margin: 0 }}>
                    Loading conversation…
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 340, marginTop: 8 }}>
                    {[100, 75, 90].map((w, i) => (
                        <div key={i} style={{
                            width: `${w}%`, height: 14, borderRadius: 7,
                            background: "linear-gradient(90deg,#1c1c2e 25%,#28283e 50%,#1c1c2e 75%)",
                            backgroundSize: "200% 100%",
                            animation: `naina-shimmer 1.5s ease-in-out infinite`,
                            animationDelay: `${i * 0.15}s`,
                        }} />
                    ))}
                </div>
            </div>
        );
    }

    /* ── Empty / welcome state ── */
    if (messages.length === 0) {
        return (
            <div
                ref={scrollRef}
                style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", height: "100%", gap: 16,
                    background: "#111317", padding: "40px 24px",
                }}
            >
                <style>{MD_STYLES}</style>
                <SortixLogo size={112} />
                <p style={{ fontSize: 20, fontWeight: 600, color: "#e2e2e8", margin: 0 }}>Let&apos;s start!</p>
                <p style={{ fontSize: 13, color: "#6b6885", textAlign: "center", maxWidth: 260, lineHeight: 1.7, margin: 0 }}>
                    Hi! I&apos;m Sortix — your intelligent assistant. Send a message to begin.
                </p>

            </div>
        );
    }

    /* ── Messages ── */
    return (
        <div
            ref={scrollRef}
            style={{
                height: "100%", background: "#111317",
                padding: "20px 20px 10px",
                display: "flex", flexDirection: "column", gap: 16,
                overflowY: "auto",
            }}
        >
            <style>{MD_STYLES}</style>

            {messages.map((msg, idx) => {
                const isUser = msg.role === "user";
                const sources = msg.sources || [];
                return (
                    <div
                        key={idx}
                        style={{
                            display: "flex", alignItems: "flex-end", gap: 8,
                            flexDirection: isUser ? "row-reverse" : "row",
                            animation: "msgIn .3s ease forwards",
                        }}
                    >
                        {/* Avatar */}
                        <div style={{
                            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                            background: isUser
                                ? "#1f2a4a"
                                : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 600,
                            color: isUser ? "#6ea0e8" : "#fff",
                        }}>
                            {isUser ? "U" : (
                                <SortixLogo size={28} />
                            )}
                        </div>

                        {/* Bubble + Sources */}
                        <div style={{ maxWidth: "76%", display: "flex", flexDirection: "column", gap: 6 }}>
                            <div style={{
                                padding: "10px 14px",
                                borderRadius: 14,
                                borderBottomRightRadius: isUser ? 4 : 14,
                                borderBottomLeftRadius: isUser ? 14 : 4,
                                background: isUser ? "#c2652a" : "#1e2024",
                                color: isUser ? "#f0efff" : "#d1d1d6",
                                border: isUser ? "none" : "1px solid #2a2a3c",
                                wordBreak: "break-word",
                            }}>
                                {isUser ? (
                                    /* User messages: plain text */
                                    <span style={{ fontSize: 13.5, lineHeight: 1.6 }}>{msg.content}</span>
                                ) : (
                                    /* AI messages: full markdown rendering */
                                    <div className="md-prose">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>

                            {/* Source citations for assistant messages */}
                            {!isUser && sources.length > 0 && (
                                <div style={{
                                    display: "flex", flexWrap: "wrap", gap: 6,
                                    paddingLeft: 4,
                                }}>
                                    {sources.map((src, sidx) => (
                                        <div
                                            key={sidx}
                                            title={src.text_excerpt || src.source}
                                            style={{
                                                fontSize: 10, color: "#f7a66d",
                                                background: "rgba(194,101,42,.1)",
                                                border: "1px solid rgba(194,101,42,.25)",
                                                borderRadius: 12,
                                                padding: "2px 8px",
                                                cursor: "help",
                                                maxWidth: 180,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            [{src.reference_id}] {src.source}
                                            {src.page ? ` p.${src.page}` : ""}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ChildChatComponent;
