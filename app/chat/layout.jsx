"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { ChatRefreshProvider, useChatRefresh } from "./ChatRefreshContext";
import SortixLogo from "./SortixLogo";

const C = {
    bg: "#0e0d0c", bg2: "#141210", sidebar: "#111009",
    surface: "#1a1714", surface2: "#221f1a",
    border: "rgba(255,255,255,0.07)", border2: "rgba(255,255,255,0.12)",
    orange: "#e8734a", orangeGlow: "rgba(232,115,74,0.15)", orangeGlow2: "rgba(232,115,74,0.25)",
    text: "#f0ece6", textMuted: "#8a8070", textDim: "#5a5248",
};

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
    const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

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

    // ── Persona state ──
    const [personas, setPersonas] = useState([]);
    const [selectedPersonaId, setSelectedPersonaId] = useState(null);

    // ── Temp chat state ──
    const [tempChatId, setTempChatId] = useState(null);

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
    const effectiveChatId = chatId || tempChatId;

    // Auth guard
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace("/login");
        } else {
            try {
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
            }
        }
    }, [router]);

    const getAllChats = async () => {
        try {
            const res = await api.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/sessions`);
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
            setTempChatId(crypto.randomUUID());
            setSelectedDocs([]);
            if (pathname !== "/chat") {
                router.push("/chat");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteChat = async (e, sessionId) => {
        e.stopPropagation();
        try {
            await api.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/session/${sessionId}`);
            await getAllChats();
            if (sessionId === chatId) router.push("/chat");
        } catch (err) {
            console.error(err);
        }
    };

    // ── RAG helpers scoped to current chat_id ──
    const fetchDocs = async () => {
        if (!effectiveChatId) return;
        try {
            const [listRes, statsRes] = await Promise.all([
                api.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/documents/list?chat_id=${effectiveChatId}`),
                api.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/documents/stats?chat_id=${effectiveChatId}`),
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
        if (!file || !effectiveChatId) return;
        setIsUploading(true);
        setUploadError("");
        try {
            const form = new FormData();
            form.append("file", file);
            await api.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/documents/upload?chat_id=${effectiveChatId}`, form, {
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
        if (!effectiveChatId) return;
        try {
            await api.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/documents/${docId}?chat_id=${effectiveChatId}`);
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
            const res = await api.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/documents/list`);
            setAllDocsCount(res.data?.length || 0);
        } catch (err) {
            console.error("All docs count error", err);
            setAllDocsCount(0);
        }
    };

    useEffect(() => { getAllChats(); fetchAllDocsCount(); fetchPersonas(); }, []);
    useEffect(() => { if (effectiveChatId) fetchDocs(); }, [effectiveChatId]);

    // Load personas
    const fetchPersonas = async () => {
        try {
            const res = await api.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/personas`);
            setPersonas(res.data || []);
        } catch (err) {
            console.error("Failed to load personas", err);
            setPersonas([]);
        }
    };

    useEffect(() => {
        window.addEventListener('personasUpdated', fetchPersonas);
        return () => window.removeEventListener('personasUpdated', fetchPersonas);
    }, []);

    // Load saved persona_id for current chat session
    useEffect(() => {
        const loadSessionPersona = async () => {
            if (!chatId) {
                setSelectedPersonaId(null);
                return;
            }
            try {
                const res = await api.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/history/${chatId}`);
                setSelectedPersonaId(res.data.persona_id || null);
            } catch (err) {
                console.error("Failed to load session persona", err);
                setSelectedPersonaId(null);
            }
        };
        loadSessionPersona();
    }, [chatId]);

    const { triggerRefresh, setCurrentPersona, personaTheme } = useChatRefresh();

    // Sync current persona to context
    useEffect(() => {
        if (!selectedPersonaId) {
            setCurrentPersona(null);
        } else {
            const persona = personas.find(p => p.persona_id === selectedPersonaId);
            if (persona) {
                setCurrentPersona(persona);
            }
        }
    }, [selectedPersonaId, personas, setCurrentPersona]);

    // Auto-save selected persona to session when it changes
    useEffect(() => {
        const saveSessionPersona = async () => {
            if (!chatId) return;
            try {
                await api.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/session/${chatId}/persona`, {
                    persona_id: selectedPersonaId,
                });
            } catch (err) {
                console.error("Failed to save session persona", err);
            }
        };
        if (chatId && selectedPersonaId !== undefined) {
            const timer = setTimeout(saveSessionPersona, 400);
            return () => clearTimeout(timer);
        }
    }, [selectedPersonaId, chatId]);

    // Generate temp chat ID when at /chat (no real session yet)
    useEffect(() => {
        if (!chatId && !tempChatId) {
            setTempChatId(crypto.randomUUID());
        }
    }, [chatId, tempChatId]);

    // Load saved doc_ids for current chat session
    useEffect(() => {
        const loadSessionDocs = async () => {
            if (!chatId) {
                setSelectedDocs([]);
                return;
            }
            try {
                const res = await api.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/history/${chatId}`);
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
                await api.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/session/${chatId}/docs`, {
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

    const selectedPersona = personas.find(p => p.persona_id === selectedPersonaId);


    const sendMessage = async () => {
        if (!message.trim() || !effectiveChatId || isSending) return;
        setIsSending(true);

        try {
            // If this is a temp chat (not yet persisted), create the session first
            if (!chatId && tempChatId) {
                await api.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/session`, {
                    session_id: tempChatId,
                    title: message.trim().slice(0, 50),
                    persona_id: selectedPersonaId || undefined,
                });
            }

            await api.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/message`, {
                session_id: effectiveChatId,
                message: message,
                doc_ids: selectedDocs.length > 0 ? selectedDocs : undefined,
                persona_id: selectedPersonaId || undefined,
                persona_name: selectedPersona?.persona_name,
                persona_color: selectedPersona?.color
            });

            setMessage("");
            // Reset textarea height if possible
            const ta = document.getElementById("chat-textarea");
            if (ta) { ta.style.height = "auto"; }

            if (!chatId && tempChatId) {
                // First message in temp chat: refresh sidebar and navigate to real session
                await getAllChats();
                router.replace(`/chat/${tempChatId}`);
            } else {
                triggerRefresh();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSending(false);
        }
    };

    const autoGrow = (e) => {
        e.target.style.height = "auto";
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    };

    const spinnerStyle = `
        @keyframes naina-spin { to { transform: rotate(360deg); } }
        @keyframes naina-pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }
        textarea::placeholder { color: #5a5248; }
    `;

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
        txt: { bg: C.surface, text: C.orange, border: C.border2 },
        pdf: { bg: C.surface, text: "#e06c6c", border: C.border2 },
        csv: { bg: C.surface, text: "#6ec1e4", border: C.border2 },
        md: { bg: C.surface, text: "#d4b86a", border: C.border2 },
        box: { bg: C.surface, text: "#9b96cc", border: C.border2 },
    };

    const currentChatTitle = chats.find(c => c.session_id === chatId)?.title || (effectiveChatId ? "New Chat" : "No chat selected");

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
                    width: rightOpen ? 260 : 0, minWidth: rightOpen ? 260 : 0,
                    background: C.sidebar, borderLeft: rightOpen ? `1px solid ${C.border}` : "none",
                    display: "flex", flexDirection: "column", height: isMobile ? "100vh" : "auto",
                    transition: "width 0.3s ease", overflow: "hidden",
                    position: isMobile ? "fixed" : "relative", right: isMobile ? 0 : undefined,
                    zIndex: isMobile ? 50 : undefined,
                }}>
                    <div style={{ width: 260, minWidth: 260, display: "flex", flexDirection: "column", flex: 1 }}>
                        <div style={{ padding: 16, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span onClick={() => setRightOpen(false)} style={{ color: C.textMuted, cursor: "pointer", display: "flex", alignItems: "center" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                                    </svg>
                                </span>
                                <span style={{ fontSize: 14, fontWeight: 600 }}>Knowledge Base</span>
                            </div>
                        </div>

                        <div style={{ margin: 14, background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 12, padding: "16px 20px", textAlign: "center" }}>
                            <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>{docStats?.total_documents ?? docs.length}</div>
                            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.orange, marginTop: 4 }}>Docs</div>
                        </div>

                        {chatId && (
                            <div style={{ padding: "0 14px 6px" }}>
                                <div style={{ fontSize: 10, fontWeight: 600, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.09em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    Attached to "{currentChatTitle}"
                                </div>
                            </div>
                        )}

                        <div style={{ flex: 1, overflowY: "auto", padding: "4px 14px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
                            {!effectiveChatId ? (
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 20, textAlign: "center" }}>
                                    <div style={{ fontSize: 32, color: C.textDim }}>🗒</div>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: C.textMuted }}>Select a chat</div>
                                    <div style={{ fontSize: 12, color: C.textDim }}>to view its documents</div>
                                </div>
                            ) : docs.length === 0 ? (
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 20, textAlign: "center" }}>
                                    <div style={{ fontSize: 32, color: C.textDim }}>🗒</div>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: C.textMuted }}>No documents selected</div>
                                    <div style={{ fontSize: 12, color: C.textDim }}>Upload to start using knowledge</div>
                                </div>
                            ) : docs.map((doc) => {
                                const did = doc.doc_id || doc.id || doc._id;
                                const ext = (doc.file_type || doc.filename?.split(".").pop() || "").toLowerCase();
                                const colors = fileTypeColors[ext] || fileTypeColors.txt;

                                return (
                                    <div key={did} style={{ background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 10, padding: "10px 12px", position: "relative" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                            <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: colors.text, background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 5, padding: "2px 6px", flexShrink: 0 }}>
                                                {ext || "FILE"}
                                            </span>
                                            <span style={{ fontSize: 12.5, fontWeight: 500, color: C.text, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {doc.filename || doc.name || "Untitled"}
                                            </span>
                                            <button onClick={() => handleDeleteDoc(did)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textDim, padding: "2px", borderRadius: 5, flexShrink: 0, fontSize: 13 }}
                                                onMouseEnter={e => { e.currentTarget.style.color = "#c06060"; }}
                                                onMouseLeave={e => { e.currentTarget.style.color = C.textDim; }}
                                            >✕</button>
                                        </div>
                                        <div style={{ fontSize: 10, color: C.textDim, marginBottom: 8 }}>
                                            Added {timeAgo(doc.upload_date)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ padding: "10px 14px 14px", borderTop: `1px solid ${C.border}` }}>
                            <input ref={fileInputRef} type="file" accept=".pdf,.txt,.csv,.md,.docx" onChange={handleDocUpload} style={{ display: "none" }} />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading || !effectiveChatId}
                                style={{
                                    width: "100%", padding: 12, borderRadius: 12,
                                    border: isUploading || !effectiveChatId ? `1px solid ${C.border2}` : `1.5px solid ${personaTheme.primary}`,
                                    background: isUploading || !effectiveChatId ? C.surface : personaTheme.glow,
                                    color: isUploading ? C.textDim : !effectiveChatId ? C.textDim : personaTheme.primary,
                                    fontSize: 13, fontWeight: 600, fontFamily: "'Sora',sans-serif",
                                    cursor: isUploading ? "wait" : !effectiveChatId ? "not-allowed" : "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    transition: personaTheme.transition
                                }}
                                onMouseEnter={e => { if (!isUploading && effectiveChatId) e.currentTarget.style.background = personaTheme.glow; }}
                                onMouseLeave={e => { if (!isUploading && effectiveChatId) e.currentTarget.style.background = personaTheme.glow; }}
                            >
                                {isUploading ? (
                                    <div style={{ width: 14, height: 14, border: `2px solid ${personaTheme.glow}`, borderTopColor: personaTheme.primary, borderRadius: "50%", animation: "naina-spin .6s linear infinite" }} />
                                ) : (
                                    <span>↑ Upload document to this chat</span>
                                )}
                            </button>
                            {uploadError && (
                                <div style={{ fontSize: 10.5, color: "#e06c6c", textAlign: "center", marginTop: 6 }}>{uploadError}</div>
                            )}
                        </div>
                    </div>
                </aside>
                {!rightOpen && !isMobile && (
                    <div onClick={() => setRightOpen(true)} style={{ width: 36, background: C.sidebar, borderLeft: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 16, flexShrink: 0, cursor: "pointer", color: C.textMuted }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </div>
                )}
            </>
        );
    };

    return (
        <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: "'Sora', sans-serif", color: C.text, overflow: "hidden" }}>
            <style>{spinnerStyle}</style>

            {isMobile && leftOpen && (
                <div onClick={() => setLeftOpen(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }} />
            )}
            <aside style={{
                width: 260, minWidth: 260, background: C.sidebar, borderRight: `1px solid ${C.border}`,
                display: "flex", flexDirection: "column", flexShrink: 0, height: "100vh",
                position: isMobile ? "fixed" : "relative", left: isMobile ? (leftOpen ? 0 : -260) : 0, top: 0,
                zIndex: isMobile ? 50 : undefined, transition: isMobile ? "left 0.3s ease" : "none",
            }}>
                <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                    <SortixLogo size={28} />
                    <span style={{ fontSize: 15, fontWeight: 600 }}>Sortix AI</span>
                </div>

                <button onClick={handleNewChat} disabled={isCreating} style={{ margin: 12, padding: "10px 14px", background: personaTheme.primary, border: "none", borderRadius: 12, color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "'Sora',sans-serif", cursor: isCreating ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 8, opacity: isCreating ? 0.8 : 1, transition: personaTheme.transition }}
                    onMouseEnter={e => { if (!isCreating) e.currentTarget.style.opacity = 0.9; }}
                    onMouseLeave={e => { if (!isCreating) e.currentTarget.style.opacity = 1; }}
                >
                    <span>+</span> {isCreating ? "Creating..." : "New chat"}
                    {!isCreating && <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.1)", borderRadius: 4, padding: "2px 5px", fontFamily: "monospace" }}>⌘N</span>}
                </button>

                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textDim, padding: "14px 16px 6px" }}>Recent</div>

                <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
                    {chats.map((chat) => {
                        const sid = chat.session_id;
                        const isActive = sid === chatId;
                        
                        return (
                            <div key={sid} onClick={() => router.push(`/chat/${sid}`)} className="group" style={{ 
                                display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, cursor: "pointer", 
                                background: isActive ? C.surface : "transparent", 
                                border: isActive ? `1px solid ${C.border2}` : "1px solid transparent", 
                                transition: "all .12s" 
                            }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.surface2; }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                            >
                                <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: isActive ? C.orange : C.textDim }} />
                                <span style={{ fontSize: 13, flex: 1, color: isActive ? C.text : C.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {chat.title || "New Chat"}
                                </span>
                                <button onClick={(e) => handleDeleteChat(e, sid)} style={{ background: "none", border: "none", cursor: "pointer", color: "#c06060", fontSize: 11, padding: "2px 5px", borderRadius: 4, flexShrink: 0, opacity: isActive ? 1 : 0.5 }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(200,70,70,.15)")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                >✕</button>
                            </div>
                        );
                    })}
                </div>

                <div style={{ borderTop: `1px solid ${C.border}`, padding: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => router.push('/chat/profile')}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#2d2560,#7c6ef7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#fff", flexShrink: 0 }}>
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Your Account"}</div>
                        <div style={{ fontSize: 11, color: C.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setIsSignOutModalOpen(true); }} title="Sign out" style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", padding: 6, borderRadius: 6, display: "flex", transition: "color 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.color = personaTheme.primary; e.currentTarget.style.background = personaTheme.glow; }}
                        onMouseLeave={e => { e.currentTarget.style.color = C.textDim; e.currentTarget.style.background = "none"; }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </aside>

            <main style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg2, minWidth: 0 }}>
                {pathname !== "/chat/profile" && (
                    <div style={{ 
                        padding: "14px 20px", 
                        borderBottom: `1px solid ${C.border}`, 
                        display: "flex", alignItems: "center", gap: 12, 
                        background: C.bg2,
                        position: "relative"
                    }}>
                        {/* Persona Color Accent Border */}
                        <div style={{ 
                            position: "absolute", bottom: -1, left: 0, right: 0, height: 2, 
                            background: `linear-gradient(90deg, transparent, ${personaTheme.primary}, transparent)`,
                            opacity: selectedPersona ? 1 : 0,
                            transition: personaTheme.transition
                        }} />

                        {isMobile && (
                            <button onClick={() => setLeftOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, padding: 4, display: "flex", alignItems: "center" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                                </svg>
                            </button>
                        )}
                        <SortixLogo size={32} color={personaTheme.primary} />
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>
                                {selectedPersona ? selectedPersona.persona_name : "Sortix AI"}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: personaTheme.primary }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: personaTheme.primary, animation: "naina-pulse 2s infinite" }} />
                                {selectedPersona ? selectedPersona.profession : "Online"}
                            </div>
                        </div>

                        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                            {personas.length > 0 && (
                                <div style={{ position: "relative" }}>
                                    <select 
                                        value={selectedPersonaId || ""} 
                                        onChange={(e) => setSelectedPersonaId(e.target.value || null)}
                                        style={{ 
                                            background: personaTheme.glow, 
                                            border: `1px solid ${personaTheme.border}`, 
                                            borderRadius: 20, padding: "6px 28px 6px 12px", 
                                            color: personaTheme.primary, 
                                            fontSize: 12, fontWeight: 600, fontFamily: "'Sora', sans-serif", 
                                            cursor: "pointer", appearance: "none", outline: "none",
                                            transition: personaTheme.transition
                                        }}
                                    >
                                        <option value="" style={{ background: C.surface, color: C.text }}>Default persona</option>
                                        {personas.map((p) => (
                                            <option key={p.persona_id} value={p.persona_id} style={{ background: C.surface, color: C.text }}>
                                                {p.persona_name}
                                            </option>
                                        ))}
                                    </select>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={personaTheme.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                    {children}
                </div>

                {pathname !== "/chat/profile" && (
                    <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.border}`, background: C.bg2 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.surface, border: `1px solid ${personaTheme.border}`, borderRadius: 16, padding: "6px 10px", transition: personaTheme.transition }}>
                            <button style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", padding: 6, borderRadius: 6, display: "flex", transition: personaTheme.transition }} title="Attach Document"
                                onMouseEnter={e => { e.currentTarget.style.color = personaTheme.primary; e.currentTarget.style.background = personaTheme.glow; }}
                                onMouseLeave={e => { e.currentTarget.style.color = C.textDim; e.currentTarget.style.background = "none"; }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                </svg>
                            </button>
                            <textarea
                                id="chat-textarea"
                                value={message}
                                onChange={e => { setMessage(e.target.value); autoGrow(e); }}
                                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                placeholder="Message Sortix AI..."
                                rows={1}
                                style={{ flex: 1, background: "none", border: "none", outline: "none", color: C.text, fontSize: 14, fontFamily: "'Sora',sans-serif", resize: "none", padding: "8px 4px", minHeight: 36, maxHeight: 120 }}
                            />
                            <button onClick={sendMessage} disabled={isSending}
                                style={{ width: 36, height: 36, borderRadius: 10, background: isSending ? C.surface2 : personaTheme.primary, border: "none", cursor: isSending ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: personaTheme.transition }}
                                onMouseEnter={e => { if (!isSending) { e.currentTarget.style.opacity = 0.9; e.currentTarget.style.boxShadow = `0 2px 12px ${personaTheme.glow}`; } }}
                                onMouseLeave={e => { if (!isSending) { e.currentTarget.style.opacity = 1; e.currentTarget.style.boxShadow = "none"; } }}
                                onMouseDown={e => { if (!isSending) e.currentTarget.style.transform = "scale(0.9)"; }}
                                onMouseUp={e => { if (!isSending) e.currentTarget.style.transform = "scale(1)"; }}
                            >
                                {isSending ? (
                                    <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.25)", borderTopColor: "#fff", borderRadius: "50%", animation: "naina-spin .6s linear infinite" }} />
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                                        <path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* ── Right Sidebar: Knowledge Base ── */}
            {pathname !== "/chat/profile" && <RightPanel />}

            {/* Sign Out Modal */}
            {isSignOutModalOpen && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}>
                    <div style={{ background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 24, width: "100%", maxWidth: 360, padding: 32, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
                        <div style={{ fontSize: 32, marginBottom: 16 }}>👋</div>
                        <h3 style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: "0 0 12px 0", fontFamily: "'Sora', sans-serif" }}>Sign out?</h3>
                        <p style={{ fontSize: 15, color: C.textMuted, margin: "0 0 32px 0", lineHeight: 1.5, fontFamily: "'Sora', sans-serif" }}>
                            You'll need to sign back in to continue chatting.
                        </p>
                        <div style={{ display: "flex", gap: 16, width: "100%" }}>
                            <button
                                onClick={() => setIsSignOutModalOpen(false)}
                                style={{ flex: 1, background: "transparent", color: "#fff", border: `2px solid ${C.border2}`, borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, fontFamily: "'Sora', sans-serif", cursor: "pointer", transition: "all .2s" }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = C.textDim; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border2; }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { setIsSignOutModalOpen(false); localStorage.removeItem("token"); localStorage.removeItem("user"); router.replace("/login"); }}
                                style={{ flex: 1, background: "#d34538", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, fontFamily: "'Sora', sans-serif", cursor: "pointer", transition: "all .2s" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#e65547"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "#d34538"; }}
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}