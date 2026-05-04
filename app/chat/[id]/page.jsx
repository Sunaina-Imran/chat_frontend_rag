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

import Message from "@/components/Message";

const ChildChatComponent = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef(null);

    const params = useParams();
    const chatId = params.id;

    const { refreshKey, personaTheme } = useChatRefresh();

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
    }, [chatId, refreshKey]);

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
                    <SortixLogo size={112} color={personaTheme.primary} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 500, color: C.textDim, margin: 0 }}>
                    Loading conversation…
                </p>
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
                <SortixLogo size={112} color={personaTheme.primary} />
                <p style={{ fontSize: 20, fontWeight: 600, color: C.text, margin: 0 }}>Let&apos;s start!</p>
                <p style={{ fontSize: 13, color: C.textMuted, textAlign: "center", maxWidth: 260, lineHeight: 1.7, margin: 0 }}>
                    Hi! I&apos;m Sortix AI — your intelligent assistant. Send a message to begin.
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
                display: "flex", flexDirection: "column", gap: 24,
                overflowY: "auto", fontFamily: "'Sora', sans-serif",
                scrollBehavior: "smooth",
                transition: personaTheme.transition
            }}
        >
            <style>{MD_STYLES}</style>
            <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 pb-10">
                {messages.map((msg, idx) => (
                    <Message key={idx} message={msg} />
                ))}
            </div>
        </div>
    );
};

export default ChildChatComponent;
