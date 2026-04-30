// Shared Sortix brand logo — Funnel + Sparkles SVG
export default function SortixLogo({ size = 34 }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 680" width={size} height={size} style={{ flexShrink: 0 }}>
            <defs>
                <linearGradient id="funnelG" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <linearGradient id="sparkG" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fcd34d" />
                    <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
            </defs>
            {/* Background */}
            <circle cx="340" cy="340" r="305" fill="#0f0c29" />
            <circle cx="340" cy="340" r="298" fill="none" stroke="#7c3aed" strokeWidth="5" opacity="0.5" />
            {/* Funnel body */}
            <path d="M153 197 L527 197 L402 356 L402 502 L278 502 Z" fill="url(#funnelG)" opacity="0.93" />
            <path d="M153 197 L527 197 L402 356 L278 356 Z" fill="#9f7aea" opacity="0.4" />
            <path d="M153 197 L527 197 L402 356 L402 502 L278 502 L278 356 Z" fill="none" stroke="#a78bfa" strokeWidth="6" opacity="0.65" />
            {/* Filter lines */}
            <line x1="221" y1="244" x2="459" y2="244" stroke="#c4b5fd" strokeWidth="7" strokeLinecap="round" opacity="0.7" />
            <line x1="255" y1="282" x2="425" y2="282" stroke="#c4b5fd" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
            <line x1="292" y1="320" x2="388" y2="320" stroke="#c4b5fd" strokeWidth="5" strokeLinecap="round" opacity="0.35" />
            {/* Drip */}
            <ellipse cx="340" cy="502" rx="27" ry="17" fill="#6d28d9" opacity="0.7" />
            <path d="M326 502 Q340 550 354 502" fill="#5b21b6" opacity="0.85" />
            {/* Main sparkle */}
            <path d="M516 177 L527 150 L538 177 L565 188 L538 199 L527 226 L516 199 L489 188 Z" fill="url(#sparkG)" />
            {/* Small sparkles */}
            <path d="M136 306 L143 292 L150 306 L164 313 L150 320 L143 334 L136 320 L122 313 Z" fill="#fcd34d" opacity="0.75" />
            <path d="M156 468 L163 452 L170 468 L186 476 L170 484 L163 500 L156 484 L140 476 Z" fill="#60a5fa" opacity="0.65" />
            {/* Dot cluster */}
            <circle cx="544" cy="272" r="9" fill="#fbbf24" opacity="0.9" />
            <circle cx="503" cy="231" r="6" fill="#f97316" opacity="0.7" />
            <circle cx="561" cy="232" r="5" fill="#fcd34d" opacity="0.6" />
        </svg>
    );
}
