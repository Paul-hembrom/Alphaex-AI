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
    <nav className="h-14 border-b border-slate-800/80 bg-[#0d111b] sticky top-0 z-40 w-full flex items-center justify-between px-4 sm:px-6 select-none">
      <div className="flex items-center gap-6 lg:gap-8">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectTab('studio')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
            <svg
              className="w-5 h-5 text-[#10b981]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 3v18M8 8v8M4 11v2M16 10v4M20 12v0" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            {lang === 'ne' ? 'अल्फानेक्स' : 'Alphanex'}{' '}
            <span className="text-[#10b981]">AI</span>
          </span>
        </div>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400 h-14">
          <button
            onClick={() => onSelectTab('studio')}
            id="nav-tab-studio"
            className={`h-full flex items-center transition-colors cursor-pointer ${
              currentTab === 'studio'
                ? 'text-white border-b-2 border-[#10b981]'
                : 'hover:text-slate-200'
            }`}
          >
            {lang === 'ne' ? 'स्टुडियो (Studio)' : 'Studio'}
          </button>

          <button
            onClick={() => onSelectTab('voicelab')}
            id="nav-tab-voicelab"
            className={`h-full flex items-center transition-colors cursor-pointer ${
              currentTab === 'voicelab'
                ? 'text-white border-b-2 border-[#10b981]'
                : 'hover:text-slate-200'
            }`}
          >
            {lang === 'ne' ? 'भ्वाइस ल्याब (Voice Lab)' : 'Voice Lab'}
          </button>

          <button
            onClick={() => onSelectTab('developer')}
            id="nav-tab-developer"
            className={`h-full flex items-center transition-colors cursor-pointer ${
              currentTab === 'developer'
                ? 'text-white border-b-2 border-[#10b981]'
                : 'hover:text-slate-200'
            }`}
          >
            {lang === 'ne' ? 'डेभलपर एपीआई (Dev API)' : 'Dev API'}
          </button>

          <button
            onClick={() => onSelectTab('pricing')}
            id="nav-tab-pricing"
            className={`h-full flex items-center transition-colors cursor-pointer ${
              currentTab === 'pricing'
                ? 'text-white border-b-2 border-[#10b981]'
                : 'hover:text-slate-200'
            }`}
          >
            {lang === 'ne' ? 'मूल्य तथा योजना (Pricing)' : 'Pricing'}
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Credits Badge */}
        <div
          onClick={onOpenTopUp}
          id="credits-pill-badge"
          className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
          title="Click to top up character quota"
        >
          <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-xs font-mono text-slate-300">
            {creditsRemaining.toLocaleString()} / {(creditsTotal / 1000).toFixed(0)}k Chars
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenTopUp();
            }}
            id="header-topup-btn"
            className="ml-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 hover:bg-emerald-500/25 transition-colors cursor-pointer"
          >
            TOP UP
          </button>
        </div>

        <div className="h-6 w-px bg-slate-800 hidden sm:block mx-1" />

        {/* Bilingual Switcher */}
        <button
          onClick={onToggleLang}
          id="bilingual-language-toggle"
          className="text-xs font-bold bg-slate-800 text-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700/50"
          title="Switch UI language (नेपाली / EN)"
        >
          {lang === 'ne' ? 'नेपाली' : 'EN'}
        </button>

        {/* Profile Avatar */}
        <div
          onClick={onOpenTopUp}
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#06b6d4] to-[#10b981] border border-white/10 shrink-0 cursor-pointer shadow-sm hover:ring-2 hover:ring-emerald-500/40 transition-all"
          title="Account Status: Creator Tier"
        />
      </div>
    </nav>
  );
}
