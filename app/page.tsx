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
  generateSpeech,
  checkCredits,
  normalizeBackendVoiceId,
} from '@/lib/api-client';
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
  const [ttsNotice, setTtsNotice] = useState<string | null>(null);

  // Sync real credits on mount from /api/credits
  useEffect(() => {
    checkCredits()
      .then((data) => {
        if (typeof data.credits === 'number') {
          setCreditsRemaining(data.credits);
        }
      })
      .catch(() => {
        // Keep initial demo credits
      });
  }, []);

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
    setTtsNotice(null);

    try {
      // 1. Attempt live FastAPI backend synthesis via Next.js proxy
      const backendVoice = normalizeBackendVoiceId(selectedVoiceId);
      const speechRes = await generateSpeech({
        text: inputText,
        voice_id: backendVoice,
        custom_prompt:
          selectedVoiceId === 'custom_indic_parler' ? customParlerPrompt : null,
        temperature,
      });

      const audioDuration =
        speechRes.duration && speechRes.duration > 0
          ? speechRes.duration
          : speechRes.timestamps.length > 0
          ? speechRes.timestamps[speechRes.timestamps.length - 1].end
          : 0;

      const liveResult: TTSGenerationResult = {
        id: `syn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        audioBlobUrl: speechRes.audioUrl,
        duration: audioDuration,
        timestamps: speechRes.timestamps,
        charactersUsed: inputText.length,
        tokensCount: tokenEstimate,
        createdAt: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        voice: selectedVoice,
        rawText: inputText,
      };

      setCurrentGeneration(liveResult);
      setGenerationHistory((prev) => [liveResult, ...prev.slice(0, 9)]);

      // Update remaining credits from response body if returned
      if (typeof speechRes.remainingCredits === 'number') {
        setCreditsRemaining(speechRes.remainingCredits);
      } else {
        setCreditsRemaining((prev) => Math.max(0, prev - liveResult.charactersUsed));
      }
    } catch (apiErr: unknown) {
      console.warn('Live HF Space synthesis notice:', apiErr);

      // 2. High-fidelity resilient fallback when Hugging Face T4 GPU is cold-starting or offline
      try {
        const options: TTSRequestOptions = {
          text: inputText,
          voiceId: selectedVoiceId,
          pacingMultiplier,
          temperature,
          repetitionPenalty,
          topK,
          customPrompt:
            selectedVoiceId === 'custom_indic_parler' ? customParlerPrompt : undefined,
        };

        const fallbackResult = await generateNepaliTTS(options);
        setCurrentGeneration(fallbackResult);
        setGenerationHistory((prev) => [fallbackResult, ...prev.slice(0, 9)]);
        setCreditsRemaining((prev) =>
          Math.max(0, prev - fallbackResult.charactersUsed)
        );

        setTtsNotice(
          lang === 'ne'
            ? 'HF स्पेस सक्रिय हुँदैछ। उच्च गुणस्तरीय स्थानीय इन्जिनमार्फत अडियो तयार पारियो।'
            : 'Hugging Face Space is cold starting (T4 waking up). Synthesized with local high-fidelity audio engine.'
        );
        setTimeout(() => setTtsNotice(null), 7000);
      } catch (fallbackError) {
        console.error('Fallback synthesis failed:', fallbackError);
      }
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
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center text-stone-500 font-mono text-sm">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-stone-900 animate-ping" />
          <span>लोडिङ कथा AI (Initializing KathaAI Indic Studio)...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col selection:bg-stone-900 selection:text-stone-50 relative overflow-x-hidden font-sans">
      {/* Background Soft Atmospheric Gradients (ElevenLabs Signature Aesthetic) */}
      <div className="fixed top-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-[#a7e5d3] opacity-25 blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#f4c5a8] opacity-20 blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-[#c8b8e0] opacity-20 blur-3xl pointer-events-none -z-10" />

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
        onToggleLang={() => setLang(lang === 'ne' ? 'en' : 'ne')}
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200/80">
              <div>
                <h1 className="text-xl md:text-2xl font-light tracking-tight text-stone-900 flex items-center gap-2.5">
                  <span className="p-1.5 rounded-xl bg-stone-100 text-stone-800 border border-stone-200 shadow-xs">
                    <Sparkles className="w-4 h-4 text-stone-700" />
                  </span>
                  <span>{lang === 'ne' ? 'नेपाली वाक् संश्लेषण स्टुडियो' : 'Nepali Speech Synthesis Studio'}</span>
                </h1>
                <p className="text-xs md:text-sm text-stone-500 mt-1 font-normal">
                  {lang === 'ne'
                    ? 'इलेभेनल्याब्स सरहको शुद्ध नेपाली उच्चारण, सटीक भावभङ्गी र प्रत्यक्ष काराओके सबटाइटल।'
                    : 'ElevenLabs-grade expressive Indic synthesis, MMS forced alignment, and instant voice timbre customization.'}
                </p>
              </div>

              {/* Quick Preset Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-stone-400 font-mono mr-1">
                  {lang === 'ne' ? 'नमुना पाठ:' : 'Presets:'}
                </span>
                {PRESET_PROMPTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePastePreset(p.text)}
                    id={`preset-prompt-${p.id}`}
                    className="text-xs px-3 py-1 rounded-full bg-white hover:bg-stone-100 border border-stone-200/80 text-stone-700 shadow-xs transition-colors cursor-pointer"
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
                <div className="bg-white rounded-3xl border border-stone-200/80 p-5 md:p-6 shadow-editorial relative focus-within:border-stone-400 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-800" />
                      {lang === 'ne' ? 'देवनागरी पाठ इनपुट' : 'Text Input (Devanagari)'}
                    </label>

                    {/* Helper buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleFormatNumerals}
                        id="convert-numerals-btn"
                        className="text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1 rounded-full border border-stone-200 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        title="Convert English numbers 0-9 to Devanagari ०-९"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>{lang === 'ne' ? '०-९ अंक रूपान्तरण' : 'Format ०-९'}</span>
                      </button>

                      <button
                        onClick={handleClearText}
                        className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
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
                      className="w-full bg-stone-50/70 text-stone-900 text-base md:text-lg rounded-2xl p-4 pb-12 border border-stone-200/80 focus:outline-none focus:border-stone-400 focus:bg-white leading-relaxed resize-y placeholder-stone-400 font-sans transition-all"
                    />

                    {/* Floating badge over bottom-right of textarea container */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-2.5 bg-white/90 backdrop-blur px-3 py-1 rounded-full border border-stone-200 shadow-xs pointer-events-none">
                      <span className="text-[10px] font-mono text-stone-500 uppercase">
                        Tokens: <strong className="text-stone-800">{tokenEstimate}</strong>
                      </span>
                      <span className="text-[10px] font-mono text-stone-800 uppercase font-semibold">
                        Est: रू {(charCount * 0.005).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Character & Token Counters */}
                  <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 font-mono">
                    <div className="flex items-center gap-3">
                      <span>
                        <strong className="text-stone-800">{charCount}</strong> {lang === 'ne' ? 'अक्षर' : 'chars'}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span>
                        ~<strong className="text-stone-800">{tokenEstimate}</strong> {lang === 'ne' ? 'टोकन' : 'tokens'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-stone-700">
                      <Zap className="w-3.5 h-3.5 text-stone-900" />
                      <span>
                        {lang === 'ne'
                          ? `क्रेडिट खपत: ${charCount} Chars`
                          : `Cost: ${charCount} Chars`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Voice Selection Card */}
                <div className="bg-white rounded-3xl border border-stone-200/80 p-5 md:p-6 shadow-editorial space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-stone-900" />
                      {lang === 'ne' ? 'आवाज छनोट (Voice Selection)' : 'Speaker Profile'}
                    </label>
                    <span className="text-xs text-stone-400 font-mono">
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
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
                            isSelected
                              ? 'bg-stone-50 border-stone-900 shadow-xs ring-1 ring-stone-900'
                              : 'bg-white border-stone-200/80 hover:border-stone-300 hover:bg-stone-50/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-medium shadow-xs shrink-0 ${
                                isSelected
                                  ? 'bg-stone-900 text-stone-50'
                                  : 'bg-stone-100 text-stone-700 border border-stone-200'
                              }`}
                            >
                              {voice.nameNe.slice(0, 1)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className="font-medium text-stone-900 text-sm truncate">
                                  {voice.nameNe}{' '}
                                  <span className="text-xs font-normal text-stone-400">
                                    ({voice.nameEn})
                                  </span>
                                </p>
                                {isSelected && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-stone-900" />
                                )}
                              </div>
                              <p className="text-xs text-stone-600 mt-0.5 truncate font-medium">
                                {lang === 'ne' ? voice.roleNe : voice.roleEn}
                              </p>
                              <p className="text-[11px] text-stone-400 mt-1 line-clamp-2 leading-tight font-normal">
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
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 animate-fadeIn space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-stone-700 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          {lang === 'ne'
                            ? 'इन्डिक-पार्लर शून्य-नमूना कन्डिसनिङ प्रम्प्ट'
                            : 'Indic-Parler Zero-Shot Vocal Conditioning'}
                        </label>
                        <button
                          onClick={() => setCurrentTab('voicelab')}
                          className="text-[11px] text-stone-600 hover:text-stone-950 underline"
                        >
                          {lang === 'ne' ? 'भ्वाइस ल्याबमा खोल्नुहोस् →' : 'Open in Voice Lab →'}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={customParlerPrompt}
                        onChange={(e) => setCustomParlerPrompt(e.target.value)}
                        placeholder="A calm female speaker with Kathmandu Urban accent recorded in a soundproof studio..."
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-800 focus:outline-none focus:border-stone-400 font-mono shadow-xs"
                      />
                    </div>
                  )}

                  {/* Voice Tuning Panel (Collapsible Drawer) */}
                  <div className="pt-2 border-t border-stone-100">
                    <button
                      onClick={() => setIsTuningOpen(!isTuningOpen)}
                      id="toggle-tuning-drawer-btn"
                      className="w-full py-2 flex items-center justify-between text-xs text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 font-medium">
                        <Sliders className="w-3.5 h-3.5 text-stone-700" />
                        {lang === 'ne'
                          ? 'स्वर परिमार्जन र गति सेटिङहरू (Voice Tuning Panel)'
                          : 'Voice Tuning & Inference Hyperparameters'}
                      </span>
                      {isTuningOpen ? (
                        <ChevronUp className="w-4 h-4 text-stone-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-stone-400" />
                      )}
                    </button>

                    {isTuningOpen && (
                      <div className="p-4 mt-2 rounded-2xl bg-stone-50/80 border border-stone-200/80 space-y-4 animate-fadeIn">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-stone-500 font-medium">
                            {lang === 'ne' ? 'परामिटर समायोजन' : 'Acoustic Control'}
                          </span>
                          <button
                            onClick={handleResetTuning}
                            className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{lang === 'ne' ? 'पूर्वनिर्धारित' : 'Reset Defaults'}</span>
                          </button>
                        </div>

                        {/* Slider 1: Pacing / Pause Multiplier (0.5x to 2.0x) */}
                        <div>
                          <div className="flex justify-between text-xs mb-1 font-mono">
                            <span className="text-stone-600">
                              {lang === 'ne' ? 'वाचन गति (Pacing Multiplier)' : 'Pacing / Pause Multiplier'}
                            </span>
                            <span className="text-stone-900 font-semibold">{pacingMultiplier.toFixed(2)}x</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.05"
                            value={pacingMultiplier}
                            onChange={(e) => setPacingMultiplier(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-stone-200 rounded-full appearance-none cursor-pointer accent-stone-900"
                          />
                          <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-0.5">
                            <span>0.5x (Slow)</span>
                            <span>1.0x (Standard)</span>
                            <span>2.0x (Fast)</span>
                          </div>
                        </div>

                        {/* Slider 2: Temperature / Expression Exaggeration (0.1 to 1.0) */}
                        <div>
                          <div className="flex justify-between text-xs mb-1 font-mono">
                            <span className="text-stone-600">
                              {lang === 'ne' ? 'भावको तीव्रता (Expression Temperature)' : 'Expression Exaggeration'}
                            </span>
                            <span className="text-stone-900 font-semibold">{temperature.toFixed(2)}</span>
                          </div>
                          <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.05"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-stone-200 rounded-full appearance-none cursor-pointer accent-stone-900"
                          />
                          <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-0.5">
                            <span>0.1 (Precise)</span>
                            <span>0.5 (Balanced)</span>
                            <span>1.0 (Dramatic)</span>
                          </div>
                        </div>

                        {/* Slider 3: Repetition Penalty & Top-K */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between text-xs mb-1 font-mono">
                              <span className="text-stone-600">Repetition Penalty</span>
                              <span className="text-stone-800 font-medium">{repetitionPenalty.toFixed(2)}</span>
                            </div>
                            <input
                              type="range"
                              min="1.0"
                              max="2.0"
                              step="0.05"
                              value={repetitionPenalty}
                              onChange={(e) => setRepetitionPenalty(parseFloat(e.target.value))}
                              className="w-full h-1.5 bg-stone-200 rounded-full appearance-none cursor-pointer accent-stone-900"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-xs mb-1 font-mono">
                              <span className="text-stone-600">Top-K</span>
                              <span className="text-stone-800 font-medium">{topK}</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              step="5"
                              value={topK}
                              onChange={(e) => setTopK(parseInt(e.target.value, 10))}
                              className="w-full h-1.5 bg-stone-200 rounded-full appearance-none cursor-pointer accent-stone-900"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Notification if cold starting or using fallback */}
                  {ttsNotice && (
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-mono flex items-center gap-2 animate-fadeIn">
                      <Info className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{ttsNotice}</span>
                    </div>
                  )}

                  {/* High-visibility Solid Pill CTA: ElevenLabs Aesthetic */}
                  <button
                    onClick={handleGenerateAudio}
                    disabled={isGenerating || !inputText.trim()}
                    id="generate-nepali-audio-btn"
                    className="w-full py-4 rounded-full bg-stone-900 hover:bg-black text-stone-50 font-medium text-sm md:text-base flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.99] disabled:opacity-35 disabled:pointer-events-none cursor-pointer shadow-sm"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-end gap-1 h-4">
                          <span className="w-1 h-3 bg-stone-100 rounded-full animate-sine-1" />
                          <span className="w-1 h-4 bg-stone-100 rounded-full animate-sine-2" />
                          <span className="w-1 h-2 bg-stone-100 rounded-full animate-sine-3" />
                          <span className="w-1 h-3.5 bg-stone-100 rounded-full animate-sine-4" />
                        </div>
                        <span className="text-stone-100 tracking-wide font-normal">
                          {lang === 'ne' ? 'आवाज उत्पन्न हुँदैछ...' : 'Synthesizing Nepali Speech...'}
                        </span>
                      </div>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-stone-50 text-stone-50" />
                        <span>
                          {lang === 'ne'
                            ? 'ध्वनि उत्पन्न गर्नुहोस् (Generate Audio)'
                            : 'Generate Nepali Audio'}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Creator Tier Active Card */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-stone-900 uppercase tracking-wider">Creator Tier Active</p>
                      <p className="text-[11px] text-stone-500 mt-0.5 font-mono">
                        {creditsRemaining.toLocaleString()} {lang === 'ne' ? 'अक्षरहरू बाँकी' : 'characters remaining'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setPricingModalMode('topup');
                          setIsPricingModalOpen(true);
                        }}
                        className="text-xs px-3.5 py-1.5 rounded-full bg-stone-900 hover:bg-black text-stone-50 font-medium transition-all cursor-pointer shadow-xs"
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
                  <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-editorial">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-2">
                        <History className="w-3.5 h-3.5 text-stone-800" />
                        {lang === 'ne' ? 'हालै संश्लेषित इतिहास' : 'Recent Generations'}
                      </h4>
                      <span className="text-[11px] text-stone-400 font-mono">
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
                          className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                            currentGeneration?.id === gen.id
                              ? 'bg-stone-50 border-stone-900'
                              : 'bg-white border-stone-200/70 hover:bg-stone-50'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-stone-800 truncate">
                              {gen.rawText}
                            </p>
                            <p className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-2 font-mono">
                              <span className="text-stone-700 font-medium">{gen.voice.nameNe}</span>
                              <span>•</span>
                              <span>{gen.duration.toFixed(1)}s</span>
                              <span>•</span>
                              <span>{gen.createdAt}</span>
                            </p>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 shrink-0">
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

      {/* Minimalist Hairline UI Footer */}
      <footer className="h-14 bg-white/70 backdrop-blur-md border-t border-stone-200/80 px-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 font-mono gap-2 mt-auto">
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Status: <span className="text-stone-800 font-medium">Systems Operational</span>
          </span>
          <span>API v2.4.1</span>
          <span>© 2025 KathaAI Indic Audio Studio</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentTab('developer')}
            className="hover:text-stone-900 cursor-pointer transition-colors"
          >
            Documentation
          </button>
          <button
            onClick={() => {
              setPricingModalMode('plans');
              setIsPricingModalOpen(true);
            }}
            className="hover:text-stone-900 cursor-pointer transition-colors"
          >
            Plans
          </button>
          <span className="hover:text-stone-900 cursor-pointer transition-colors">Privacy Policy</span>
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
