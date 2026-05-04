'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SortixLogo from "@/app/chat/SortixLogo";
import { SourceList } from "./SourceCitation";
import { useChatRefresh } from "@/app/chat/ChatRefreshContext";

export default function Message({ message }) {
  const isUser = message.role === 'user';
  const { personaTheme } = useChatRefresh();

  const sources = message.sources || [];
  
  // Prioritize persona color stored in the message (for historical consistency)
  // then fallback to the active persona theme
  const displayColor = isUser 
    ? "#F97316" 
    : (message.persona_color || personaTheme.primary);

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-3 duration-500`}>
      <div className={`flex gap-4 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar Area */}
        <div className="shrink-0 mt-1">
          {isUser ? (
            <Avatar className="w-9 h-9 border border-border/50 shadow-sm">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">U</AvatarFallback>
            </Avatar>
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500"
              style={{
                background: `${displayColor}10`,
                border: `1.5px solid ${displayColor}30`,
                boxShadow: `0 0 12px ${displayColor}15`
              }}
            >
              <SortixLogo size={24} color={displayColor} />
            </div>
          )}
        </div>

        {/* Message Content Area */}
        <div className={`flex flex-col min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`rounded-2xl px-5 py-3 shadow-sm transition-all duration-500 p-4 ${isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-card text-foreground rounded-tl-sm'
              }`}
            style={!isUser ? {
              background: `${displayColor}15`,
              border: `1px solid ${displayColor}30`,
              boxShadow: `0 4px 15px ${displayColor}08`,
              transition: personaTheme.transition
            } : {}}
          >
            {isUser ? (
              <span className="text-[15px] leading-relaxed">{message.content}</span>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted prose-pre:border prose-pre:border-border/50">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Source Citations */}
          {!isUser && sources.length > 0 && (
            <SourceList sources={sources} />
          )}
        </div>
      </div>
    </div>
  );
}
