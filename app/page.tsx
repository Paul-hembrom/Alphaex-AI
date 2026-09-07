'use client';

import React, { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import NavigationHeader from '@/components/NavigationHeader';
import AudioPlayerWithKaraoke from '@/components/AudioPlayerWithKaraoke';
import VoiceLab from '@/components/VoiceLab';
import DeveloperPortal from '@/components/DeveloperPortal';
import PricingModal from '@/components/PricingModal';
import {
  INDIC_VOICES,
  PRESET_PROMPTS,
  convertToDevanagariNumerals,
  generateNepaliTTS,
} from '@/lib/audioSynthesis';
import {
  IndicVoice,
  Language,
  TTSGenerationResult,
  TTSRequestOptions,
} from '@/types/tts';
import {
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  Volume2,
  Trash2,
  Wand2,
  Play,
  RotateCcw,
  Check,
  Zap,
  Info,
  Layers,
  History,
  Clock,
  Radio,
  Share2,
} from 'lucide-react';

export default function HomePage() {
  // Safe hydration check for Vercel/Next.js client-side
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // App Navigation & Language
  const [currentTab, setCurrentTab] = useState<'studio' | 'voicelab' | 'developer' | 'pricing'>('studio');
  const [lang, setLang] = useState<Language>('ne');

  // Credits management
  const [creditsRemaining, setCreditsRemaining] = useState<number>(48250);
  const [creditsTotal, setCreditsTotal] = useState<number>(50000);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [pricingModalMode, setPricingModalMode] = useState<'plans' | 'topup'>('plans');

  // Speech Studio State
  const [inputText, setInputText] = useState<string>(PRESET_PROMPTS[1].text);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('amrita');
  const [customParlerPrompt, setCustomParlerPrompt] = useState<string>('');

  // Voice Tuning Settings (Collapsible Drawer)
  const [isTuningOpen, setIsTuningOpen] = useState(false);
  const [pacingMultiplier, setPacingMultiplier] = useState<number>(1.0); // 0.5x to 2.0x
  const [temperature, setTemperature] = useState<number>(0.35); // 0.1 to 1.0
  const [repetitionPenalty, setRepetitionPenalty] = useState<number>(1.15); // 1.0 to 2.0
  const [topK, setTopK] = useState<number>(50); // 10 to 100

  // Audio Generation & Result
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGeneration, setCurrentGeneration] = useState<TTSGenerationResult | null>(null);
  const [generationHistory, setGenerationHistory] = useState<TTSGenerationResult[]>([]);

  useEffect(() => {
    let active = true;
    generateNepaliTTS({
      text: PRESET_PROMPTS[1].text,
      voiceId: 'amrita',
      pacingMultiplier: 1.0,
      temperature: 0.35,
      repetitionPenalty: 1.15,
      topK: 50,
    })
      .then((initialResult) => {
        if (active) {
          setCurrentGeneration(initialResult);
          setGenerationHistory([initialResult]);
        }
      })
      .catch((e) => {
        console.error('Initial synthesis setup failed:', e);
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedVoice = useMemo(() => {
    return INDIC_VOICES.find((v) => v.id === selectedVoiceId) || INDIC_VOICES[0];
  }, [selectedVoiceId]);

  // Real-time character & token calculation
  const charCount = inputText.length;
  const tokenEstimate = Math.ceil(charCount / 3.2);

  // Format & Clean Numerals (0-9 -> ०-९)
  const handleFormatNumerals = () => {
    const formatted = convertToDevanagariNumerals(inputText);
    setInputText(formatted);
  };

  const handleClearText = () => {
    setInputText('');
  };

  const handlePastePreset = (presetText: string) => {
    setInputText(presetText);
  };

  const handleResetTuning = () => {
    setPacingMultiplier(1.0);
    setTemperature(0.35);
    setRepetitionPenalty(1.15);
    setTopK(50);
  };

  const handleGenerateAudio = async () => {
    if (!inputText.trim() || isGenerating) return;

    if (charCount > creditsRemaining) {
      setPricingModalMode('topup');
      setIsPricingModalOpen(true);
      return;
    }

    setIsGenerating(true);

    try {
      const options: TTSRequestOptions = {
        text: inputText,
        voiceId: selectedVoiceId,
        pacingMultiplier,
        temperature,
        repetitionPenalty,
        topK,
        customPrompt: selectedVoiceId === 'custom_indic_parler' ? customParlerPrompt : undefined,
      };

      const result = await generateNepaliTTS(options);
      setCurrentGeneration(result);
      setGenerationHistory((prev) => [result, ...prev.slice(0, 9)]);

      // Deduct credits
      setCreditsRemaining((prev) => Math.max(0, prev - result.charactersUsed));
    } catch (err) {
      console.error('TTS Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectCustomVoicePrompt = (prompt: string, voiceName: string) => {
    setSelectedVoiceId('custom_indic_parler');
    setCustomParlerPrompt(prompt);
    setCurrentTab('studio');
  };

  const handleAddCredits = (amount: number, tierName: string) => {
    setCreditsRemaining((prev) => prev + amount);
    setCreditsTotal((prev) => prev + amount);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center text-slate-400 font-mono text-sm">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <span>लोडिङ कथा AI (Initializing Alphanex Indic Studio)...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Universal Navigation & Header */}
      <NavigationHeader
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'pricing') {
            setPricingModalMode('plans');
            setIsPricingModalOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'ne' ? 'en' : 'ne'))}
        creditsRemaining={creditsRemaining}
        creditsTotal={creditsTotal}
        onOpenTopUp={() => {
          setPricingModalMode('topup');
          setIsPricingModalOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* VIEW 1: STUDIO (Speech Synthesis) */}
        {currentTab === 'studio' && (
          <div id="studio-main-view" className="space-y-8 animate-fadeIn">
            {/* Top Intro Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  {lang === 'ne' ? 'नेपाली वाक् संश्लेषण स्टुडियो' : 'Nepali Speech Synthesis Studio'}
                </h1>
                <p className="text-xs md:text-sm text-slate-400 mt-1">
                  {lang === 'ne'
                    ? 'इलेभेनल्याब्स सरहको शुद्ध नेपाली उच्चारण, सटीक भावभङ्गी र प्रत्यक्ष काराओके सबटाइटल।'
                    : 'ElevenLabs-grade expressive Indic synthesis, MMS forced alignment, and instant voice timbre customization.'}
                </p>
              </div>

              {/* Quick Preset Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-500 font-mono mr-1">
                  {lang === 'ne' ? 'नमुना पाठ:' : 'Presets:'}
                </span>
                {PRESET_PROMPTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePastePreset(p.text)}
                    id={`preset-prompt-${p.id}`}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
                  >
                    {lang === 'ne' ? p.titleNe : p.titleEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Workbench Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Input Textarea & Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Textarea Card */}
                <div className="bg-[#111622] rounded-2xl border border-slate-800/80 p-5 md:p-6 shadow-xl relative focus-within:border-emerald-500/60 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_6px_#10b981]" />
                      {lang === 'ne' ? 'देवनागरी पाठ इनपुट' : 'Text Input (Devanagari)'}
                    </label>

                    {/* Helper buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleFormatNumerals}
                        id="convert-numerals-btn"
                        className="text-[10px] bg-[#10b981]/15 text-[#10b981] px-2.5 py-1 rounded-md border border-[#10b981]/30 font-bold hover:bg-[#10b981]/25 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Convert English numbers 0-9 to Devanagari ०-९"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>{lang === 'ne' ? '०-९ अंक रूपान्तरण' : 'Format ०-९'}</span>
                      </button>

                      <button
                        onClick={handleClearText}
                        className="text-slate-500 hover:text-slate-300 p-1 rounded transition-colors"
                        title="Clear Text"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Main Rich Textarea with floating token & cost pill */}
                  <div className="relative">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={
                        lang === 'ne'
                          ? 'यहाँ नेपालीमा टाइप गर्नुहोस् वा माथिका नमुना पाठहरू मध्ये कुनै एक छान्नुहोस्...'
                          : 'Enter Devanagari script here, or choose a preset above...'
                      }
                      rows={6}
                      id="nepali-tts-input-textarea"
                      className="w-full bg-[#0a0d14]/90 text-slate-100 text-base md:text-lg rounded-xl p-4 pb-12 border border-slate-800/80 focus:outline-none focus:border-[#10b981]/60 focus:ring-1 focus:ring-[#10b981]/40 leading-relaxed resize-y placeholder-slate-600 font-sans"
                    />

                    {/* Floating badge over bottom-right of textarea container */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-3 bg-slate-900/90 backdrop-blur px-3 py-1 rounded-lg border border-slate-700/50 shadow-lg pointer-events-none">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        Tokens: <strong className="text-slate-200">{tokenEstimate}</strong>
                      </span>
                      <span className="text-[10px] font-mono text-[#10b981] uppercase font-semibold">
                        Est: रू {(charCount * 0.005).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Character & Token Counters */}
                  <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-3">
                      <span>
                        <strong className="text-slate-200">{charCount}</strong> {lang === 'ne' ? 'अक्षर' : 'chars'}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span>
                        ~<strong className="text-slate-200">{tokenEstimate}</strong> {lang === 'ne' ? 'टोकन' : 'tokens'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[#10b981]">
                      <Zap className="w-3.5 h-3.5" />
                      <span>
                        {lang === 'ne'
                          ? `क्रेडिट खपत: ${charCount} Chars`
                          : `Cost: ${charCount} Chars`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Voice Selection Card */}
                <div className="bg-[#111622] rounded-2xl border border-slate-800/80 p-5 md:p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-[#10b981]" />
                      {lang === 'ne' ? 'आवाज छनोट (Voice Selection)' : 'Speaker Profile'}
                    </label>
                    <span className="text-xs text-slate-500 font-mono">
                      {INDIC_VOICES.length} Models Available
                    </span>
                  </div>

                  {/* Voice Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {INDIC_VOICES.map((voice) => {
                      const isSelected = selectedVoiceId === voice.id;
                      return (
                        <div
                          key={voice.id}
                          onClick={() => setSelectedVoiceId(voice.id)}
                          id={`voice-option-${voice.id}`}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all relative overflow-hidden ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#161f2e] to-[#111622] border-[#10b981]/80 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-10 h-10 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center font-bold text-[#10b981] shadow-sm shrink-0"
                            >
                              {voice.nameNe.slice(0, 1)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className="font-bold text-slate-100 text-sm truncate">
                                  {voice.nameNe}{' '}
                                  <span className="text-xs font-normal text-slate-400">
                                    ({voice.nameEn})
                                  </span>
                                </p>
                                {isSelected && (
                                  <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
                                )}
                              </div>
                              <p className="text-xs text-[#10b981] mt-0.5 truncate font-medium">
                                {lang === 'ne' ? voice.roleNe : voice.roleEn}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                                {lang === 'ne' ? voice.descriptionNe : voice.descriptionEn}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom Parler Prompt input if custom voice is selected */}
                  {selectedVoiceId === 'custom_indic_parler' && (
                    <div className="p-4 rounded-xl bg-[#0a0d14] border border-cyan-500/40 animate-fadeIn space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-cyan-300 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          {lang === 'ne'
                            ? 'इन्डिक-पार्लर शून्य-नमूना कन्डिसनिङ प्रम्प्ट'
                            : 'Indic-Parler Zero-Shot Vocal Conditioning'}
                        </label>
                        <button
                          onClick={() => setCurrentTab('voicelab')}
                          className="text-[11px] text-cyan-400 hover:underline"
                        >
                          {lang === 'ne' ? 'भ्वाइस ल्याबमा खोल्नुहोस् →' : 'Open in Voice Lab →'}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={customParlerPrompt}
                        onChange={(e) => setCustomParlerPrompt(e.target.value)}
                        placeholder="A calm female speaker with Kathmandu Urban accent recorded in a soundproof studio..."
                        className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                  )}

                  {/* Voice Tuning Panel (Collapsible Drawer) */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => setIsTuningOpen(!isTuningOpen)}
                      id="toggle-tuning-drawer-btn"
                      className="w-full py-2 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <span className="flex items-center gap-1.5 font-medium">
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        {lang === 'ne'
                          ? 'स्वर परिमार्जन र गति सेटिङहरू (Voice Tuning Panel)'
                          : 'Voice Tuning & Inference Hyperparameters'}
                      </span>
                      {isTuningOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </button>

                    {isTuningOpen && (
                      <div className="p-4 mt-2 rounded-xl bg-[#0a0d14] border border-slate-800/80 space-y-4 animate-fadeIn">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-400">
                            {lang === 'ne' ? 'परामिटर समायोजन' : 'Acoustic Control'}
                          </span>
                          <button
                            onClick={handleResetTuning}
                            className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{lang === 'ne' ? 'पूर्वनिर्धारित' : 'Reset Defaults'}</span>
                          </button>
                        </div>

                        {/* Slider 1: Pacing / Pause Multiplier (0.5x to 2.0x) */}
                        <div>
                          <div className="flex justify-between text-xs mb-1 font-mono">
                            <span className="text-slate-300">
                              {lang === 'ne' ? 'वाचन गति (Pacing Multiplier)' : 'Pacing / Pause Multiplier'}
                            </span>
                            <span className="text-emerald-400 font-bold">{pacingMultiplier.toFixed(2)}x</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.05"
                            value={pacingMultiplier}
                            onChange={(e) => setPacingMultiplier(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-400"
                          />
                          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                            <span>0.5x (Slow)</span>
                            <span>1.0x (Standard)</span>
                            <span>2.0x (Fast)</span>
                          </div>
                        </div>

                        {/* Slider 2: Temperature / Expression Exaggeration (0.1 to 1.0) */}
                        <div>
                          <div className="flex justify-between text-xs mb-1 font-mono">
                            <span className="text-slate-300">
                              {lang === 'ne' ? 'भावको तीव्रता (Expression Temperature)' : 'Expression Exaggeration'}
                            </span>
                            <span className="text-cyan-400 font-bold">{temperature.toFixed(2)}</span>
                          </div>
                          <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.05"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
                          />
                          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                            <span>0.1 (Precise)</span>
                            <span>0.5 (Balanced)</span>
                            <span>1.0 (Dramatic)</span>
                          </div>
                        </div>

                        {/* Slider 3: Repetition Penalty & Top-K */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between text-xs mb-1 font-mono">
                              <span className="text-slate-300">Repetition Penalty</span>
                              <span className="text-slate-400">{repetitionPenalty.toFixed(2)}</span>
                            </div>
                            <input
                              type="range"
                              min="1.0"
                              max="2.0"
                              step="0.05"
                              value={repetitionPenalty}
                              onChange={(e) => setRepetitionPenalty(parseFloat(e.target.value))}
                              className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-slate-400"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-xs mb-1 font-mono">
                              <span className="text-slate-300">Top-K</span>
                              <span className="text-slate-400">{topK}</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              step="5"
                              value={topK}
                              onChange={(e) => setTopK(parseInt(e.target.value, 10))}
                              className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-slate-400"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* High-visibility CTA button: "ध्वनि उत्पन्न गर्नुहोस्" */}
                  <button
                    onClick={handleGenerateAudio}
                    disabled={isGenerating || !inputText.trim()}
                    id="generate-nepali-audio-btn"
                    className="glow-button w-full py-4 rounded-xl bg-[#10b981] hover:bg-emerald-400 text-slate-950 font-extrabold text-sm md:text-base flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                  >
                    {isGenerating ? (
                      <>
                        <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span className="animate-pulse">
                          {lang === 'ne' ? 'आवाज उत्पन्न हुँदैछ...' : 'Synthesizing Nepali Speech...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 fill-slate-950" />
                        <span>
                          {lang === 'ne'
                            ? 'ध्वनि उत्पन्न गर्नुहोस् (Generate Audio)'
                            : 'Generate Nepali Audio'}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Creator Tier Active Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#10b981]/10 to-transparent border border-[#10b981]/20 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#10b981] uppercase tracking-wider">Creator Tier Active</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {creditsRemaining.toLocaleString()} {lang === 'ne' ? 'अक्षरहरू बाँकी' : 'characters remaining'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setPricingModalMode('topup');
                          setIsPricingModalOpen(true);
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#10b981] border border-[#10b981]/30 font-bold transition-all cursor-pointer"
                      >
                        {lang === 'ne' ? 'क्रेडिट थप्नुहोस्' : 'Top Up'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Audio Player & Synchronous Karaoke Word Highlighting (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <AudioPlayerWithKaraoke
                  generation={currentGeneration}
                  isGenerating={isGenerating}
                  lang={lang}
                />

                {/* Recent Synthesis History card */}
                {generationHistory.length > 0 && (
                  <div className="bg-[#111622] rounded-2xl border border-slate-800/80 p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <History className="w-3.5 h-3.5 text-[#06b6d4]" />
                        {lang === 'ne' ? 'हालै संश्लेषित इतिहास' : 'Recent Generations'}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {generationHistory.length} Sessions
                      </span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {generationHistory.map((gen) => (
                        <div
                          key={gen.id}
                          onClick={() => {
                            setCurrentGeneration(gen);
                            setInputText(gen.rawText);
                          }}
                          className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                            currentGeneration?.id === gen.id
                              ? 'bg-slate-900 border-[#10b981]/50'
                              : 'bg-slate-900/50 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-slate-200 truncate">
                              {gen.rawText}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2 font-mono">
                              <span className="text-[#10b981] font-semibold">{gen.voice.nameNe}</span>
                              <span>•</span>
                              <span>{gen.duration.toFixed(1)}s</span>
                              <span>•</span>
                              <span>{gen.createdAt}</span>
                            </p>
                          </div>
                          <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                            <Play className="w-3 h-3 translate-x-0.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: VOICE LAB & CLONING */}
        {currentTab === 'voicelab' && (
          <div className="animate-fadeIn">
            <VoiceLab
              lang={lang}
              onSelectCustomVoicePrompt={handleSelectCustomVoicePrompt}
            />
          </div>
        )}

        {/* VIEW 3: DEVELOPER API */}
        {currentTab === 'developer' && (
          <div className="animate-fadeIn">
            <DeveloperPortal lang={lang} />
          </div>
        )}
      </main>

      {/* Immersive UI Footer */}
      <footer className="h-14 bg-[#0d111b] border-t border-slate-800 px-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono gap-2 mt-auto">
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_6px_#10b981]" />
            Status: <span className="text-[#10b981] font-semibold">Systems Operational</span>
          </span>
          <span>API v2.4.1</span>
          <span>© 2025 Alphanex Technologies, Nepal</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentTab('developer')}
            className="hover:text-white cursor-pointer transition-colors"
          >
            Documentation
          </button>
          <button
            onClick={() => {
              setPricingModalMode('plans');
              setIsPricingModalOpen(true);
            }}
            className="hover:text-white cursor-pointer transition-colors"
          >
            Plans
          </button>
          <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
        </div>
      </footer>

      {/* Pricing & Checkout Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        lang={lang}
        onAddCredits={handleAddCredits}
        initialMode={pricingModalMode}
      />
    </div>
  );
}
