'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SortixLogo from "@/app/chat/SortixLogo";
import { SourceList } from "./SourceCitation";
import { useChatRefresh } from "@/app/chat/ChatRefreshContext";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/50 hover:text-white"
      title="Copy to clipboard"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
};

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
            className={`rounded-2xl p-4 shadow-sm transition-all duration-500 ${isUser
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
              <div className="markdown-content text-[15px] leading-relaxed text-foreground/90 space-y-4">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <div className="relative my-4 rounded-lg overflow-hidden border border-border/50 group">
                          <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-border/30">
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{match[1]}</span>
                            <CopyButton text={String(children).replace(/\n$/, '')} />
                          </div>
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              padding: '1rem',
                              fontSize: '13px',
                              background: '#1e1e1e'
                            }}
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code 
                          className={`${className} px-1.5 py-0.5 rounded-md text-[13px] font-mono`}
                          style={{
                            background: `${displayColor}20`,
                            color: displayColor,
                            border: `1px solid ${displayColor}30`
                          }}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    a: ({ ...props }) => (
                      <a 
                        {...props} 
                        className="font-semibold underline underline-offset-4 decoration-2 hover:opacity-80 transition-opacity"
                        style={{ color: displayColor, textDecorationColor: `${displayColor}50` }}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                    table: ({ ...props }) => (
                      <div className="my-4 overflow-x-auto rounded-xl border border-border/50">
                        <table {...props} className="w-full text-sm border-collapse" />
                      </div>
                    ),
                    th: ({ ...props }) => (
                      <th {...props} className="px-4 py-2 bg-muted text-left font-bold border-b border-border/30" />
                    ),
                    td: ({ ...props }) => (
                      <td {...props} className="px-4 py-2 border-b border-border/10" />
                    ),
                    ul: ({ ...props }) => (
                      <ul {...props} className="my-3 list-disc list-inside space-y-1.5" />
                    ),
                    ol: ({ ...props }) => (
                      <ol {...props} className="my-3 list-decimal list-inside space-y-1.5" />
                    ),
                    blockquote: ({ ...props }) => (
                      <blockquote 
                        {...props} 
                        className="my-4 pl-4 border-l-4 italic text-muted-foreground bg-muted/30 py-2 pr-4 rounded-r-lg"
                        style={{ borderLeftColor: displayColor }}
                      />
                    ),
                  }}
                >
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
