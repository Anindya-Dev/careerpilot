/**
 * @file CareerPilotLogo.jsx
 * @description Dynamic, angular, anime/supersonic-inspired Neo-Brutalist logo.
 * Modeled after the high-energy Re:Anime aesthetic: sharp geometric bevels,
 * lightning flight slash, two-tone neon styling, 4-point star, and micro-tagline.
 * @author Md Hussain Ansari (Member 1)
 */

import React from 'react';

export default function CareerPilotLogo({ className = 'h-11 sm:h-13 w-auto', showTagline = true }) {
  return (
    <div className="flex items-center select-none group cursor-pointer py-1">
      <svg
        viewBox="0 0 445 84"
        className={`${className} transition-transform duration-200 group-hover:scale-[1.03] overflow-visible`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Hard Neo-Brutalist Drop Shadow */}
          <filter id="neoLogoShadow" x="-10%" y="-10%" width="130%" height="135%">
            <feDropShadow dx="3.5" dy="4" stdDeviation="0" floodColor="#000000" />
          </filter>
        </defs>

        <g filter="url(#neoLogoShadow)">
          {/* ======================================================== */}
          {/* WORD 1: CAREER — Electric Neon Yellow, Angular Cuts      */}
          {/* ======================================================== */}
          <g transform="skewX(-13)">
            {/* C */}
            <path
              d="M38 18 H18 L9 32 V48 L18 62 H38 V51 H23 L19 45 V35 L23 29 H38 Z"
              fill="#FFE600"
              stroke="#000000"
              strokeWidth="2.5"
              strokeLinejoin="miter"
            />
            {/* A */}
            <path
              d="M44 62 L58 18 H71 L85 62 H72 L69 51 H57 L54 62 Z M59 42 H67 L63 29 Z"
              fill="#FFE600"
              stroke="#000000"
              strokeWidth="2.5"
              strokeLinejoin="miter"
            />
            {/* R */}
            <path
              d="M89 18 H109 C118 18 123 23 123 32 C123 38 119 42 113 44 L124 62 H110 L101 46 H100 V62 H89 Z M100 27 V38 H107 C111 38 113 36 113 32 C113 29 111 27 107 27 Z"
              fill="#FFE600"
              stroke="#000000"
              strokeWidth="2.5"
              strokeLinejoin="miter"
            />
            {/* E */}
            <path
              d="M129 18 H156 V28 H140 V35 H153 V44 H140 V52 H156 V62 H129 Z"
              fill="#FFE600"
              stroke="#000000"
              strokeWidth="2.5"
              strokeLinejoin="miter"
            />
            {/* E */}
            <path
              d="M162 18 H189 V28 H173 V35 H186 V44 H173 V52 H189 V62 H162 Z"
              fill="#FFE600"
              stroke="#000000"
              strokeWidth="2.5"
              strokeLinejoin="miter"
            />
            {/* R */}
            <path
              d="M195 18 H215 C224 18 229 23 229 32 C229 38 225 42 219 44 L230 62 H216 L207 46 H206 V62 H195 Z M206 27 V38 H213 C217 38 219 36 219 32 C219 29 217 27 213 27 Z"
              fill="#FFE600"
              stroke="#000000"
              strokeWidth="2.5"
              strokeLinejoin="miter"
            />
          </g>

          {/* ======================================================== */}
          {/* LIGHTNING SUPERSONIC FIN SLASH — Cuts through center     */}
          {/* ======================================================== */}
          <polygon
            points="224,80 250,33 239,33 268,2 253,38 265,38"
            fill="#70E000"
            stroke="#000000"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* ======================================================== */}
          {/* WORD 2: PILOT — High-Contrast White with Sharp Bevels    */}
          {/* ======================================================== */}
          <g transform="skewX(-13)">
            {/* P */}
            <path
              d="M266 18 H289 C299 18 305 24 305 33 C305 42 299 48 289 48 H278 V62 H266 Z M278 27 V39 H287 C292 39 294 37 294 33 C294 29 292 27 287 27 Z"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="2.5"
              strokeLinejoin="miter"
            />
            {/* I */}
            <path
              d="M311 18 H322 V62 H311 Z"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="2.5"
              strokeLinejoin="miter"
            />
            {/* L */}
            <path
              d="M329 18 H340 V52 H356 V62 H329 Z"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="2.5"
              strokeLinejoin="miter"
            />
            {/* O */}
            <path
              d="M369 18 H388 L397 32 V48 L388 62 H369 L360 48 V32 Z M371 28 L368 33 V47 L371 52 H385 L388 47 V33 L385 28 Z"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="2.5"
              strokeLinejoin="miter"
            />
            {/* T */}
            <path
              d="M400 18 H429 V28 H420 V62 H409 V28 H400 Z"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="2.5"
              strokeLinejoin="miter"
            />
          </g>

          {/* ======================================================== */}
          {/* 4-POINT STAR SPARKLE ACCENT (Matches the reference)      */}
          {/* ======================================================== */}
          <g transform="translate(422, 12)">
            <path
              d="M0 -9 Q0 0 9 0 Q0 0 0 9 Q0 0 -9 0 Q0 0 0 -9 Z"
              fill="#FFE600"
              stroke="#000000"
              strokeWidth="1.8"
            />
          </g>
        </g>

        {/* Micro-tagline under CAREER (Just like in the reference image) */}
        {showTagline && (
          <text
            x="12"
            y="78"
            fill="#000000"
            fontSize="8"
            fontFamily="'Geist Mono', monospace"
            fontWeight="900"
            letterSpacing="2.8"
          >
            AUTONOMOUS • EVIDENCE • INTELLIGENCE
          </text>
        )}
      </svg>
    </div>
  );
}
