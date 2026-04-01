'use client';

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { createSession, fetchSessions, deleteSession } from "@/store/chatSlice";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Plus, MessageSquare, Loader2, Trash2 } from "lucide-react";

export default function Sidebar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  
  const chats = useSelector((state) => state.chat.chats);
  const status = useSelector((state) => state.chat.status);
  
  const activeChatId = params?.id || null;

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSessions());
    }
  }, [status, dispatch]);

  const handleNewChat = () => {
    dispatch(createSession()).unwrap().then((newChat) => {
      router.push(`/chat/${newChat._id}`);
    });
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Delete this chat?")) {
      dispatch(deleteSession(id)).unwrap().then(() => {
        if (activeChatId === id) {
          router.push('/');
        }
      });
    }
  };

  return (
    <div className="w-72 bg-secondary/30 flex flex-col h-full border-r border-border/50 p-4">
      <Button 
        onClick={handleNewChat}
        className="w-full justify-start gap-2 mb-6 shadow-sm border border-border/50"
        variant="default"
      >
        <Plus size={18} />
        New Chat
      </Button>

      <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider px-2">
        Recent Chats
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-1">
          {status === 'loading' && (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin text-muted-foreground" size={20} />
            </div>
          )}
          {status === 'failed' && (
            <p className="text-sm text-destructive px-2">Failed to load chats.</p>
          )}
          {status === 'succeeded' && chats.map((chat) => {
            const isActive = activeChatId === chat._id;
            return (
              <div key={chat._id} className="relative group">
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start text-left truncate font-medium gap-3 pr-10 transition-all ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                  onClick={() => router.push(`/chat/${chat._id}`)}
                >
                  <MessageSquare size={16} className={isActive ? "text-primary-foreground/80" : "text-muted-foreground"} />
                  <span className="truncate">{chat.title}</span>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 transition-opacity ${
                    isActive ? "opacity-100 text-primary-foreground/70 hover:text-white" : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  }`}
                  onClick={(e) => handleDelete(e, chat._id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
