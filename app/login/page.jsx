"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import SortixLogo from "../chat/SortixLogo";

const styles = {
  body: {
    fontFamily: "'Sora', sans-serif",
    background: "#0e0d0c",
    color: "#f0ece6",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  glowTop: {
    position: "absolute",
    width: 600, height: 600,
    background: "radial-gradient(circle, rgba(232,115,74,0.08) 0%, transparent 70%)",
    top: -200, left: "50%",
    transform: "translateX(-50%)",
    pointerEvents: "none",
    borderRadius: "50%",
  },
  glowBottom: {
    position: "absolute",
    width: 300, height: 300,
    background: "radial-gradient(circle, rgba(232,115,74,0.04) 0%, transparent 70%)",
    bottom: 100, right: 100,
    pointerEvents: "none",
    borderRadius: "50%",
  },
  card: {
    background: "#1a1714",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: 40,
    width: 420,
    maxWidth: "95vw",
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
  inputGroup: { position: "relative", marginBottom: 14 },
  inputIcon: {
    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
    color: "#5a5248", fontSize: 15, pointerEvents: "none",
  },
  input: {
    width: "100%", background: "#221f1a",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12, padding: "13px 14px 13px 42px",
    fontSize: 14, fontFamily: "'Sora', sans-serif",
    color: "#f0ece6", outline: "none",
    boxSizing: "border-box",
  },
  btn: {
    width: "100%", padding: 14,
    background: "#e8734a", color: "#fff",
    border: "none", borderRadius: 12,
    fontSize: 15, fontWeight: 600, fontFamily: "'Sora', sans-serif",
    cursor: "pointer", marginTop: 8,
    transition: "background 0.2s, transform 0.1s, box-shadow 0.2s",
  },
  footer: { textAlign: "center", marginTop: 20, fontSize: 13, color: "#8a8070" },
  footerLink: { color: "#e8734a", textDecoration: "none", fontWeight: 500, background: "none", border: "none", cursor: "pointer", fontFamily: "'Sora', sans-serif", fontSize: 13 },
};

export default function LoginPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const focusStyle = {
    borderColor: "#e8734a",
    boxShadow: "0 0 0 3px rgba(232,115,74,0.15)",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
        const endpoint = isSignup ? "/auth/signup" : "/auth/signin";
        const res = await api.post(endpoint, { email, password });

        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("user", JSON.stringify({ user_id: res.data.user_id, email: res.data.email }));

        // Check if user already has personas
        try {
            const personasRes = await api.get("/personas");
            if (personasRes.data && personasRes.data.length > 0) {
                router.replace("/");
            } else {
                router.replace("/persona");
            }
        } catch {
            router.replace("/persona");
        }
    } catch (err) {
        setError(err.response?.data?.detail || "Something went wrong.");
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
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #5a5248; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={styles.body}>
        <div style={styles.glowTop} />
        <div style={styles.glowBottom} />

        <div style={styles.card}>
          <div style={styles.logo}><SortixLogo size={64} /></div>
          <div style={styles.title}>{isSignup ? "Create account" : "Welcome back"}</div>
          <div style={styles.sub}>{isSignup ? "Sign up for a Sortix account" : "Sign in to your Sortix account"}</div>

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <span style={styles.inputIcon}>✉</span>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                required
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                style={{ ...styles.input, ...(focusedField === "email" ? focusStyle : {}) }}
              />
            </div>

            <div style={styles.inputGroup}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                type="password"
                placeholder="Password"
                value={password}
                required
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                style={{ ...styles.input, ...(focusedField === "password" ? focusStyle : {}) }}
              />
            </div>

            {error && (
              <div style={{ fontSize: 13, color: "#e06c6c", textAlign: "center", marginBottom: 8, marginTop: isSignup ? 8 : 0 }}>
                  {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.btn, opacity: loading ? 0.7 : 1, cursor: loading ? "wait" : "pointer" }}
              onMouseEnter={e => { if(!loading) { e.target.style.background = "#f07d55"; e.target.style.boxShadow = "0 4px 20px rgba(232,115,74,0.35)"; } }}
              onMouseLeave={e => { if(!loading) { e.target.style.background = "#e8734a"; e.target.style.boxShadow = "none"; } }}
              onMouseDown={e => { if(!loading) { e.target.style.transform = "scale(0.98)"; } }}
              onMouseUp={e => { if(!loading) { e.target.style.transform = "scale(1)"; } }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                {loading && (
                  <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                )}
                <span>{loading ? (isSignup ? "Creating…" : "Signing in…") : (isSignup ? "Sign up" : "Sign in")}</span>
              </div>
            </button>
          </form>

          <div style={styles.footer}>
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => { setIsSignup(!isSignup); setError(""); }}
              style={styles.footerLink}
            >
              {isSignup ? "Sign in" : "Sign up"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
