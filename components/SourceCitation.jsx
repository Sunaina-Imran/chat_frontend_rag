'use client';

import React from 'react';
import { FileText, MapPin, Target } from 'lucide-react';

/**
 * Individual Source Card component
 */
export function SourceCard({ source }) {
  const { 
    source: fileName, 
    page, 
    confidence = 0, 
    reference_id 
  } = source;

  // Convert confidence to percentage (e.g., 0.92 -> 92)
  const confidencePct = Math.round(confidence * 100);

  // Relevance logic:
  // 85%+ -> High (Blue)
  // 60-84% -> Medium (Amber/Yellow)
  // < 60% -> Low (Slate/Gray)
  let relevanceColor = 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  let dotColor = 'bg-slate-400';
  let label = 'Low Relevance';

  if (confidencePct >= 85) {
    relevanceColor = 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    dotColor = 'bg-blue-400';
    label = 'High Relevance';
  } else if (confidencePct >= 60) {
    relevanceColor = 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    dotColor = 'bg-amber-400';
    label = 'Medium Relevance';
  }

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-secondary/20 border border-border/40 hover:border-border/80 transition-colors group cursor-default min-w-[180px] max-w-[240px]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <FileText size={14} className="text-primary shrink-0" />
          <span className="text-xs font-semibold truncate text-foreground/90" title={fileName}>
            {fileName}
          </span>
        </div>
        {reference_id && (
          <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
            #{reference_id}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {page && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin size={12} />
            <span className="text-[11px]">Page {page}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-muted-foreground">
          <Target size={12} />
          <span className="text-[11px]">{confidencePct}% Match</span>
        </div>
      </div>

      <div className={`mt-1 flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${relevanceColor}`}>
        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotColor}`} />
        {label}
      </div>
    </div>
  );
}

/**
 * List wrapper for Source Cards
 */
export function SourceList({ sources }) {
  if (!sources || sources.length === 0) return null;

  // Show up to 3 sources by default
  const displaySources = sources.slice(0, 3);

  return (
    <div className="mt-4 w-full">
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="h-px flex-1 bg-border/30" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Source Citations
        </span>
        <div className="h-px flex-1 bg-border/30" />
      </div>
      
      <div className="flex flex-wrap gap-3">
        {displaySources.map((src, idx) => (
          <SourceCard key={idx} source={src} />
        ))}
        {sources.length > 3 && (
          <div className="flex items-center justify-center p-3 rounded-xl border border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-all cursor-pointer">
            <span className="text-xs font-medium">+{sources.length - 3} more</span>
          </div>
        )}
      </div>
    </div>
  );
}
