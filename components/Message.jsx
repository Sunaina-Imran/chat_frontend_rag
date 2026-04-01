'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Message({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex gap-4 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <Avatar className={`w-9 h-9 shrink-0 shadow-sm border ${isUser ? 'border-primary/20' : 'border-border/50'}`}>
          <AvatarImage src={isUser ? "" : "/bot-avatar.png"} />
          <AvatarFallback className={isUser ? "bg-primary text-primary-foreground font-semibold" : "bg-card text-foreground font-semibold"}>
            {isUser ? "U" : "AI"}
          </AvatarFallback>
        </Avatar>
        
        <div 
          className={`rounded-2xl px-5 py-3 mt-1 leading-relaxed text-[15px] shadow-sm ${
            isUser 
              ? 'bg-primary text-primary-foreground rounded-tr-sm' 
              : 'bg-card border border-border/60 text-foreground rounded-tl-sm'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
