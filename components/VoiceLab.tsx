'use client';

import React, { useState } from 'react';
import {
  Mic,
  Upload,
  Sparkles,
  Play,
  Pause,
  Check,
  Sliders,
  ShieldCheck,
  FileAudio,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { VoiceCloneProfile } from '@/types/tts';

interface VoiceLabProps {
  lang: 'ne' | 'en';
  onSelectCustomVoicePrompt: (prompt: string, voiceName: string) => void;
}

const TONES = [
  { id: 'calm', labelEn: 'Calm & Warm', labelNe: 'शान्त र न्यानो' },
  { id: 'energetic', labelEn: 'Energetic & Crisp', labelNe: 'फुर्तिलो र स्पष्ट' },
  { id: 'authoritative', labelEn: 'Authoritative & Deep', labelNe: 'गम्भीर र आधिकारिक' },
  { id: 'whisper', labelEn: 'Intimate Whisper', labelNe: 'रहस्यमय कानेखुसी' },
  { id: 'dramatic', labelEn: 'Dramatic & Poetic', labelNe: 'नाटकीय तथा भावुक' },
];

const DIALECTS = [
  { id: 'ktm', labelEn: 'Kathmandu Urban', labelNe: 'काठमाडौं सहरी लवज' },
  { id: 'hills', labelEn: 'Western Hills (Gandaki)', labelNe: 'पश्चिमेली पहाडी लवज' },
  { id: 'pokhara', labelEn: 'Pokhara Nuanced', labelNe: 'पोखरेली मिठो बोली' },
  { id: 'terai', labelEn: 'Terai Nuance (Mithila-influenced)', labelNe: 'तराई-मधेश लवज' },
];

const ACOUSTICS = [
  { id: 'studio', labelEn: 'Soundproof Studio', labelNe: 'ध्वनिरोधी स्टुडियो' },
  { id: 'close-mic', labelEn: 'Close-Mic Proximity', labelNe: 'नजिकको माइक (Proximity)' },
  { id: 'ambient', labelEn: 'Ambient Natural Room', labelNe: 'प्राकृतिक कोठाको वातावरण' },
];

const INITIAL_CLONES: VoiceCloneProfile[] = [
  {
    id: 'clone-1',
    name: 'अमित (Amit - Tech Explainer)',
    tone: 'Energetic & Crisp',
    dialect: 'Kathmandu Urban',
    acoustics: 'Soundproof Studio',
    sampleFileName: 'amit_sample_24s.wav',
    durationRecorded: 24.5,
    status: 'ready',
    createdAt: '2 hours ago',
  },
  {
    id: 'clone-2',
    name: 'पार्वती (Parvati - Story)',
    tone: 'Dramatic & Poetic',
    dialect: 'Western Hills (Gandaki)',
    acoustics: 'Close-Mic Proximity',
    sampleFileName: 'parvati_narration_38s.wav',
    durationRecorded: 38.2,
    status: 'ready',
    createdAt: '1 day ago',
  },
];

export default function VoiceLab({
  lang,
  onSelectCustomVoicePrompt,
}: VoiceLabProps) {
  // Voice clone upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sampleDuration, setSampleDuration] = useState<number>(0);
  const [cloneName, setCloneName] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [clones, setClones] = useState<VoiceCloneProfile[]>(INITIAL_CLONES);
  const [playingCloneId, setPlayingCloneId] = useState<string | null>(null);

  // Indic-Parler prompt builder states
  const [selectedTone, setSelectedTone] = useState<string>('calm');
  const [selectedDialect, setSelectedDialect] = useState<string>('ktm');
  const [selectedAcoustic, setSelectedAcoustic] = useState<string>('studio');
  const [genderPrompt, setGenderPrompt] = useState<'female' | 'male'>('female');

  // Build dynamic Indic-Parler conditioning prompt
  const toneObj = TONES.find((t) => t.id === selectedTone);
  const dialectObj = DIALECTS.find((d) => d.id === selectedDialect);
  const acousticObj = ACOUSTICS.find((a) => a.id === selectedAcoustic);

  const dynamicParlerPrompt = `A ${toneObj?.labelEn.toLowerCase() || 'calm'} ${genderPrompt} speaker with a ${
    dialectObj?.labelEn || 'Kathmandu Urban'
  } Nepali accent, recorded in a ${
    acousticObj?.labelEn.toLowerCase() || 'soundproof studio'
  } setup. Clean pronunciation with natural cadence, expressive intonation, and zero background hiss.`;

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAudioFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processAudioFile(e.target.files[0]);
    }
  };

  const processAudioFile = (file: File) => {
    setSelectedFile(file);
    // Simulate detecting duration (e.g. 18.4 seconds for valid sampling)
    const mockDuration = 19.2;
    setSampleDuration(mockDuration);
    if (!cloneName) {
      setCloneName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleStartCloning = () => {
    if (!selectedFile || sampleDuration < 15) return;
    setIsCloning(true);

    setTimeout(() => {
      const newClone: VoiceCloneProfile = {
        id: `clone-${Date.now()}`,
        name: cloneName || (lang === 'ne' ? 'नयाँ क्लोन आवाज' : 'New Voice Clone'),
        tone: toneObj?.labelEn || 'Natural',
        dialect: dialectObj?.labelEn || 'Kathmandu',
        acoustics: acousticObj?.labelEn || 'Studio',
        sampleFileName: selectedFile.name,
        durationRecorded: sampleDuration,
        status: 'ready',
        createdAt: 'Just now',
      };

      setClones([newClone, ...clones]);
      setIsCloning(false);
      setSelectedFile(null);
      setSampleDuration(0);
      setCloneName('');
    }, 2400);
  };

  const toggleAudition = (cloneId: string) => {
    if (playingCloneId === cloneId) {
      setPlayingCloneId(null);
    } else {
      setPlayingCloneId(cloneId);
      // Automatically stop playback after 4 seconds
      setTimeout(() => {
        setPlayingCloneId((current) => (current === cloneId ? null : current));
      }, 4000);
    }
  };

  return (
    <div id="voice-lab-module" className="space-y-8">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            {lang === 'ne' ? 'भ्वाइस ल्याब र शून्य-नमूना क्लोनिङ' : 'Voice Lab & Indic-Parler Cloning Hub'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {lang === 'ne'
              ? '१५ सेकेन्डको अडियोबाट नयाँ नेपाली आवाज क्लोन गर्नुहोस् वा प्राकृतिक भाषा प्रम्प्टद्वारा विशिष्ट लवज तयार गर्नुहोस्।'
              : 'Clone custom Nepali voices in 15 seconds or construct zero-shot Indic-Parler speaker embeddings with pure natural language.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            MMS + Indic-Parler v1.2
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Instant Voice Clone Card (5 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#111622] rounded-2xl border border-slate-800/80 p-5 md:p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-100 text-base flex items-center gap-2">
                <Mic className="w-4 h-4 text-emerald-400" />
                {lang === 'ne' ? 'तुरुन्त आवाज क्लोनिङ (Instant Voice Clone)' : 'Instant 1-Click Voice Clone'}
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                {lang === 'ne' ? 'न्यूनतम १५ सेकेन्ड' : 'Min 15s Required'}
              </span>
            </div>

            {/* Audio Upload Drop Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                selectedFile
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/50'
              }`}
            >
              <input
                type="file"
                id="voice-sample-upload"
                accept="audio/mp3,audio/wav,audio/m4a"
                onChange={handleFileInput}
                className="hidden"
              />

              {selectedFile ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <FileAudio className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-200 text-sm truncate max-w-[280px] mx-auto">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {sampleDuration}s audio
                    </p>
                  </div>

                  {/* 15-second compliance badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <Check className="w-3.5 h-3.5" />
                    {lang === 'ne'
                      ? 'पर्याप्त अडियो नमूना (१५ सेकेन्ड भन्दा बढी)'
                      : 'Sample length valid (>15s speaker fingerprint)'}
                  </div>

                  <div>
                    <label
                      htmlFor="voice-sample-upload"
                      className="text-xs text-cyan-400 hover:underline cursor-pointer"
                    >
                      {lang === 'ne' ? 'अर्को फाइल छान्नुहोस्' : 'Replace with another file'}
                    </label>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="voice-sample-upload"
                  className="cursor-pointer block space-y-3"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center border border-slate-700/60">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {lang === 'ne'
                        ? 'अडियो फाइल यहाँ तान्नुहोस् वा अपलोड गर्नुहोस्'
                        : 'Drag & drop speaker audio, or browse'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {lang === 'ne'
                        ? 'समर्थित ढाँचा: .wav, .mp3 (न्यूनतम १५ सेकेन्ड प्रस्ट बोली)'
                        : 'Supported formats: .wav, .mp3, .m4a (min 15s clean speech)'}
                    </p>
                  </div>
                </label>
              )}
            </div>

            {/* Clone Details inputs */}
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'ne' ? 'आवाजको नाम (Voice Clone Name)' : 'Voice Clone Name'}
                </label>
                <input
                  type="text"
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  placeholder={lang === 'ne' ? 'उदा. सुलभ - पोडकास्ट आवाज' : 'e.g. Sulav - Podcast Host'}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <button
                onClick={handleStartCloning}
                disabled={!selectedFile || isCloning}
                id="clone-voice-submit-btn"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isCloning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{lang === 'ne' ? 'स्वर विश्लेषण हुँदैछ (Extracting Timbre)...' : 'Extracting Acoustic Embeddings...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{lang === 'ne' ? 'आवाज क्लोन सुरु गर्नुहोस्' : 'Train Instant Voice Clone'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Active Custom Clones List */}
          <div className="bg-[#111622] rounded-2xl border border-slate-800/80 p-5 shadow-xl">
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center justify-between">
              <span>{lang === 'ne' ? 'तपाईंका क्लोन गरिएका आवाजहरू' : 'Your Custom Voice Clones'}</span>
              <span className="text-xs text-slate-500 font-mono">{clones.length} Ready</span>
            </h4>

            <div className="space-y-2.5">
              {clones.map((c) => {
                const isPlaying = playingCloneId === c.id;
                return (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleAudition(c.id)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                          isPlaying
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                        title="Audition Sample"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.5" />}
                      </button>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{c.name}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
                          <span>{c.dialect}</span>
                          <span>•</span>
                          <span>{c.durationRecorded}s sample</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        onSelectCustomVoicePrompt(
                          `Speaker ${c.name} with ${c.tone} tone and ${c.dialect} accent recorded in a ${c.acoustics}.`,
                          c.name
                        )
                      }
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 transition-colors"
                    >
                      <span>{lang === 'ne' ? 'स्टुडियोमा प्रयोग' : 'Use in Studio'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Indic-Parler Prompt Synthesizer (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#111622] rounded-2xl border border-slate-800/80 p-5 md:p-6 shadow-xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-100 text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                {lang === 'ne' ? 'इन्डिक-पार्लर प्रम्प्ट सिन्थेसाइजर' : 'Indic-Parler Natural Prompt Designer'}
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                Zero-Shot Synthesis
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              {lang === 'ne'
                ? 'विभिन्न विशेषताहरू छान्नुहोस्; एआईले स्वतः उच्च स्तरको प्राविधिक विवरण तयार गर्नेछ।'
                : 'Select characteristics below; Indic-Parler synthesizes a precise vocal identity on the fly.'}
            </p>

            <div className="space-y-4">
              {/* Speaker Gender */}
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-2">
                  {lang === 'ne' ? 'लैङ्गिक पहिचान (Speaker Gender)' : 'Speaker Gender'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setGenderPrompt('female')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      genderPrompt === 'female'
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {lang === 'ne' ? 'महिला (Female Voice)' : 'Female Voice'}
                  </button>
                  <button
                    onClick={() => setGenderPrompt('male')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      genderPrompt === 'male'
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {lang === 'ne' ? 'पुरुष (Male Voice)' : 'Male Voice'}
                  </button>
                </div>
              </div>

              {/* Tone / Emotion */}
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-2">
                  {lang === 'ne' ? 'स्वरको भाव तथा शैली (Vocal Tone & Emotion)' : 'Vocal Tone & Emotion'}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TONES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTone(t.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                        selectedTone === t.id
                          ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                          : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {lang === 'ne' ? t.labelNe : t.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Regional Dialect / Accent */}
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-2">
                  {lang === 'ne' ? 'क्षेत्रीय लवज (Regional Dialect & Accent)' : 'Regional Dialect & Accent'}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DIALECTS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDialect(d.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                        selectedDialect === d.id
                          ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                          : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {lang === 'ne' ? d.labelNe : d.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Acoustics */}
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-2">
                  {lang === 'ne' ? 'ध्वनि परिवेश (Acoustic Environment)' : 'Acoustic Environment'}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ACOUSTICS.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAcoustic(a.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                        selectedAcoustic === a.id
                          ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                          : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {lang === 'ne' ? a.labelNe : a.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generated Prompt Box */}
              <div className="pt-2">
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  {lang === 'ne' ? 'उत्पन्न इन्डिक-पार्लर कन्डिसनिङ प्रम्प्ट:' : 'Generated Indic-Parler Conditioning String:'}
                </label>
                <div className="p-3.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs font-mono text-cyan-300 leading-relaxed break-words">
                  &ldquo;{dynamicParlerPrompt}&rdquo;
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() =>
                  onSelectCustomVoicePrompt(
                    dynamicParlerPrompt,
                    lang === 'ne' ? 'कस्टम प्रम्प्ट आवाज' : 'Custom Parler Voice'
                  )
                }
                id="apply-parler-prompt-btn"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>{lang === 'ne' ? 'यो प्रम्प्ट स्टुडियोमा लोड गर्नुहोस्' : 'Load Prompt into Studio'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
