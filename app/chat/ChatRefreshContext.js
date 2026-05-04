"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";

const ChatRefreshContext = createContext(null);

export const personaColorMap = {
    "Default Persona": "#F97316",
    "HR Assistant": "#3B82F6",
    "Finance AI": "#10B981",
    "Support Bot": "#8B5CF6",
    "default": "#F97316" // Fallback
};

export function ChatRefreshProvider({ children }) {
    const [refreshKey, setRefreshKey] = useState(0);
    const [currentPersona, setCurrentPersona] = useState(null);

    const triggerRefresh = useCallback(() => {
        setRefreshKey((t) => t + 1);
    }, []);

    const personaColor = useMemo(() => {
        if (currentPersona?.color) return currentPersona.color;
        if (currentPersona?.persona_name) {
            return personaColorMap[currentPersona.persona_name] || personaColorMap.default;
        }
        return personaColorMap.default;
    }, [currentPersona]);

    const personaTheme = useMemo(() => ({
        primary: personaColor,
        background: `${personaColor}08`, // Very light version for backgrounds
        glow: `${personaColor}15`,
        border: `${personaColor}30`,
        transition: 'all 0.3s ease-in-out'
    }), [personaColor]);

    return (
        <ChatRefreshContext.Provider value={{ 
            refreshKey, 
            triggerRefresh, 
            currentPersona, 
            setCurrentPersona, 
            personaColor,
            personaTheme
        }}>
            {children}
        </ChatRefreshContext.Provider>
    );
}

export function useChatRefresh() {
    const ctx = useContext(ChatRefreshContext);
    if (!ctx) throw new Error("useChatRefresh must be used inside ChatRefreshProvider");
    return ctx;
}
