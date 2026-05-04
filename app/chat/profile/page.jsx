"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const C = {
  bg: "#0e0d0c", bg2: "#141210", sidebar: "#111009",
  surface: "#1a1714", surface2: "#221f1a",
  border: "rgba(255,255,255,0.07)", border2: "rgba(255,255,255,0.12)",
  orange: "#e8734a", orangeGlow: "rgba(232,115,74,0.15)", orangeGlow2: "rgba(232,115,74,0.25)",
  text: "#f0ece6", textMuted: "#8a8070", textDim: "#5a5248",
};

const inputStyle = {
    width: "100%",
    background: C.surface2,
    border: `1px solid ${C.border2}`,
    borderRadius: 8,
    padding: "12px 16px",
    color: C.text,
    fontSize: 14,
    fontFamily: "'Sora', sans-serif",
    outline: "none",
    transition: "border-color 0.2s",
};

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("profile");
    
    // Personas state
    const [personas, setPersonas] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const initialFormState = {
        persona_name: "",
        profession: "",
        purpose: "",
        domain: "",
        knowledge_level: "intermediate",
        preferred_language: "English",
        tone: "professional",
        answer_style: "concise",
        output_format: "text",
        citation_preference: "none",
        document_behavior: "standard",
        restrictions: "",
        color: "#F97316"
    };

    const [formData, setFormData] = useState(initialFormState);

    const fetchPersonas = async () => {
        try {
            const res = await api.get(`/personas`);
            setPersonas(res.data || []);
        } catch (err) {
            console.error("Failed to load personas", err);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try { setUser(JSON.parse(storedUser)); } catch (e) { }
        }
        fetchPersonas();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openModal = (persona = null) => {
        if (persona) {
            setFormData(persona);
            setEditingId(persona.persona_id);
        } else {
            setFormData(initialFormState);
            setEditingId(null);
        }
        setSuccessMessage("");
        setErrorMessage("");
        setIsModalOpen(true);
    };

    const handleSavePersona = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setErrorMessage("");

        try {
            if (editingId) {
                const res = await api.put(`/personas/${editingId}`, formData);
                setPersonas(prev => prev.map(p => p.persona_id === editingId ? res.data : p));
                setSuccessMessage("Persona updated successfully!");
            } else {
                const res = await api.post(`/personas`, formData);
                setPersonas(prev => [res.data, ...prev]);
                setSuccessMessage("Persona created successfully!");
            }
            window.dispatchEvent(new Event('personasUpdated'));
            setTimeout(() => {
                setIsModalOpen(false);
                setSuccessMessage("");
            }, 1000);
        } catch (err) {
            console.error(err);
            setErrorMessage(err.response?.data?.detail || "Failed to save persona");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePersona = async (personaId) => {
        if (!window.confirm("Are you sure you want to delete this persona?")) return;
        
        // Optimistic delete
        setPersonas(prev => prev.filter(p => p.persona_id !== personaId));
        
        try {
            await api.delete(`/personas/${personaId}`);
            window.dispatchEvent(new Event('personasUpdated'));
        } catch (err) {
            console.error("Failed to delete persona", err);
            // Rollback on failure
            fetchPersonas();
        }
    };

    return (
        <div style={{ padding: "40px 60px", maxWidth: 900, margin: "0 auto", color: C.text, fontFamily: "'Sora', sans-serif" }}>
            <button 
                onClick={() => router.push('/chat')}
                style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 30, fontSize: 13, fontWeight: 600, fontFamily: "'Sora', sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.color = C.orange}
                onMouseLeave={e => e.currentTarget.style.color = C.textMuted}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                </svg>
                Back to Chat
            </button>

            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: "#fff" }}>Profile & Settings</h1>
            <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 30 }}>Manage your personal information and custom personas.</p>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 20, marginBottom: 30, borderBottom: `2px solid ${C.border}` }}>
                <button 
                    onClick={() => setActiveTab('profile')}
                    style={{ padding: "10px 16px", background: "none", border: "none", color: activeTab === 'profile' ? C.orange : C.textMuted, borderBottom: activeTab === 'profile' ? `3px solid ${C.orange}` : "3px solid transparent", cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "'Sora', sans-serif", transition: "all 0.2s", marginBottom: "-2px" }}
                    onMouseEnter={e => { if (activeTab !== 'profile') e.currentTarget.style.color = C.text; }}
                    onMouseLeave={e => { if (activeTab !== 'profile') e.currentTarget.style.color = C.textMuted; }}
                >
                    Profile
                </button>
                <button 
                    onClick={() => setActiveTab('personas')}
                    style={{ padding: "10px 16px", background: "none", border: "none", color: activeTab === 'personas' ? C.orange : C.textMuted, borderBottom: activeTab === 'personas' ? `3px solid ${C.orange}` : "3px solid transparent", cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "'Sora', sans-serif", transition: "all 0.2s", marginBottom: "-2px" }}
                    onMouseEnter={e => { if (activeTab !== 'personas') e.currentTarget.style.color = C.text; }}
                    onMouseLeave={e => { if (activeTab !== 'personas') e.currentTarget.style.color = C.textMuted; }}
                >
                    Personas
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'profile' && (
                <div style={{ background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 16, padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#2d2560,#7c6ef7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: "#fff", flexShrink: 0, border: `2px solid ${C.surface2}`, boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
                            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: "#fff" }}>{user?.name || "Your Account"}</h2>
                            <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 12 }}>{user?.email}</p>
                            <span style={{ background: C.orangeGlow, color: C.orange, border: `1px solid ${C.orangeGlow2}`, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                Active User
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'personas' && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <div>
                            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: "#fff" }}>Custom Personas</h2>
                            <p style={{ color: C.textMuted, fontSize: 14 }}>Manage AI personalities for your chats.</p>
                        </div>
                        <button 
                            onClick={() => openModal()}
                            style={{ background: C.orange, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, fontFamily: "'Sora', sans-serif", cursor: "pointer", transition: "all .2s", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 14px rgba(232,115,74,0.3)" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#f07d55"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = C.orange; e.currentTarget.style.transform = "none"; }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add Persona
                        </button>
                    </div>

                    <div style={{ background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 16, overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead style={{ background: C.surface2, borderBottom: `1px solid ${C.border2}` }}>
                                <tr>
                                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Theme</th>
                                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Name</th>
                                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Profession</th>
                                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Domain</th>
                                    <th style={{ padding: "12px 20px", textAlign: "right", fontSize: 12, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {personas.map(p => (
                                    <tr key={p.persona_id} style={{ borderBottom: `1px solid ${C.border}`, transition: "background .15s" }} onMouseEnter={e => e.currentTarget.style.background = C.surface2} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                        <td style={{ padding: "16px 20px" }}>
                                            <div style={{ width: 14, height: 14, borderRadius: "50%", background: p.color || C.orange, boxShadow: `0 0 10px ${p.color || C.orange}40` }} />
                                        </td>
                                        <td style={{ padding: "16px 20px", fontSize: 14, color: C.text, fontWeight: 600 }}>{p.persona_name}</td>
                                        <td style={{ padding: "16px 20px", fontSize: 14, color: C.textMuted }}>{p.profession}</td>
                                        <td style={{ padding: "16px 20px", fontSize: 14, color: C.textDim }}>{p.domain || "-"}</td>
                                        <td style={{ padding: "16px 20px", textAlign: "right", gap: 12 }}>
                                            <button onClick={() => openModal(p)} style={{ background: "none", border: "none", color: "#4ec87a", cursor: "pointer", fontSize: 13, fontWeight: 600, marginRight: 12, fontFamily: "'Sora', sans-serif" }} onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"} onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>Edit</button>
                                            <button onClick={() => handleDeletePersona(p.persona_id)} style={{ background: "none", border: "none", color: "#e06c6c", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Sora', sans-serif" }} onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"} onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                                {personas.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ padding: "40px", textAlign: "center", color: C.textDim, fontSize: 14, fontWeight: 500 }}>
                                            No personas created yet. Click "Add Persona" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}>
                    <div style={{ background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 20, width: "100%", maxWidth: 650, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
                        <div style={{ padding: "20px 30px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>{editingId ? "Edit Persona" : "Create New Persona"}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: C.surface2, border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = C.orangeGlow; }} onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; e.currentTarget.style.background = C.surface2; }}>✕</button>
                        </div>
                        
                        <div style={{ padding: "30px", overflowY: "auto", flex: 1 }}>
                            <form onSubmit={handleSavePersona} id="personaForm">
                                {successMessage && (
                                    <div style={{ background: "rgba(78,200,122,.12)", border: "1px solid rgba(78,200,122,.25)", color: "#4ec87a", padding: "14px 18px", borderRadius: 10, marginBottom: 24, fontSize: 14, fontWeight: 600 }}>
                                        {successMessage}
                                    </div>
                                )}
                                {errorMessage && (
                                    <div style={{ background: "rgba(224,108,108,.12)", border: "1px solid rgba(224,108,108,.25)", color: "#e06c6c", padding: "14px 18px", borderRadius: 10, marginBottom: 24, fontSize: 14, fontWeight: 600 }}>
                                        {errorMessage}
                                    </div>
                                )}

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Persona Name <span style={{color: C.orange}}>*</span></label>
                                        <input required name="persona_name" value={formData.persona_name} onChange={handleInputChange} placeholder="e.g. Marketing Expert" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Profession <span style={{color: C.orange}}>*</span></label>
                                        <input required name="profession" value={formData.profession} onChange={handleInputChange} placeholder="e.g. Senior Copywriter" style={inputStyle} />
                                    </div>
                                </div>

                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Purpose <span style={{color: C.orange}}>*</span></label>
                                    <textarea required name="purpose" value={formData.purpose} onChange={handleInputChange} placeholder="What is the main goal of this persona?" style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} />
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Domain</label>
                                        <input name="domain" value={formData.domain} onChange={handleInputChange} placeholder="e.g. Technology" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Tone</label>
                                        <select name="tone" value={formData.tone} onChange={handleInputChange} style={inputStyle}>
                                            <option value="professional">Professional</option>
                                            <option value="casual">Casual</option>
                                            <option value="friendly">Friendly</option>
                                            <option value="authoritative">Authoritative</option>
                                            <option value="humorous">Humorous</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Answer Style</label>
                                        <select name="answer_style" value={formData.answer_style} onChange={handleInputChange} style={inputStyle}>
                                            <option value="concise">Concise</option>
                                            <option value="detailed">Detailed</option>
                                            <option value="step-by-step">Step-by-step</option>
                                            <option value="storytelling">Storytelling</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Knowledge Level</label>
                                        <select name="knowledge_level" value={formData.knowledge_level} onChange={handleInputChange} style={inputStyle}>
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="expert">Expert</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Language</label>
                                        <select name="preferred_language" value={formData.preferred_language} onChange={handleInputChange} style={inputStyle}>
                                            <option value="English">English</option>
                                            <option value="Spanish">Spanish</option>
                                            <option value="French">French</option>
                                            <option value="German">German</option>
                                            <option value="Italian">Italian</option>
                                            <option value="Portuguese">Portuguese</option>
                                            <option value="Dutch">Dutch</option>
                                            <option value="Russian">Russian</option>
                                            <option value="Japanese">Japanese</option>
                                            <option value="Korean">Korean</option>
                                            <option value="Chinese">Chinese</option>
                                            <option value="Arabic">Arabic</option>
                                            <option value="Hindi">Hindi</option>
                                            <option value="Turkish">Turkish</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ marginTop: 20 }}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Persona Theme Color</label>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ position: "relative", width: 44, height: 44, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border2}`, flexShrink: 0 }}>
                                            <input
                                                type="color"
                                                name="color"
                                                value={formData.color || "#F97316"}
                                                onChange={handleInputChange}
                                                style={{ position: "absolute", top: -5, left: -5, width: 60, height: 60, cursor: "pointer", border: "none", background: "none" }}
                                            />
                                        </div>
                                        <input
                                            name="color"
                                            value={formData.color || "#F97316"}
                                            onChange={handleInputChange}
                                            placeholder="#HEXCODE"
                                            style={{ ...inputStyle, flex: 1 }}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        <div style={{ padding: "20px 30px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", gap: 12, background: C.surface2, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                style={{ background: "transparent", color: C.textMuted, border: `2px solid ${C.border2}`, borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700, fontFamily: "'Sora', sans-serif", cursor: "pointer", transition: "all .2s" }}
                                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = C.textDim; }}
                                onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; e.currentTarget.style.borderColor = C.border2; }}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                form="personaForm"
                                disabled={isSaving}
                                style={{ background: isSaving ? C.surface2 : C.orange, color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 700, fontFamily: "'Sora', sans-serif", cursor: isSaving ? "wait" : "pointer", transition: "all .2s", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 14px rgba(232,115,74,0.3)" }}
                                onMouseEnter={e => { if (!isSaving) { e.currentTarget.style.background = "#f07d55"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                                onMouseLeave={e => { if (!isSaving) { e.currentTarget.style.background = C.orange; e.currentTarget.style.transform = "none"; } }}
                            >
                                {isSaving && (
                                    <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.25)", borderTopColor: "#fff", borderRadius: "50%", animation: "naina-spin .6s linear infinite" }} />
                                )}
                                {isSaving ? "Saving..." : "Save Persona"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
