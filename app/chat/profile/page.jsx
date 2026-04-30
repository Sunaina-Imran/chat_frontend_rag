"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const inputStyle = {
    width: "100%",
    background: "#0a0a0f",
    border: "1px solid #2e2b4a",
    borderRadius: 8,
    padding: "12px 14px",
    color: "#eae8ff",
    fontSize: 14,
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
        restrictions: ""
    };

    const [formData, setFormData] = useState(initialFormState);

    const fetchPersonas = async () => {
        try {
            const res = await api.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/personas`);
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
                const res = await api.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/personas/${editingId}`, formData);
                setPersonas(prev => prev.map(p => p.persona_id === editingId ? res.data : p));
                setSuccessMessage("Persona updated successfully!");
            } else {
                const res = await api.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/personas`, formData);
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
            await api.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/personas/${personaId}`);
            window.dispatchEvent(new Event('personasUpdated'));
        } catch (err) {
            console.error("Failed to delete persona", err);
            // Rollback on failure
            fetchPersonas();
        }
    };

    return (
        <div style={{ padding: "40px 60px", maxWidth: 1000, margin: "0 auto", color: "#eae8ff" }}>
            <button 
                onClick={() => router.push('/chat')}
                style={{ background: "none", border: "none", color: "#7e7aa0", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 30, fontSize: 13, fontWeight: 500 }}
                onMouseEnter={e => e.currentTarget.style.color = "#eae8ff"}
                onMouseLeave={e => e.currentTarget.style.color = "#7e7aa0"}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                </svg>
                Back to Chat
            </button>

            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: "#fff" }}>Profile & Settings</h1>
            <p style={{ color: "#7e7aa0", fontSize: 14, marginBottom: 30 }}>Manage your personal information and custom personas.</p>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 20, marginBottom: 30, borderBottom: "1px solid #1e1e2a" }}>
                <button 
                    onClick={() => setActiveTab('profile')}
                    style={{ padding: "10px 16px", background: "none", border: "none", color: activeTab === 'profile' ? "#c2652a" : "#7e7aa0", borderBottom: activeTab === 'profile' ? "2px solid #c2652a" : "2px solid transparent", cursor: "pointer", fontWeight: 600, fontSize: 14, transition: "color 0.2s" }}
                >
                    Profile
                </button>
                <button 
                    onClick={() => setActiveTab('personas')}
                    style={{ padding: "10px 16px", background: "none", border: "none", color: activeTab === 'personas' ? "#c2652a" : "#7e7aa0", borderBottom: activeTab === 'personas' ? "2px solid #c2652a" : "2px solid transparent", cursor: "pointer", fontWeight: 600, fontSize: 14, transition: "color 0.2s" }}
                >
                    Personas
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'profile' && (
                <div style={{ background: "#13131a", border: "1px solid #1e1e2a", borderRadius: 16, padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#1f1c3a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 600, color: "#8a83cc", flexShrink: 0, border: "2px solid #2e2b4a" }}>
                            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{user?.name || "Your Account"}</h2>
                            <p style={{ color: "#7e7aa0", fontSize: 14, marginBottom: 12 }}>{user?.email}</p>
                            <span style={{ background: "rgba(78,200,122,.12)", color: "#4ec87a", border: "1px solid rgba(78,200,122,.25)", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
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
                            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4, color: "#fff" }}>Custom Personas</h2>
                            <p style={{ color: "#7e7aa0", fontSize: 14 }}>Manage AI personalities for your chats.</p>
                        </div>
                        <button 
                            onClick={() => openModal()}
                            style={{ background: "#c2652a", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background .15s", display: "flex", alignItems: "center", gap: 6 }}
                            onMouseEnter={e => e.currentTarget.style.background = "#d9773a"}
                            onMouseLeave={e => e.currentTarget.style.background = "#c2652a"}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add Persona
                        </button>
                    </div>

                    <div style={{ background: "#13131a", border: "1px solid #1e1e2a", borderRadius: 16, overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead style={{ background: "#1a1829", borderBottom: "1px solid #2e2b4a" }}>
                                <tr>
                                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#a09cc0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</th>
                                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#a09cc0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Profession</th>
                                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#a09cc0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Domain</th>
                                    <th style={{ padding: "12px 20px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#a09cc0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {personas.map(p => (
                                    <tr key={p.persona_id} style={{ borderBottom: "1px solid #1e1e2a", transition: "background .15s" }} onMouseEnter={e => e.currentTarget.style.background = "#1a1a26"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                        <td style={{ padding: "16px 20px", fontSize: 14, color: "#eae8ff", fontWeight: 500 }}>{p.persona_name}</td>
                                        <td style={{ padding: "16px 20px", fontSize: 14, color: "#c4beff" }}>{p.profession}</td>
                                        <td style={{ padding: "16px 20px", fontSize: 14, color: "#7e7aa0" }}>{p.domain || "-"}</td>
                                        <td style={{ padding: "16px 20px", textAlign: "right" }}>
                                            <button onClick={() => openModal(p)} style={{ background: "none", border: "none", color: "#4ec87a", cursor: "pointer", fontSize: 13, fontWeight: 500, marginRight: 12 }}>Edit</button>
                                            <button onClick={() => handleDeletePersona(p.persona_id)} style={{ background: "none", border: "none", color: "#e06c6c", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                                {personas.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ padding: "40px", textAlign: "center", color: "#7e7aa0", fontSize: 14 }}>
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
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                    <div style={{ background: "#13131a", border: "1px solid #2e2b4a", borderRadius: 16, width: "100%", maxWidth: 650, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
                        <div style={{ padding: "20px 30px", borderBottom: "1px solid #1e1e2a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3 style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: 0 }}>{editingId ? "Edit Persona" : "Create New Persona"}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: "#7e7aa0", cursor: "pointer", fontSize: 20 }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "#7e7aa0"}>✕</button>
                        </div>
                        
                        <div style={{ padding: "30px", overflowY: "auto", flex: 1 }}>
                            <form onSubmit={handleSavePersona} id="personaForm">
                                {successMessage && (
                                    <div style={{ background: "rgba(78,200,122,.12)", border: "1px solid rgba(78,200,122,.25)", color: "#4ec87a", padding: "12px 16px", borderRadius: 8, marginBottom: 24, fontSize: 14, fontWeight: 500 }}>
                                        {successMessage}
                                    </div>
                                )}
                                {errorMessage && (
                                    <div style={{ background: "rgba(224,108,108,.12)", border: "1px solid rgba(224,108,108,.25)", color: "#e06c6c", padding: "12px 16px", borderRadius: 8, marginBottom: 24, fontSize: 14, fontWeight: 500 }}>
                                        {errorMessage}
                                    </div>
                                )}

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a09cc0", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Persona Name <span style={{color: "#e06c6c"}}>*</span></label>
                                        <input required name="persona_name" value={formData.persona_name} onChange={handleInputChange} placeholder="e.g. Marketing Expert" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a09cc0", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Profession <span style={{color: "#e06c6c"}}>*</span></label>
                                        <input required name="profession" value={formData.profession} onChange={handleInputChange} placeholder="e.g. Senior Copywriter" style={inputStyle} />
                                    </div>
                                </div>

                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a09cc0", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Purpose <span style={{color: "#e06c6c"}}>*</span></label>
                                    <textarea required name="purpose" value={formData.purpose} onChange={handleInputChange} placeholder="What is the main goal of this persona?" style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} />
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a09cc0", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Domain</label>
                                        <input name="domain" value={formData.domain} onChange={handleInputChange} placeholder="e.g. Technology" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a09cc0", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tone</label>
                                        <select name="tone" value={formData.tone} onChange={handleInputChange} style={inputStyle}>
                                            <option value="professional">Professional</option>
                                            <option value="casual">Casual</option>
                                            <option value="friendly">Friendly</option>
                                            <option value="authoritative">Authoritative</option>
                                            <option value="humorous">Humorous</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a09cc0", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Answer Style</label>
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
                                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a09cc0", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Knowledge Level</label>
                                        <select name="knowledge_level" value={formData.knowledge_level} onChange={handleInputChange} style={inputStyle}>
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="expert">Expert</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a09cc0", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Language</label>
                                        <input name="preferred_language" value={formData.preferred_language} onChange={handleInputChange} placeholder="e.g. English" style={inputStyle} />
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        <div style={{ padding: "20px 30px", borderTop: "1px solid #1e1e2a", display: "flex", justifyContent: "flex-end", gap: 12, background: "#0a0a0f", borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                style={{ background: "transparent", color: "#a09cc0", border: "1px solid #2e2b4a", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all .15s" }}
                                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#5a5680" }}
                                onMouseLeave={e => { e.currentTarget.style.color = "#a09cc0"; e.currentTarget.style.borderColor = "#2e2b4a" }}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                form="personaForm"
                                disabled={isSaving}
                                style={{ background: isSaving ? "#99460a" : "#c2652a", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: isSaving ? "wait" : "pointer", transition: "background .15s", display: "flex", alignItems: "center", gap: 8 }}
                                onMouseEnter={e => { if (!isSaving) e.currentTarget.style.background = "#d9773a"; }}
                                onMouseLeave={e => { if (!isSaving) e.currentTarget.style.background = "#c2652a"; }}
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
