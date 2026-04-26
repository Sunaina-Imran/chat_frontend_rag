'use client';

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Message from "./Message";
import InputBox from "./InputBox";
import { ScrollArea } from "./ui/scroll-area";
import { Loader2 } from "lucide-react";

export default function ChatWindow({ chatId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  // Fetch messages whenever chatId changes
  useEffect(() => {
    if (!chatId) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/messages/${chatId}`);
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [chatId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background/50">
      <header className="h-16 flex items-center px-6 border-b border-border/50 font-semibold shadow-sm shrink-0 bg-background/80 backdrop-blur-sm z-10 sticky top-0">
        <h2 className="text-lg text-foreground tracking-tight">Chat</h2>
      </header>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-6 pb-6 pt-2">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground pt-32 pb-20 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold mb-3 text-foreground tracking-tight">
                How can I help you today?
              </h2>
              <p className="text-sm">Type a message below to kickstart this conversation.</p>
            </div>
          ) : (
            messages.map((msg, idx) => <Message key={idx} message={msg} />)
          )}
        </div>
      </ScrollArea>

      <div className="p-6 w-full shrink-0 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="max-w-4xl mx-auto">
          <InputBox chatId={chatId} />
        </div>
      </div>
    </div>
  );
}




/*
'use client';

import { useSelector, useDispatch } from "react-redux";
import { useParams } from "next/navigation";
import { fetchMessages } from "@/store/chatSlice";
import Message from "./Message";
import InputBox from "./InputBox";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

export default function ChatWindow() {
  const dispatch = useDispatch();
  const params = useParams();
  const chatId = params?.id;

  const activeChat = useSelector((state) => state.chat.chats.find(c => c._id === chatId));
  const scrollRef = useRef(null);

  // Fetch true messages for selected chat based on URL Param
  useEffect(() => {
    if (chatId) {
      dispatch(fetchMessages(chatId));
    }
  }, [chatId, dispatch]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [activeChat?.messages]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background/50">
      <header className="h-16 flex items-center px-6 border-b border-border/50 font-semibold shadow-sm shrink-0 bg-background/80 backdrop-blur-sm z-10 sticky top-0">
        <h2 className="text-lg text-foreground tracking-tight">{activeChat.title}</h2>
      </header>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-6 pb-6 pt-2">
          {!activeChat.messages || activeChat.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground pt-32 pb-20 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold mb-3 text-foreground tracking-tight">How can I help you today?</h2>
              <p className="text-sm">Type a message below to kickstart this conversation.</p>
            </div>
          ) : (
            activeChat.messages.map((msg, idx) => (
              <Message key={idx} message={msg} />
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-6 w-full shrink-0 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="max-w-4xl mx-auto">
          <InputBox chatId={activeChat._id} />
        </div>
      </div>
    </div>
  );
}
*/