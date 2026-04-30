"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import SortixLogo from "../chat/SortixLogo";

export default function LoginPage() {
    const router = useRouter();
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                background: "#0d0d11",
                fontFamily: "system-ui, sans-serif",
                gap: 24,
            }}
        >
            <SortixLogo size={80} />

            <div style={{ width: 320 }}>
                <h1 style={{ fontSize: 22, fontWeight: 600, color: "#eae8ff", margin: "0 0 20px", textAlign: "center" }}>
                    {isSignup ? "Create account" : "Welcome back"}
                </h1>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <input
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            background: "#13131a",
                            border: "1px solid #2e2b4a",
                            borderRadius: 10,
                            padding: "10px 12px",
                            color: "#d0ccee",
                            fontSize: 13,
                            outline: "none",
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            background: "#13131a",
                            border: "1px solid #2e2b4a",
                            borderRadius: 10,
                            padding: "10px 12px",
                            color: "#d0ccee",
                            fontSize: 13,
                            outline: "none",
                        }}
                    />

                    {error && (
                        <div style={{ fontSize: 12, color: "#e06c6c", textAlign: "center" }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
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
                        {loading ? (isSignup ? "Creating…" : "Signing in…") : (isSignup ? "Sign up" : "Sign in")}
                    </button>
                </form>

                <p style={{ fontSize: 12, color: "#7e7aa0", textAlign: "center", marginTop: 16 }}>
                    {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                        onClick={() => { setIsSignup(!isSignup); setError(""); }}
                        style={{ background: "none", border: "none", color: "#9b8ef5", cursor: "pointer", fontSize: 12, fontWeight: 500 }}
                    >
                        {isSignup ? "Sign in" : "Sign up"}
                    </button>
                </p>
            </div>
        </div>
    );
}
