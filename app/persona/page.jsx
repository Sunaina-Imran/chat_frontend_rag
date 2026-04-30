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
  { label: "Knowledge Level", key: "knowledge_level", placeholder: "Beginner, Intermediate, Expert" },
  { label: "Preferred Language", key: "preferred_language", placeholder: "e.g., English, Spanish, French" },
  { label: "Tone", key: "tone", placeholder: "e.g., Professional, Friendly, Formal, Casual" },
  { label: "Answer Style", key: "answer_style", placeholder: "e.g., Short, Detailed, Step-by-step, Analytical" },
  { label: "Output Format", key: "output_format", placeholder: "e.g., Paragraphs, Bullet points, Table, JSON" },
  { label: "Citation Preference", key: "citation_preference", placeholder: "e.g., Always cite relevant document sections" },
  { label: "Document Behavior", key: "document_behavior", placeholder: "e.g., Only answer from uploaded documents" },
  { label: "Restrictions", key: "restrictions", placeholder: "Any safety or behavior limits?", textarea: true },
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
};

export default function PersonaPage() {
  const router = useRouter();
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const inputStyle = {
    background: "#13131a",
    border: "1px solid #2e2b4a",
    borderRadius: 10,
    padding: "10px 12px",
    color: "#d0ccee",
    fontSize: 13,
    outline: "none",
    width: "100%",
    transition: "border-color .15s",
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 500,
    color: "#a09cc0",
    marginBottom: 6,
    display: "block",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        background: "#0d0d11",
        fontFamily: "system-ui, sans-serif",
        padding: "40px 16px",
      }}
    >
      <SortixLogo size={60} />

      <div style={{ width: "100%", maxWidth: 520, marginTop: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#eae8ff", margin: "0 0 6px", textAlign: "center" }}>
          Create Your Persona
        </h1>
        <p style={{ fontSize: 13, color: "#6b6885", textAlign: "center", margin: "0 0 28px" }}>
          Tell us how you want the AI to behave. You can change this later.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {FIELD_GROUPS.map((field) => (
            <div key={field.key}>
              <label style={labelStyle}>
                {field.label}
                {field.required && <span style={{ color: "#e06c6c" }}> *</span>}
              </label>
              {field.textarea ? (
                <textarea
                  value={form[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 64 }}
                  onFocus={(e) => (e.target.style.borderColor = "#6c5fe8")}
                  onBlur={(e) => (e.target.style.borderColor = "#2e2b4a")}
                />
              ) : (
                <input
                  type="text"
                  value={form[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#6c5fe8")}
                  onBlur={(e) => (e.target.style.borderColor = "#2e2b4a")}
                />
              )}
            </div>
          ))}

          {error && (
            <div style={{ fontSize: 12, color: "#e06c6c", textAlign: "center", background: "rgba(224,108,108,.08)", border: "1px solid rgba(224,108,108,.2)", borderRadius: 8, padding: "8px 12px" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => router.replace("/chat")}
              style={{
                flex: 1,
                background: "transparent",
                border: "1px solid #2e2b4a",
                borderRadius: 10,
                padding: "10px 12px",
                color: "#7e7aa0",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                background: loading ? "#5549c0" : "#6c5fe8",
                border: "none",
                borderRadius: 10,
                padding: "10px 12px",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "Saving…" : "Save Persona"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
