'use client';

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addOptimisticMessage, sendMessage } from "@/store/chatSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { SendHorizonal, Loader2 } from "lucide-react";

export default function InputBox({ chatId }) {
  const [text, setText] = useState("");
  const dispatch = useDispatch();
  const isSending = useSelector((state) => state.chat.isSending);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || isSending) return;

    const message = text.trim();
    setText("");

    // Dispatch optimistic message instantly
    dispatch(addOptimisticMessage({ sessionId: chatId, content: message }));
    
    // Call network request for bot reply
    dispatch(sendMessage({ sessionId: chatId, message }));
  };

  return (
    <form onSubmit={handleSend} className="relative flex items-center w-full">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message..."
        className="pr-12 py-6 rounded-xl border-muted-foreground/30 focus-visible:ring-primary shadow-sm"
        disabled={isSending}
      />
      <Button 
        type="submit" 
        size="icon" 
        className="absolute right-2 rounded-lg"
        disabled={!text.trim() || isSending}
      >
        {isSending ? <Loader2 size={18} className="animate-spin" /> : <SendHorizonal size={18} />}
      </Button>
    </form>
  );
}
