import React from 'react';

export default function SortixLogo({ size = 32, className = "", style = {}, color = "#e8734a" }) {
    const glowColor = color;
    const highlightColor = "#ffffff";
    const darkColor = "#000000";

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            className={className}
            style={{
                filter: `drop-shadow(0 4px 12px ${glowColor}60)`,
                flexShrink: 0,
                ...style
            }}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                {/* Outer glowing ring gradient */}
                <radialGradient id={`ringGlow-${color}`} cx="50%" cy="50%" r="50%">
                    <stop offset="85%" stopColor={glowColor} stopOpacity="0" />
                    <stop offset="95%" stopColor={glowColor} stopOpacity="1" />
                    <stop offset="100%" stopColor={highlightColor} stopOpacity="0.8" />
                </radialGradient>

                {/* Darker base gradient for spikes */}
                <linearGradient id={`spikeBase-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={highlightColor} stopOpacity="0.3" />
                    <stop offset="50%" stopColor={glowColor} />
                    <stop offset="100%" stopColor={darkColor} stopOpacity="0.8" />
                </linearGradient>

                {/* Lighter highlight gradient for spikes to give 3D bevel */}
                <linearGradient id={`spikeHighlight-${color}`} x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={highlightColor} stopOpacity="0.6" />
                    <stop offset="40%" stopColor={glowColor} />
                    <stop offset="100%" stopColor={darkColor} stopOpacity="0.4" />
                </linearGradient>

                {/* Center glowing core */}
                <radialGradient id={`centerCore-${color}`} cx="40%" cy="30%" r="60%">
                    <stop offset="0%" stopColor={highlightColor} />
                    <stop offset="20%" stopColor={highlightColor} stopOpacity="0.8" />
                    <stop offset="60%" stopColor={glowColor} />
                    <stop offset="100%" stopColor={darkColor} />
                </radialGradient>

                {/* 3D Drop shadow for the inner star */}
                <filter id={`starShadow-${color}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.7" />
                    <feDropShadow dx="-1" dy="-2" stdDeviation="2" floodColor={glowColor} floodOpacity="0.4" />
                </filter>
            </defs>

            {/* The outer glowing ring */}
            <circle cx="50" cy="50" r="46" fill={`url(#ringGlow-${color})`} />
            <circle cx="50" cy="50" r="46" stroke={glowColor} strokeWidth="1.5" strokeOpacity="0.9" />
            <circle cx="50" cy="50" r="47" stroke={glowColor} strokeWidth="0.5" strokeOpacity="0.5" />

            <g filter={`url(#starShadow-${color})`}>
                {/* Back Layer Spikes (Diagonal) */}
                <polygon points="50,50 85,15 60,50" fill={`url(#spikeBase-${color})`} />
                <polygon points="50,50 85,85 50,60" fill={`url(#spikeBase-${color})`} />
                <polygon points="50,50 15,85 40,50" fill={`url(#spikeBase-${color})`} />
                <polygon points="50,50 15,15 50,40" fill={`url(#spikeBase-${color})`} />

                <polygon points="50,50 85,15 50,40" fill={`url(#spikeHighlight-${color})`} />
                <polygon points="50,50 85,85 60,50" fill={`url(#spikeHighlight-${color})`} />
                <polygon points="50,50 15,85 50,60" fill={`url(#spikeHighlight-${color})`} />
                <polygon points="50,50 15,15 40,50" fill={`url(#spikeHighlight-${color})`} />

                {/* Middle Layer Spikes (Cross) */}
                <polygon points="50,50 50,8 60,50" fill={`url(#spikeBase-${color})`} />
                <polygon points="50,50 92,50 50,60" fill={`url(#spikeBase-${color})`} />
                <polygon points="50,50 50,92 40,50" fill={`url(#spikeBase-${color})`} />
                <polygon points="50,50 8,50 50,40" fill={`url(#spikeBase-${color})`} />

                <polygon points="50,50 50,8 40,50" fill={`url(#spikeHighlight-${color})`} />
                <polygon points="50,50 92,50 50,40" fill={`url(#spikeHighlight-${color})`} />
                <polygon points="50,50 50,92 60,50" fill={`url(#spikeHighlight-${color})`} />
                <polygon points="50,50 8,50 50,60" fill={`url(#spikeHighlight-${color})`} />

                {/* Front Layer Spikes (Rotated slightly) */}
                <g transform="rotate(22.5 50 50)">
                    <polygon points="50,50 50,18 56,50" fill={`url(#spikeBase-${color})`} />
                    <polygon points="50,50 82,50 50,56" fill={`url(#spikeBase-${color})`} />
                    <polygon points="50,50 50,82 44,50" fill={`url(#spikeBase-${color})`} />
                    <polygon points="50,50 18,50 50,44" fill={`url(#spikeBase-${color})`} />

                    <polygon points="50,50 50,18 44,50" fill={`url(#spikeHighlight-${color})`} />
                    <polygon points="50,50 82,50 50,44" fill={`url(#spikeHighlight-${color})`} />
                    <polygon points="50,50 50,82 56,50" fill={`url(#spikeHighlight-${color})`} />
                    <polygon points="50,50 18,50 50,56" fill={`url(#spikeHighlight-${color})`} />
                </g>

                {/* Central Sphere Core */}
                <circle cx="50" cy="50" r="14" fill={`url(#centerCore-${color})`} />
            </g>
        </svg>
    );
}

