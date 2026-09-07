'use client';

import React from 'react';
import { Language } from '@/types/tts';

interface NavigationHeaderProps {
  currentTab: 'studio' | 'voicelab' | 'developer' | 'pricing';
  onSelectTab: (tab: 'studio' | 'voicelab' | 'developer' | 'pricing') => void;
  lang: Language;
  onToggleLang: () => void;
  creditsRemaining: number;
  creditsTotal: number;
  onOpenTopUp: () => void;
}

export default function NavigationHeader({
  currentTab,
  onSelectTab,
  lang,
  onToggleLang,
  creditsRemaining,
  creditsTotal,
  onOpenTopUp,
}: NavigationHeaderProps) {
  return (
    <nav className="h-14 border-b border-stone-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 w-full flex items-center justify-between px-4 sm:px-6 select-none transition-colors">
      <div className="flex items-center gap-6 lg:gap-8">
        {/* Brand Logo - ElevenLabs Minimalist Audio Mark */}
        <div
          onClick={() => onSelectTab('studio')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 bg-stone-900 text-stone-50 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
            <svg
              className="w-4 h-4 text-stone-100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M4 12h1M8 8v8M12 4v16M16 7v10M20 12h1" />
            </svg>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-light text-base sm:text-lg tracking-tight text-stone-900">
              {lang === 'ne' ? 'कथा' : 'Katha'}<span className="font-medium text-stone-950">AI</span>
            </span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-stone-400 hidden sm:inline">
              Alphanex
            </span>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-normal text-stone-500 h-14 tracking-wide">
          <button
            onClick={() => onSelectTab('studio')}
            id="nav-tab-studio"
            className={`h-full flex items-center transition-colors cursor-pointer ${
              currentTab === 'studio'
                ? 'text-stone-950 font-medium border-b-2 border-stone-950'
                : 'hover:text-stone-900'
            }`}
          >
            {lang === 'ne' ? 'स्टुडियो (Studio)' : 'Studio'}
          </button>

          <button
            onClick={() => onSelectTab('voicelab')}
            id="nav-tab-voicelab"
            className={`h-full flex items-center transition-colors cursor-pointer ${
              currentTab === 'voicelab'
                ? 'text-stone-950 font-medium border-b-2 border-stone-950'
                : 'hover:text-stone-900'
            }`}
          >
            {lang === 'ne' ? 'भ्वाइस ल्याब (Voice Lab)' : 'Voice Lab'}
          </button>

          <button
            onClick={() => onSelectTab('developer')}
            id="nav-tab-developer"
            className={`h-full flex items-center transition-colors cursor-pointer ${
              currentTab === 'developer'
                ? 'text-stone-950 font-medium border-b-2 border-stone-950'
                : 'hover:text-stone-900'
            }`}
          >
            {lang === 'ne' ? 'डेभलपर एपीआई (Dev API)' : 'Dev API'}
          </button>

          <button
            onClick={() => onSelectTab('pricing')}
            id="nav-tab-pricing"
            className={`h-full flex items-center transition-colors cursor-pointer ${
              currentTab === 'pricing'
                ? 'text-stone-950 font-medium border-b-2 border-stone-950'
                : 'hover:text-stone-900'
            }`}
          >
            {lang === 'ne' ? 'मूल्य तथा योजना (Pricing)' : 'Pricing'}
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Credits Badge - Tactile Pill */}
        <div
          onClick={onOpenTopUp}
          id="credits-pill-badge"
          className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200/70 px-3 py-1 rounded-full border border-stone-200/80 cursor-pointer transition-colors"
          title="Click to top up character quota"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono text-stone-700">
            {creditsRemaining.toLocaleString()} / {(creditsTotal / 1000).toFixed(0)}k
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenTopUp();
            }}
            id="header-topup-btn"
            className="text-[10px] font-medium bg-stone-900 hover:bg-black text-stone-50 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
          >
            TOP UP
          </button>
        </div>

        <div className="h-4 w-px bg-stone-200 hidden sm:block mx-0.5" />

        {/* Bilingual Switcher */}
        <button
          onClick={onToggleLang}
          id="bilingual-language-toggle"
          className="text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1 rounded-full border border-stone-200/80 transition-colors cursor-pointer"
          title="Switch UI language (नेपाली / EN)"
        >
          {lang === 'ne' ? 'नेपाली' : 'EN'}
        </button>

        {/* Profile Avatar */}
        <div
          onClick={onOpenTopUp}
          className="w-8 h-8 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center text-xs font-medium border border-stone-300 shadow-sm cursor-pointer hover:ring-2 hover:ring-stone-400 transition-all shrink-0"
          title="Account Status: Creator Tier"
        >
          K
        </div>
      </div>
    </nav>
  );
}
