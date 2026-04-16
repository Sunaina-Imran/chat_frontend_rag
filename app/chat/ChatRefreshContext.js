"use client";

import { createContext, useContext, useState, useCallback } from "react";

const ChatRefreshContext = createContext(null);

export function ChatRefreshProvider({ children }) {
    const [refreshToken, setRefreshToken] = useState(0);

    const triggerRefresh = useCallback(() => {
        setRefreshToken((t) => t + 1);
    }, []);

    return (
        <ChatRefreshContext.Provider value={{ refreshToken, triggerRefresh }}>
            {children}
        </ChatRefreshContext.Provider>
    );
}

export function useChatRefresh() {
    const ctx = useContext(ChatRefreshContext);
    if (!ctx) throw new Error("useChatRefresh must be used inside ChatRefreshProvider");
    return ctx;
}
