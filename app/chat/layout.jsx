"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ChatRefreshProvider, useChatRefresh } from "./ChatRefreshContext";
import FunnelSparkLogo from "./FunnelSparkLogo";

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

    // ── RAG state ──
    const [docs, setDocs] = useState([]);
    const [docStats, setDocStats] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [rightOpen, setRightOpen] = useState(true);
    const [allDocsCount, setAllDocsCount] = useState(0);
    const fileInputRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
    const [leftOpen, setLeftOpen] = useState(false);
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setRightOpen(!mobile);
        }
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const router = useRouter();
    const pathname = usePathname();
    const chatId = pathname.split("/")[2];

    const getAllChats = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/sessions`);
            setChats(res.data || []);
        } catch (err) {
            console.error(err);
            setChats([]);
        }
    };

    const handleNewChat = async () => {
        if (isCreating) return;
        setIsCreating(true);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/session`);
            await getAllChats();
            router.push(`/chat/${res.data.session_id}`);
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteChat = async (e, sessionId) => {
        e.stopPropagation();
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/session/${sessionId}`);
            await getAllChats();
            if (sessionId === chatId) router.push("/chat");
        } catch (err) {
            console.error(err);
        }
    };

    // ── RAG helpers scoped to current chat_id ──
    const fetchDocs = async () => {
        if (!chatId) return;
        try {
            const [listRes, statsRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/documents/list?chat_id=${chatId}`),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/documents/stats?chat_id=${chatId}`),
            ]);
            setDocs(listRes.data || []);
            setDocStats(statsRes.data);
        } catch (err) {
            console.error("RAG fetch error", err);
            setDocs([]);
            setDocStats(null);
        }
    };

    const handleDocUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !chatId) return;
        setIsUploading(true);
        setUploadError("");
        try {
            const form = new FormData();
            form.append("file", file);
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/documents/upload?chat_id=${chatId}`, form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            await Promise.all([fetchDocs(), fetchAllDocsCount()]);
        } catch (err) {
            setUploadError(err?.response?.data?.detail || "Upload failed");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeleteDoc = async (docId) => {
        if (!chatId) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/documents/${docId}?chat_id=${chatId}`);
            await Promise.all([fetchDocs(), fetchAllDocsCount()]);
        } catch (err) {
            if (err.response?.status === 404) {
                // Already deleted — just refresh the list
                await Promise.all([fetchDocs(), fetchAllDocsCount()]);
            } else {
                console.error("Delete doc error", err);
            }
        }
    };

    const fetchAllDocsCount = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/documents/list`);
            setAllDocsCount(res.data?.length || 0);
        } catch (err) {
            console.error("All docs count error", err);
            setAllDocsCount(0);
        }
    };

    useEffect(() => { getAllChats(); fetchAllDocsCount(); }, []);
    useEffect(() => { if (chatId) fetchDocs(); }, [chatId]);

    // Load saved doc_ids for current chat session
    useEffect(() => {
        const loadSessionDocs = async () => {
            if (!chatId) {
                setSelectedDocs([]);
                return;
            }
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/history/${chatId}`);
                setSelectedDocs(res.data.doc_ids || []);
            } catch (err) {
                console.error("Failed to load session doc_ids", err);
                setSelectedDocs([]);
            }
        };
        loadSessionDocs();
    }, [chatId]);

    // Auto-save selected docs to session when they change
    useEffect(() => {
        const saveSessionDocs = async () => {
            if (!chatId) return;
            try {
                await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/session/${chatId}/docs`, {
                    doc_ids: selectedDocs,
                });
            } catch (err) {
                console.error("Failed to save session doc_ids", err);
            }
        };
        // Only save if we have a chatId
        if (chatId && selectedDocs !== undefined) {
            const timer = setTimeout(saveSessionDocs, 400);
            return () => clearTimeout(timer);
        }
    }, [selectedDocs, chatId]);

    const { triggerRefresh } = useChatRefresh();

    const sendMessage = async () => {
        if (!message.trim() || !chatId || isSending) return;
        setIsSending(true);

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/message`, {
                session_id: chatId,
                message: message,
                doc_ids: selectedDocs.length > 0 ? selectedDocs : undefined
            });

            setMessage("");
            triggerRefresh();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSending(false);
        }
    };


    /* Spinner keyframes injected once */
    const spinnerStyle = `
        @keyframes naina-spin { to { transform: rotate(360deg); } }
        @keyframes naina-pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes naina-dot-bounce {
            0%,80%,100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
        @keyframes rag-slide-in {
            from { opacity: 0; transform: translateY(-6px); }
            to   { opacity: 1; transform: translateY(0); }
        }
    `;

    // ── file-type icon helper ──
    const FileIcon = ({ name }) => {
        const ext = name?.split(".").pop()?.toLowerCase();
        const color = ext === "pdf" ? "#e06c6c" : ext === "txt" ? "#7ecfb3" : ext === "csv" ? "#6ec1e4" : "#9b96cc";
        return (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
            </svg>
        );
    };

    // ── relative time helper ──
    const timeAgo = (isoString) => {
        if (!isoString) return "recently";
        const date = new Date(isoString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        if (seconds < 60) return "just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}d ago`;
        const months = Math.floor(days / 30);
        return `${months}mo ago`;
    };

    // ── file type badge color ──
    const fileTypeColors = {
        txt: { bg: "#1a2e28", text: "#7ecfb3", border: "#2a4a40" },
        pdf: { bg: "#2e1a1a", text: "#e06c6c", border: "#4a2a2a" },
        csv: { bg: "#1a252e", text: "#6ec1e4", border: "#2a3f4a" },
        md: { bg: "#2e2a1a", text: "#d4b86a", border: "#4a422a" },
        docx: { bg: "#1a1a2e", text: "#9b96cc", border: "#2a2a4a" },
    };

    const currentChatTitle = chats.find(c => c.session_id === chatId)?.title || (chatId ? "New Chat" : "No chat selected");

    // ── Funnel + Spark logo — imported from FunnelSparkLogo.jsx ──

    const RightPanel = () => {

        return (
            <>
                {isMobile && rightOpen && (
                    <div onClick={() => setRightOpen(false)} style={{
                        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(0,0,0,0.5)", zIndex: 40
                    }} />
                )}
                <aside style={{
                    width: rightOpen ? 310 : 0,
                    background: "#13131a",
                    borderLeft: rightOpen ? "1px solid #1e1e2a" : "none",
                    display: "flex",
                    flexDirection: "column",
                    flexShrink: 0,
                    transition: "width 0.3s ease",
                    overflow: "hidden",
                    position: isMobile ? "fixed" : "relative",
                    right: isMobile ? 0 : undefined,
                    top: isMobile ? 0 : undefined,
                    height: isMobile ? "100vh" : undefined,
                    zIndex: isMobile ? 50 : undefined,
                }}>
                    <div style={{ width: 310, minWidth: 310, display: "flex", flexDirection: "column", flex: 1 }}>
                        {/* ── Header ── */}
                        <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid #1a1a26" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div onClick={() => setRightOpen(false)} style={{ cursor: "pointer" }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7a76a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                                        </svg>
                                    </div>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: "#c4beff" }}>Knowledge Base</span>
                                </div>
                        {chatId && (
                            <span style={{
                                fontSize: 10, fontWeight: 500, color: "#4ec87a",
                                background: "rgba(78,200,122,.12)", border: "1px solid rgba(78,200,122,.25)",
                                borderRadius: 12, padding: "3px 10px", display: "flex", alignItems: "center", gap: 5,
                            }}>
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ec87a" }} />
                                Linked to current chat
                            </span>
                        )}
                    </div>

                    {/* Active chat info bar */}
                    {chatId && (
                        <div style={{
                            background: "rgba(108,95,232,.08)", border: "1px solid rgba(108,95,232,.2)",
                            borderRadius: 8, padding: "8px 12px", marginBottom: 10,
                            display: "flex", alignItems: "center", gap: 8,
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9b8ef5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 9, color: "#6c5fe8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                                    Documents linked to
                                </div>
                                <div style={{ fontSize: 12, color: "#c4beff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>
                                    {currentChatTitle}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats card — Docs only, full width */}
                    <div style={{ display: "flex", marginBottom: 12 }}>
                        <div style={{
                            flex: 1, background: "#0f0f1a",
                            border: "1px solid #2a2760",
                            borderRadius: 12, padding: "16px 12px",
                            textAlign: "center",
                            boxShadow: "0 0 0 1px rgba(108,95,232,.12) inset",
                        }}>
                            <div style={{ fontSize: 32, fontWeight: 800, color: "#c4beff", lineHeight: 1 }}>
                                {docStats?.total_documents ?? docs.length}
                            </div>
                            <div style={{ fontSize: 11, color: "#6c5fe8", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 6, fontWeight: 600 }}>Docs</div>
                        </div>
                    </div>

                    {/* All documents library */}
                    <button
                        style={{
                            display: "flex", alignItems: "center", gap: 8,
                            width: "100%", padding: "8px 10px",
                            background: "transparent", border: "1px solid #1e1e30", borderRadius: 8,
                            cursor: "pointer", transition: "all .15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#161626"; e.currentTarget.style.borderColor = "#2a2a48"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#1e1e30"; }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7a76a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                        <span style={{ fontSize: 12, color: "#8a87ae", flex: 1, textAlign: "left" }}>All documents library</span>
                        <span style={{ fontSize: 10, color: "#6c5fe8", background: "rgba(108,95,232,.12)", borderRadius: 8, padding: "2px 7px", fontWeight: 600 }}>
                            {allDocsCount}
                        </span>
                    </button>
                </div>

                {/* ── Section header ── */}
                {chatId && (
                    <div style={{ padding: "10px 14px 6px" }}>
                        <div style={{ fontSize: 9, fontWeight: 600, color: "#5a5680", textTransform: "uppercase", letterSpacing: "0.09em" }}>
                            Attached to "{currentChatTitle}"
                        </div>
                    </div>
                )}

                {/* ── Document list ── */}
                <div style={{ flex: 1, overflowY: "auto", padding: "4px 12px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
                    {!chatId ? (
                        <div style={{ fontSize: 12, color: "#3e3a5c", textAlign: "center", padding: "40px 10px" }}>
                            <div style={{ marginBottom: 10, opacity: 0.4 }}>
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3e3a5c" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}>
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                            </div>
                            Select a chat to view its documents
                        </div>
                    ) : docs.length === 0 ? (
                        <div style={{ fontSize: 12, color: "#3e3a5c", textAlign: "center", padding: "40px 10px" }}>
                            <div style={{ marginBottom: 10, opacity: 0.4 }}>
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3e3a5c" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}>
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                            </div>
                            No documents selected for this chat
                            <div style={{ fontSize: 10, color: "#4a4570", marginTop: 4 }}>Upload to start using knowledge</div>
                        </div>
                    ) : docs.map((doc) => {
                        const did = doc.doc_id || doc.id || doc._id;
                        const ext = (doc.file_type || doc.filename?.split(".").pop() || "").toLowerCase();
                        const colors = fileTypeColors[ext] || fileTypeColors.txt;

                        return (
                            <div
                                key={did}
                                style={{
                                    background: "#0f0f1a",
                                    border: "1px solid #1a1a2a",
                                    borderRadius: 10,
                                    padding: "10px 12px",
                                    transition: "all .15s",
                                    position: "relative",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "#2a2848"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a2a"; }}
                            >
                                {/* Top row: badge + name + remove */}
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                    <span style={{
                                        fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                                        color: colors.text, background: colors.bg, border: `1px solid ${colors.border}`,
                                        borderRadius: 5, padding: "2px 6px", flexShrink: 0,
                                    }}>
                                        {ext || "FILE"}
                                    </span>
                                    <span style={{ fontSize: 12.5, fontWeight: 500, color: "#dbd8ff", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {doc.filename || doc.name || "Untitled"}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteDoc(did)}
                                        style={{ background: "none", border: "none", cursor: "pointer", color: "#5a4060", padding: "2px 5px", borderRadius: 5, flexShrink: 0, fontSize: 13 }}
                                        onMouseEnter={e => { e.currentTarget.style.color = "#c06060"; e.currentTarget.style.background = "rgba(200,70,70,.12)"; }}
                                        onMouseLeave={e => { e.currentTarget.style.color = "#5a4060"; e.currentTarget.style.background = "none"; }}
                                    >✕</button>
                                </div>

                                {/* Added time */}
                                <div style={{ fontSize: 10, color: "#4a4570", marginBottom: 8 }}>
                                    Added {timeAgo(doc.upload_date)}
                                </div>


                                {/* Linked to */}
                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "#4a4570" }}>
                                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ec87a" }} />
                                    <span>Linked to:</span>
                                    <span style={{ color: "#7a76a0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
                                        {currentChatTitle}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Upload button at bottom ── */}
                <div style={{ padding: "10px 12px 12px", borderTop: "1px solid #1a1a26" }}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.txt,.csv,.md,.docx"
                        onChange={handleDocUpload}
                        style={{ display: "none" }}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || !chatId}
                        style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            width: "100%", padding: "10px 12px",
                            background: isUploading || !chatId ? "#1a1830" : "rgba(108,95,232,.1)",
                            border: "1px dashed " + (isUploading || !chatId ? "#3a3565" : "#5a4db0"),
                            borderRadius: 10, cursor: isUploading ? "wait" : !chatId ? "not-allowed" : "pointer",
                            transition: "all .15s",
                        }}
                        onMouseEnter={e => { if (!isUploading && chatId) { e.currentTarget.style.background = "rgba(108,95,232,.18)"; e.currentTarget.style.borderColor = "#7c6ef7"; } }}
                        onMouseLeave={e => { if (!isUploading && chatId) { e.currentTarget.style.background = "rgba(108,95,232,.1)"; e.currentTarget.style.borderColor = "#5a4db0"; } }}
                    >
                        {isUploading ? (
                            <div style={{ width: 14, height: 14, border: "2px solid rgba(108,95,232,.3)", borderTopColor: "#9b8ef5", borderRadius: "50%", animation: "naina-spin .6s linear infinite" }} />
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={chatId ? "#9b8ef5" : "#4a4570"} strokeWidth="2.5" strokeLinecap="round">
                                <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
                                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                            </svg>
                        )}
                        <span style={{ fontSize: 12, fontWeight: 500, color: isUploading ? "#5a5680" : chatId ? "#9b8ef5" : "#4a4570" }}>
                            {isUploading ? "Uploading…" : chatId ? "Upload document to this chat" : "Select a chat to upload"}
                        </span>
                    </button>

                    {uploadError && (
                        <div style={{ fontSize: 10.5, color: "#e06c6c", background: "rgba(224,108,108,.08)", border: "1px solid rgba(224,108,108,.2)", borderRadius: 6, padding: "5px 8px", marginTop: 6 }}>
                            {uploadError}
                        </div>
                    )}
                </div>
                    </div>
                </aside>
                {!rightOpen && !isMobile && (
                    <div 
                        onClick={() => setRightOpen(true)}
                        style={{
                            width: 36,
                            background: "#13131a",
                            borderLeft: "1px solid #1e1e2a",
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            paddingTop: 14,
                            flexShrink: 0,
                            cursor: "pointer",
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7a76a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </div>
                )}
            </>
        );
    };

    return (
        <div style={{ display: "flex", height: "100vh", background: "#0d0d11", fontFamily: "system-ui,sans-serif" }}>
            <style>{spinnerStyle}</style>

            {/* ── Left Sidebar ── */}
            {isMobile && leftOpen && (
                <div onClick={() => setLeftOpen(false)} style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.5)", zIndex: 40
                }} />
            )}
            <aside style={{
                width: 268,
                background: "#13131a",
                borderRight: "1px solid #1e1e2a",
                display: "flex",
                flexDirection: "column",
                flexShrink: 0,
                position: isMobile ? "fixed" : "relative",
                left: isMobile ? (leftOpen ? 0 : -268) : 0,
                top: 0,
                height: "100vh",
                zIndex: isMobile ? 50 : undefined,
                transition: isMobile ? "left 0.3s ease" : "none",
            }}>

                <div style={{ padding: "16px 14px 12px" }}>
                    {/* Brand */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        {/* ── Logo: Funnel + Spark ── */}
                        <FunnelSparkLogo size={34} />
                        <span style={{ fontSize: 15, fontWeight: 600, color: "#eae8ff", letterSpacing: "0.01em", flex: 1 }}>Sortix</span>
                    </div>

                    {/* NEW CHAT BUTTON */}
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
                        const sid = chat.session_id;
                        const isActive = sid === chatId;
                        return (
                            <div
                                key={sid}
                                onClick={() => router.push(`/chat/${sid}`)}
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
                                    {chat.title || "New Chat"}
                                </span>
                                <button
                                    onClick={(e) => handleDeleteChat(e, sid)}
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
                    {isMobile && (
                        <button onClick={() => setLeftOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#c4beff", padding: 4, display: "flex", alignItems: "center" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                    )}
                    {/* ── Logo: Funnel + Spark ── */}
                    <FunnelSparkLogo size={36} />
                    <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#eae8ff", margin: 0 }}>Sortix </p>
                        <p style={{ fontSize: 11, color: "#4ec87a", margin: 0, display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ec87a", display: "inline-block" }} />
                            Online
                        </p>
                    </div>

                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                        {/* RAG indicator in header */}
                        {docs.length > 0 && chatId && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(108,95,232,.1)", border: "1px solid rgba(108,95,232,.25)", borderRadius: 20, padding: "4px 10px" }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9b8ef5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3zM14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3z" />
                                </svg>
                                <span style={{ fontSize: 10.5, color: "#9b8ef5", fontWeight: 500 }}>
                                    {selectedDocs.length > 0 ? `${selectedDocs.length} selected` : `${docs.length} doc${docs.length !== 1 ? "s" : ""}`}
                                </span>
                            </div>
                        )}
                        {isMobile && (
                            <button onClick={() => setRightOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#c4beff", padding: 4, display: "flex", alignItems: "center" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                </svg>
                            </button>
                        )}
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
                            placeholder="Message Sortix…"
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

            {/* ── Right Sidebar: Knowledge Base ── */}
            <RightPanel />
        </div>
    );
}