"use client";

import React, { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChatRefresh } from "../ChatRefreshContext";
import SortixLogo from "../SortixLogo";

const C = {
  bg: "#0e0d0c", bg2: "#141210", sidebar: "#111009",
  surface: "#1a1714", surface2: "#221f1a",
  border: "rgba(255,255,255,0.07)", border2: "rgba(255,255,255,0.12)",
  orange: "#e8734a", orangeGlow: "rgba(232,115,74,0.15)", orangeGlow2: "rgba(232,115,74,0.25)",
  text: "#f0ece6", textMuted: "#8a8070", textDim: "#5a5248",
};

/* ─── Markdown prose styles injected once ─── */
const MD_STYLES = `
    .md-prose { line-height: 1.7; color: ${C.text}; font-size: 14px; word-break: break-word; font-family: 'Sora', sans-serif; }
    .md-prose p  { margin: 0 0 8px; }
    .md-prose p:last-child { margin-bottom: 0; }
    .md-prose h1,.md-prose h2,.md-prose h3,.md-prose h4 {
        color: #fff; font-weight: 600; margin: 14px 0 6px;
    }
    .md-prose h1 { font-size: 18px; }
    .md-prose h2 { font-size: 16px; }
    .md-prose h3 { font-size: 14.5px; }
    .md-prose ul,.md-prose ol { margin: 6px 0 8px 18px; padding: 0; }
    .md-prose li { margin-bottom: 4px; }
    .md-prose strong { color: #fff; font-weight: 600; }
    .md-prose em { color: #f0ece6; font-style: italic; opacity: 0.8; }
    .md-prose a  { color: ${C.orange}; text-decoration: underline; }
    .md-prose a:hover { color: #f07d55; }
    .md-prose blockquote {
        border-left: 3px solid ${C.orange};
        margin: 8px 0; padding: 6px 12px;
        color: ${C.textMuted}; background: ${C.orangeGlow};
        border-radius: 0 6px 6px 0;
    }
    .md-prose hr { border: none; border-top: 1px solid ${C.border2}; margin: 12px 0; }
    .md-prose table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 12.5px; }
    .md-prose th { background: ${C.surface2}; color: #fff; padding: 6px 10px; text-align: left; border: 1px solid ${C.border2}; }
    .md-prose td { padding: 5px 10px; border: 1px solid ${C.border2}; color: ${C.text}; }
    .md-prose tr:nth-child(even) td { background: ${C.surface}; }

    /* Inline code */
    .md-prose code {
        background: ${C.surface2};
        border: 1px solid ${C.border2};
        border-radius: 4px;
        padding: 1px 5px;
        font-family: "Fira Code", "Cascadia Code", monospace;
        font-size: 12px;
        color: ${C.orange};
    }

    /* Code blocks */
    .md-prose pre {
        background: ${C.sidebar};
        border: 1px solid ${C.border2};
        border-radius: 8px;
        padding: 12px 14px;
        margin: 10px 0;
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: ${C.orangeGlow} transparent;
    }
    .md-prose pre code {
        background: none;
        border: none;
        padding: 0;
        font-size: 12px;
        color: ${C.text};
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
        from { opacity: 0; transform: translateY(14px); }
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
                    background: C.bg2, padding: "40px 24px", fontFamily: "'Sora', sans-serif"
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
                <p style={{ fontSize: 15, fontWeight: 500, color: C.textDim, margin: 0 }}>
                    Loading conversation…
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 340, marginTop: 8 }}>
                    {[100, 75, 90].map((w, i) => (
                        <div key={i} style={{
                            width: `${w}%`, height: 14, borderRadius: 7,
                            background: `linear-gradient(90deg,${C.surface} 25%,${C.surface2} 50%,${C.surface} 75%)`,
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
                    background: C.bg2, padding: "40px 24px", fontFamily: "'Sora', sans-serif"
                }}
            >
                <style>{MD_STYLES}</style>
                <SortixLogo size={112} />
                <p style={{ fontSize: 20, fontWeight: 600, color: C.text, margin: 0 }}>Let's start!</p>
                <p style={{ fontSize: 13, color: C.textMuted, textAlign: "center", maxWidth: 260, lineHeight: 1.7, margin: 0 }}>
                    Hi! I'm Sortix — your intelligent assistant. Send a message to begin.
                </p>

            </div>
        );
    }

    /* ── Messages ── */
    return (
        <div
            ref={scrollRef}
            style={{
                height: "100%", background: C.bg2,
                padding: "24px 20px 10px",
                display: "flex", flexDirection: "column", gap: 20,
                overflowY: "auto", fontFamily: "'Sora', sans-serif",
                scrollBehavior: "smooth"
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
                            display: "flex", alignItems: "flex-end", gap: 10,
                            flexDirection: isUser ? "row-reverse" : "row",
                            animation: "msgIn .3s ease forwards",
                        }}
                    >
                        {/* Avatar */}
                        <div style={{
                            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                            background: isUser ? "linear-gradient(135deg,#8a1f0e,#e8734a)" : "transparent",
                            color: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 600,
                        }}>
                            {isUser ? "U" : (
                                <SortixLogo size={32} />
                            )}
                        </div>

                        {/* Bubble + Sources */}
                        <div style={{ maxWidth: "76%", display: "flex", flexDirection: "column", gap: 6, alignItems: isUser ? "flex-end" : "flex-start" }}>
                            <div style={{
                                padding: "12px 16px",
                                borderRadius: 12,
                                borderBottomRightRadius: isUser ? 4 : 12,
                                borderBottomLeftRadius: isUser ? 12 : 4,
                                background: isUser ? C.orange : C.surface,
                                color: isUser ? "#fff" : C.text,
                                border: isUser ? "none" : `1px solid ${C.border2}`,
                                wordBreak: "break-word",
                            }}>
                                {isUser ? (
                                    /* User messages: plain text */
                                    <span style={{ fontSize: 14, lineHeight: 1.6 }}>{msg.content}</span>
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
                                    paddingLeft: 4, marginTop: 4,
                                }}>
                                    {sources.map((src, sidx) => (
                                        <div
                                            key={sidx}
                                            title={src.text_excerpt || src.source}
                                            style={{
                                                fontSize: 10, color: C.orange,
                                                background: C.orangeGlow,
                                                border: `1px solid ${C.orangeGlow2}`,
                                                borderRadius: 12,
                                                padding: "3px 8px",
                                                cursor: "help",
                                                maxWidth: 200,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                fontFamily: "monospace"
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
