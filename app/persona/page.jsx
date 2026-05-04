"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import SortixLogo from "../chat/SortixLogo";

const FIELD_GROUPS = [
  { label: "Persona Name", key: "persona_name", placeholder: "e.g., Legal Contract Assistant", required: true },
  { label: "Profession", key: "profession", placeholder: "e.g., Lawyer, Teacher, Developer", required: true },
  { label: "Purpose", key: "purpose", placeholder: "Why do you want to use this chatbot?", textarea: true, required: true },
  { label: "Domain", key: "domain", placeholder: "e.g., Legal, Education, Finance, Tech" },
  {
    label: "Knowledge Level", key: "knowledge_level", type: "select",
    options: ["Beginner", "Intermediate", "Expert"]
  },
  {
    label: "Preferred Language", key: "preferred_language", type: "select",
    options: ["English", "Spanish", "French", "German", "Chinese", "Japanese", "Arabic", "Other"]
  },
  {
    label: "Tone", key: "tone", type: "select",
    options: ["Professional", "Friendly", "Formal", "Casual", "Humorous", "Direct"]
  },
  {
    label: "Answer Style", key: "answer_style", type: "select",
    options: ["Detailed", "Short", "Step-by-step", "Analytical", "Conversational"]
  },
  {
    label: "Output Format", key: "output_format", type: "select",
    options: ["Paragraphs", "Bullet points", "Table", "JSON", "Markdown"]
  },
  {
    label: "Citation Preference", key: "citation_preference", type: "select",
    options: ["Cite relevant document sections", "Provide sources at the end", "No citations needed"]
  },
  {
    label: "Document Behavior", key: "document_behavior", type: "select",
    options: ["Use uploaded documents first", "Strictly use only uploaded documents", "Mix documents with general knowledge"]
  },
  { label: "Restrictions", key: "restrictions", placeholder: "Any safety or behavior limits?", textarea: true },
  { label: "Persona Theme Color", key: "color", type: "color" },
];

const DEFAULTS = {
  persona_name: "",
  profession: "",
  purpose: "",
  domain: "",
  knowledge_level: "Beginner",
  preferred_language: "English",
  tone: "Professional",
  answer_style: "Detailed",
  output_format: "Paragraphs",
  citation_preference: "Cite relevant document sections",
  document_behavior: "Use uploaded documents first",
  restrictions: "",
  color: "#F97316",
};

const styles = {
  body: {
    fontFamily: "'Sora', sans-serif",
    background: "#0e0d0c",
    color: "#f0ece6",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    position: "relative",
    padding: "40px 16px",
  },
  glowTop: {
    position: "fixed",
    width: 600, height: 600,
    background: "radial-gradient(circle, rgba(232,115,74,0.08) 0%, transparent 70%)",
    top: -200, left: "50%",
    transform: "translateX(-50%)",
    pointerEvents: "none",
    borderRadius: "50%",
    zIndex: 0,
  },
  glowBottom: {
    position: "fixed",
    width: 300, height: 300,
    background: "radial-gradient(circle, rgba(232,115,74,0.04) 0%, transparent 70%)",
    bottom: 100, right: 100,
    pointerEvents: "none",
    borderRadius: "50%",
    zIndex: 0,
  },
  card: {
    background: "#1a1714",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: 40,
    width: 520,
    maxWidth: "95vw",
    margin: "auto",
    position: "relative",
    zIndex: 1,
    animation: "fadeScaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
  },
  logo: {
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 24px",
  },
  title: { fontSize: 22, fontWeight: 600, textAlign: "center", marginBottom: 6 },
  sub: { fontSize: 13, color: "#8a8070", textAlign: "center", marginBottom: 32 },
  label: { fontSize: 12, fontWeight: 600, color: "#8a8070", marginBottom: 8, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" },
  input: {
    width: "100%", background: "#221f1a",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12, padding: "13px 14px",
    fontSize: 14, fontFamily: "'Sora', sans-serif",
    color: "#f0ece6", outline: "none",
    boxSizing: "border-box",
    transition: "border-color .15s, box-shadow .15s",
  },
  btn: {
    width: "100%", padding: 14,
    background: "#e8734a", color: "#fff",
    border: "none", borderRadius: 12,
    fontSize: 15, fontWeight: 600, fontFamily: "'Sora', sans-serif",
    cursor: "pointer", marginTop: 8,
    transition: "background 0.2s, transform 0.1s, box-shadow 0.2s",
  },
  btnSkip: {
    width: "100%", padding: 14,
    background: "transparent", color: "#8a8070",
    border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12,
    fontSize: 15, fontWeight: 600, fontFamily: "'Sora', sans-serif",
    cursor: "pointer", marginTop: 8,
    transition: "background 0.2s, color 0.2s, border-color 0.2s",
  }
};

export default function PersonaPage() {
  const router = useRouter();
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const focusStyle = {
    borderColor: "#e8734a",
    boxShadow: "0 0 0 3px rgba(232,115,74,0.15)",
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.persona_name.trim() || !form.profession.trim() || !form.purpose.trim()) {
      setError("Please fill in Persona Name, Profession, and Purpose.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/personas", form);
      router.replace("/chat");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save persona.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        @keyframes fadeScaleIn {
          from { opacity:0; transform:scale(0.92) translateY(12px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder, textarea::placeholder { color: #5a5248; }
      `}</style>

      <div style={styles.body}>
        <div style={styles.glowTop} />
        <div style={styles.glowBottom} />

        <div style={styles.card}>
          <div style={styles.logo}><SortixLogo size={64} /></div>
          <div style={styles.title}>Design Your Smart Assistant</div>
          <div style={styles.sub}>Customize how your AI understands and interacts with you.</div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {FIELD_GROUPS.map((field) => (
              <div key={field.key}>
                <label style={styles.label}>
                  {field.label}
                  {field.required && <span style={{ color: "#e8734a" }}> *</span>}
                </label>
                {field.type === "select" ? (
                  <div style={{ position: "relative" }}>
                    <select
                      value={form[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      style={{ ...styles.input, appearance: "none", cursor: "pointer", paddingRight: 40, ...(focusedField === field.key ? focusStyle : {}) }}
                      onFocus={() => setFocusedField(field.key)}
                      onBlur={() => setFocusedField(null)}
                    >
                      {field.options.map((opt) => (
                        <option key={opt} value={opt} style={{ background: "#221f1a", color: "#f0ece6" }}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#5a5248", fontSize: 12, pointerEvents: "none" }}>▼</span>
                  </div>
                ) : field.textarea ? (
                  <textarea
                    value={form[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    style={{ ...styles.input, resize: "vertical", minHeight: 80, ...(focusedField === field.key ? focusStyle : {}) }}
                    onFocus={() => setFocusedField(field.key)}
                    onBlur={() => setFocusedField(null)}
                  />
                ) : field.type === "color" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ position: "relative", width: 44, height: 44, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)", flexShrink: 0 }}>
                      <input
                        type="color"
                        value={form[field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        style={{ position: "absolute", top: -5, left: -5, width: 60, height: 60, cursor: "pointer", border: "none", background: "none" }}
                      />
                    </div>
                    <input
                      type="text"
                      value={form[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      style={{ ...styles.input, flex: 1 }}
                      placeholder="#HEXCODE"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={form[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    style={{ ...styles.input, ...(focusedField === field.key ? focusStyle : {}) }}
                    onFocus={() => setFocusedField(field.key)}
                    onBlur={() => setFocusedField(null)}
                  />
                )}
              </div>
            ))}

            {error && (
              <div style={{ fontSize: 13, color: "#e06c6c", textAlign: "center", marginBottom: 8 }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => router.replace("/chat")}
                style={{ ...styles.btnSkip, flex: 1 }}
                onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.color = "#f0ece6"; e.target.style.borderColor = "rgba(255,255,255,0.3)"; }}
                onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#8a8070"; e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ ...styles.btn, flex: 2, opacity: loading ? 0.7 : 1, cursor: loading ? "wait" : "pointer" }}
                onMouseEnter={e => { if (!loading) { e.target.style.background = "#f07d55"; e.target.style.boxShadow = "0 4px 20px rgba(232,115,74,0.35)"; } }}
                onMouseLeave={e => { if (!loading) { e.target.style.background = "#e8734a"; e.target.style.boxShadow = "none"; } }}
                onMouseDown={e => { if (!loading) { e.target.style.transform = "scale(0.98)"; } }}
                onMouseUp={e => { if (!loading) { e.target.style.transform = "scale(1)"; } }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  {loading && (
                    <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                  )}
                  <span>{loading ? "Saving…" : "Save Persona"}</span>
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
