import React from 'react';

// Shared Sortix brand logo — Modern 3D Spiky Star Design
export default function SortixLogo({ size = 32, className = "", style = {} }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 100 100" 
            className={className}
            style={{ 
                filter: "drop-shadow(0 4px 12px rgba(232,115,74,0.4))",
                flexShrink: 0,
                ...style 
            }}
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                {/* Outer glowing ring gradient */}
                <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="85%" stopColor="#e8734a" stopOpacity="0" />
                    <stop offset="95%" stopColor="#e8734a" stopOpacity="1" />
                    <stop offset="100%" stopColor="#ffcc80" stopOpacity="0.8" />
                </radialGradient>
                
                {/* Darker base gradient for spikes */}
                <linearGradient id="spikeBase" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffb347" />
                    <stop offset="50%" stopColor="#e8734a" />
                    <stop offset="100%" stopColor="#7a2e0e" />
                </linearGradient>

                {/* Lighter highlight gradient for spikes to give 3D bevel */}
                <linearGradient id="spikeHighlight" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffe6b3" />
                    <stop offset="40%" stopColor="#ffb347" />
                    <stop offset="100%" stopColor="#c24a15" />
                </linearGradient>
                
                {/* Center glowing core */}
                <radialGradient id="centerCore" cx="40%" cy="30%" r="60%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="20%" stopColor="#ffe6b3" />
                    <stop offset="60%" stopColor="#e8734a" />
                    <stop offset="100%" stopColor="#541b05" />
                </radialGradient>

                {/* 3D Drop shadow for the inner star */}
                <filter id="starShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.7"/>
                    <feDropShadow dx="-1" dy="-2" stdDeviation="2" floodColor="#e8734a" floodOpacity="0.4"/>
                </filter>
            </defs>

            {/* The outer glowing orange ring */}
            <circle cx="50" cy="50" r="46" fill="url(#ringGlow)" />
            <circle cx="50" cy="50" r="46" stroke="#ffb347" strokeWidth="1.5" strokeOpacity="0.9" />
            <circle cx="50" cy="50" r="47" stroke="#e8734a" strokeWidth="0.5" strokeOpacity="0.5" />

            <g filter="url(#starShadow)">
                {/* Back Layer Spikes (Diagonal) */}
                <polygon points="50,50 85,15 60,50" fill="url(#spikeBase)" />
                <polygon points="50,50 85,85 50,60" fill="url(#spikeBase)" />
                <polygon points="50,50 15,85 40,50" fill="url(#spikeBase)" />
                <polygon points="50,50 15,15 50,40" fill="url(#spikeBase)" />

                <polygon points="50,50 85,15 50,40" fill="url(#spikeHighlight)" />
                <polygon points="50,50 85,85 60,50" fill="url(#spikeHighlight)" />
                <polygon points="50,50 15,85 50,60" fill="url(#spikeHighlight)" />
                <polygon points="50,50 15,15 40,50" fill="url(#spikeHighlight)" />

                {/* Middle Layer Spikes (Cross) */}
                <polygon points="50,50 50,8 60,50" fill="url(#spikeBase)" />
                <polygon points="50,50 92,50 50,60" fill="url(#spikeBase)" />
                <polygon points="50,50 50,92 40,50" fill="url(#spikeBase)" />
                <polygon points="50,50 8,50 50,40" fill="url(#spikeBase)" />

                <polygon points="50,50 50,8 40,50" fill="url(#spikeHighlight)" />
                <polygon points="50,50 92,50 50,40" fill="url(#spikeHighlight)" />
                <polygon points="50,50 50,92 60,50" fill="url(#spikeHighlight)" />
                <polygon points="50,50 8,50 50,60" fill="url(#spikeHighlight)" />

                {/* Front Layer Spikes (Rotated slightly) */}
                <g transform="rotate(22.5 50 50)">
                    <polygon points="50,50 50,18 56,50" fill="url(#spikeBase)" />
                    <polygon points="50,50 82,50 50,56" fill="url(#spikeBase)" />
                    <polygon points="50,50 50,82 44,50" fill="url(#spikeBase)" />
                    <polygon points="50,50 18,50 50,44" fill="url(#spikeBase)" />

                    <polygon points="50,50 50,18 44,50" fill="url(#spikeHighlight)" />
                    <polygon points="50,50 82,50 50,44" fill="url(#spikeHighlight)" />
                    <polygon points="50,50 50,82 56,50" fill="url(#spikeHighlight)" />
                    <polygon points="50,50 18,50 50,56" fill="url(#spikeHighlight)" />
                </g>

                {/* Central Sphere Core */}
                <circle cx="50" cy="50" r="14" fill="url(#centerCore)" />
            </g>
        </svg>
    );
}
