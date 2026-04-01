"use client";

import { useState, useRef, useEffect } from "react";

const styles = `
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-dm-sans);
  --font-serif: var(--font-playfair);
  --font-mono: var(--font-geist-mono);
}

:root {
  --choco-dark: #2C1A0E;
  --choco-warm: #8B5530;
  --mustard: #D4A017;
  --mustard-light: #F0C040;
  --mustard-pale: #F5DFA0;
  --cream: #FDF6EC;
  --sidebar-w: 260px;

  --background: var(--choco-dark);
  --foreground: var(--cream);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font-sans), sans-serif; background: var(--choco-dark); }
.app { display: flex; height: 100vh; overflow: hidden; background: var(--choco-dark); }
.sidebar { width: var(--sidebar-w); min-width: var(--sidebar-w); background: linear-gradient(180deg, #1A0F07 0%, #2C1A0E 60%, #1E1108 100%); display: flex; flex-direction: column; border-right: 1px solid rgba(212,160,23,0.18); position: relative; overflow: hidden; }
.sidebar::before { content: ''; position: absolute; top: -40px; left: -40px; width: 180px; height: 180px; background: radial-gradient(circle, rgba(212,160,23,0.12) 0%, transparent 70%); pointer-events: none; }
.sidebar-header { padding: 22px 18px 14px; border-bottom: 1px solid rgba(212,160,23,0.12); }
.logo { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
.logo-icon { width: 36px; height: 36px; background: linear-gradient(135deg, var(--mustard), var(--choco-warm)); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 12px rgba(212,160,23,0.3); }
.logo-text { font-family: var(--font-serif), serif; font-size: 18px; font-weight: 700; color: var(--mustard-light); letter-spacing: 0.3px; }
.logo-text span { color: var(--cream); font-weight: 400; }
.new-chat-btn { width: 100%; padding: 11px 16px; background: linear-gradient(135deg, var(--mustard) 0%, #B8880E 100%); border: none; border-radius: 10px; color: var(--choco-dark); font-family: var(--font-sans), sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.25s ease; box-shadow: 0 3px 12px rgba(212,160,23,0.35); letter-spacing: 0.3px; }
.new-chat-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(212,160,23,0.5); background: linear-gradient(135deg, var(--mustard-light) 0%, var(--mustard) 100%); }
.new-chat-btn:active { transform: translateY(0); }
.plus-icon { font-size: 18px; font-weight: 300; line-height: 1; }
.history-section { flex: 1; overflow-y: auto; padding: 14px 10px; scrollbar-width: thin; scrollbar-color: rgba(212,160,23,0.2) transparent; }
.history-label { font-size: 10px; font-weight: 600; color: rgba(212,160,23,0.5); text-transform: uppercase; letter-spacing: 1.2px; padding: 0 8px; margin-bottom: 8px; }
.chat-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; margin-bottom: 2px; position: relative; overflow: hidden; }
.chat-item::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 3px; height: 0; background: var(--mustard); border-radius: 0 2px 2px 0; transition: height 0.2s ease; }
.chat-item:hover::before, .chat-item.active::before { height: 60%; }
.chat-item:hover { background: rgba(212,160,23,0.08); }
.chat-item.active { background: rgba(212,160,23,0.13); }
.chat-item-icon { font-size: 13px; opacity: 0.6; min-width: 16px; }
.chat-item-text { font-size: 13px; color: rgba(253,246,236,0.75); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
.chat-item.active .chat-item-text { color: var(--mustard-pale); }
.main { flex: 1; display: flex; flex-direction: column; background: linear-gradient(160deg, #3A2210 0%, #2C1A0E 40%, #1E0F07 100%); position: relative; overflow: hidden; }
.main::before { content: ''; position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(212,160,23,0.06) 0%, transparent 70%); pointer-events: none; }
.topbar { padding: 16px 28px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(212,160,23,0.1); backdrop-filter: blur(10px); }
.topbar-title { font-family: var(--font-serif), serif; font-size: 16px; color: var(--mustard-pale); font-weight: 600; }
.model-badge { background: rgba(212,160,23,0.12); border: 1px solid rgba(212,160,23,0.25); color: var(--mustard); font-size: 11px; font-weight: 500; padding: 4px 12px; border-radius: 20px; letter-spacing: 0.5px; }
.messages-area { flex: 1; overflow-y: auto; padding: 28px 10%; display: flex; flex-direction: column; gap: 18px; scrollbar-width: thin; scrollbar-color: rgba(212,160,23,0.2) transparent; }
.welcome { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; text-align: center; animation: fadeUp 0.6s ease forwards; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
.welcome-orb { width: 90px; height: 90px; background: linear-gradient(135deg, var(--mustard) 0%, var(--choco-warm) 50%, var(--mustard-light) 100%); border-radius: 28px; display: flex; align-items: center; justify-content: center; font-size: 40px; margin-bottom: 28px; box-shadow: 0 0 0 8px rgba(212,160,23,0.1), 0 0 0 18px rgba(212,160,23,0.05), 0 12px 40px rgba(212,160,23,0.4); animation: pulse 3s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { box-shadow: 0 0 0 8px rgba(212,160,23,0.1), 0 0 0 18px rgba(212,160,23,0.05), 0 12px 40px rgba(212,160,23,0.4); } 50% { box-shadow: 0 0 0 12px rgba(212,160,23,0.15), 0 0 0 26px rgba(212,160,23,0.07), 0 18px 50px rgba(212,160,23,0.5); } }
.welcome-greeting { font-family: var(--font-serif), serif; font-size: 40px; font-weight: 700; color: var(--cream); margin-bottom: 12px; line-height: 1.15; }
.welcome-greeting em { font-style: italic; color: var(--mustard); }
.welcome-sub { font-size: 15px; color: rgba(253,246,236,0.5); max-width: 400px; line-height: 1.65; margin-bottom: 36px; }
.suggestion-chips { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; max-width: 580px; }
.chip { background: rgba(212,160,23,0.08); border: 1px solid rgba(212,160,23,0.22); color: var(--mustard-pale); font-size: 13px; padding: 8px 16px; border-radius: 20px; cursor: pointer; transition: all 0.2s ease; font-family: var(--font-sans), sans-serif; }
.chip:hover { background: rgba(212,160,23,0.16); border-color: rgba(212,160,23,0.5); color: var(--mustard-light); transform: translateY(-1px); }
.msg-row { display: flex; gap: 14px; animation: msgIn 0.35s ease forwards; }
@keyframes msgIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.msg-row.user { flex-direction: row-reverse; }
.avatar { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; min-width: 34px; margin-top: 2px; }
.avatar.bot { background: linear-gradient(135deg, var(--mustard), var(--choco-warm)); box-shadow: 0 3px 10px rgba(212,160,23,0.3); }
.avatar.user { background: rgba(253,246,236,0.12); border: 1px solid rgba(253,246,236,0.2); }
.bubble { max-width: 72%; padding: 13px 18px; border-radius: 16px; font-size: 14.5px; line-height: 1.65; }
.bubble.bot { background: rgba(74,44,23,0.6); border: 1px solid rgba(212,160,23,0.15); color: var(--cream); border-radius: 4px 16px 16px 16px; backdrop-filter: blur(8px); }
.bubble.user { background: linear-gradient(135deg, var(--mustard) 0%, #B8880E 100%); color: var(--choco-dark); font-weight: 500; border-radius: 16px 4px 16px 16px; }
.input-area { padding: 18px 10%; border-top: 1px solid rgba(212,160,23,0.1); background: rgba(28,16,8,0.5); backdrop-filter: blur(10px); }
.input-wrapper { display: flex; align-items: flex-end; gap: 12px; background: rgba(74,44,23,0.5); border: 1.5px solid rgba(212,160,23,0.22); border-radius: 16px; padding: 10px 14px; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
.input-wrapper:focus-within { border-color: rgba(212,160,23,0.55); box-shadow: 0 0 0 3px rgba(212,160,23,0.08); }
.input-wrapper textarea { flex: 1; background: transparent; border: none; outline: none; color: var(--cream); font-family: var(--font-sans), sans-serif; font-size: 14.5px; line-height: 1.6; resize: none; min-height: 24px; max-height: 160px; padding: 2px 0; }
.input-wrapper textarea::placeholder { color: rgba(253,246,236,0.3); }
.send-btn { width: 38px; height: 38px; background: linear-gradient(135deg, var(--mustard), #B8880E); border: none; border-radius: 10px; color: var(--choco-dark); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 17px; transition: all 0.2s ease; min-width: 38px; box-shadow: 0 3px 10px rgba(212,160,23,0.3); }
.send-btn:hover:not(:disabled) { transform: translateY(-1px) scale(1.05); box-shadow: 0 5px 16px rgba(212,160,23,0.5); }
.send-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.input-hint { text-align: center; font-size: 11px; color: rgba(253,246,236,0.22); margin-top: 8px; }
.typing { display: flex; align-items: center; gap: 5px; padding: 14px 18px; }
.dot { width: 7px; height: 7px; background: var(--mustard); border-radius: 50%; animation: bounce 1.2s ease-in-out infinite; opacity: 0.7; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce { 0%, 100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(-6px); opacity: 1; } }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(212,160,23,0.2); border-radius: 10px; }
`;

const SAMPLE_HISTORY = [
  { id: 1, title: "Travel tips for Paris" },
  { id: 2, title: "Python code review" },
];

const CHIPS = [
  "✍️  Write something creative",
  "🔍  Help me research",
  "💬  Let's just chat",
];

const BOT_RESPONSES = [
  "Of course! I'm here to help you with anything you need.",
  "Great question! Let me think about that.",
  "That's interesting! Here's what I know.",
  "Absolutely! I'd be happy to help.",
];

export default function App() {
  const [chats, setChats] = useState(SAMPLE_HISTORY);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap";

    const styleTag = document.createElement("style");
    styleTag.textContent = styles;

    document.head.appendChild(fontLink);
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(fontLink);
      document.head.removeChild(styleTag);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
  };

  const handleSelectChat = (chat) => {
    setActiveChatId(chat.id);
    setMessages([
      {
        role: "bot",
        text: `Welcome back! You were asking about "${chat.title}".`,
      },
    ]);
  };

  const sendMessage = (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
    }

    if (!activeChatId) {
      const newChat = { id: Date.now(), title: trimmed.slice(0, 32) };
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
    }

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: BOT_RESPONSES[
            Math.floor(Math.random() * BOT_RESPONSES.length)
          ],
        },
      ]);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "24px";
    e.target.style.height =
      Math.min(e.target.scrollHeight, 160) + "px";
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">💡</div>
            <div className="logo-text">
              SK <span>bot</span>
            </div>
          </div>

          <button className="new-chat-btn" onClick={handleNewChat}>
            + New Chat
          </button>
        </div>

        <div className="history-section">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${
                activeChatId === chat.id ? "active" : ""
              }`}
              onClick={() => handleSelectChat(chat)}
            >
              💬 {chat.title}
            </div>
          ))}
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <span>
            {activeChatId
              ? chats.find((c) => c.id === activeChatId)?.title
              : "New Chat"}
          </span>
        </div>

        <div className="messages-area">
          {messages.length === 0 && !isTyping && (
            <div className="welcome">
              <h1>Hello, start chatting!</h1>

              <div className="suggestion-chips">
                {CHIPS.map((chip) => (
                  <button
                    key={chip}
                    className="chip"
                    onClick={() =>
                      sendMessage(chip.replace(/^.{2}\s+/, ""))
                    }
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`msg-row ${msg.role}`}>
              <div className="avatar">
                {msg.role === "bot" ? "💡" : "🙂"}
              </div>

              <div className={`bubble ${msg.role}`}>
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="msg-row">
              <div className="avatar bot">💡</div>
              <div className="bubble bot">
                <div className="typing">
                  <div className="dot" />
                  <div className="dot" />
                  <div className="dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Message SK bot..."
            />

            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
