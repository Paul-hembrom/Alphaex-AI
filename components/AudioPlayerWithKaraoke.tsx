'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Sparkles,
  Gauge,
  Check,
  Music,
  Clock,
  Radio,
} from 'lucide-react';
import { TTSGenerationResult, WordTimestamp } from '@/types/tts';

interface AudioPlayerWithKaraokeProps {
  generation: TTSGenerationResult | null;
  isGenerating: boolean;
  lang: 'ne' | 'en';
}

export default function AudioPlayerWithKaraoke({
  generation,
  isGenerating,
  lang,
}: AudioPlayerWithKaraokeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);
  const [isCopied, setIsCopied] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const updatePlaybackProgressRef = useRef<() => void>(() => {});
  const [prevGenId, setPrevGenId] = useState<string | null>(null);

  // Adjust state during render when generation changes (React recommended pattern)
  if (generation && generation.id !== prevGenId) {
    setPrevGenId(generation.id);
    setCurrentTime(0);
    setActiveWordIndex(-1);
    setIsPlaying(false);
    setDuration(generation.duration);
  }

  // Handle continuous audio time updates & karaoke synchronization
  const updatePlaybackProgress = useCallback(() => {
    if (audioRef.current) {
      const curr = audioRef.current.currentTime;
      setCurrentTime(curr);

      if (generation?.timestamps) {
        const foundIndex = generation.timestamps.findIndex(
          (t) => curr >= t.start && curr <= t.end
        );
        setActiveWordIndex(foundIndex);
      }

      if (!audioRef.current.paused && !audioRef.current.ended) {
        animationFrameRef.current = requestAnimationFrame(() => {
          updatePlaybackProgressRef.current();
        });
      } else if (audioRef.current.ended) {
        setIsPlaying(false);
        setActiveWordIndex(-1);
      }
    }
  }, [generation]);

  useEffect(() => {
    updatePlaybackProgressRef.current = updatePlaybackProgress;
  }, [updatePlaybackProgress]);

  // Sync DOM audio element when generation changes
  useEffect(() => {
    if (generation?.audioBlobUrl && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = generation.audioBlobUrl;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.currentTime = 0;
    }
  }, [generation, playbackRate, isMuted, volume]);

  const togglePlayPause = () => {
    if (!audioRef.current || !generation) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        animationFrameRef.current = requestAnimationFrame(updatePlaybackProgress);
      }).catch((err) => {
        console.error('Audio play error:', err);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
    // Update karaoke word
    if (generation?.timestamps) {
      const foundIndex = generation.timestamps.findIndex(
        (t) => targetTime >= t.start && targetTime <= t.end
      );
      setActiveWordIndex(foundIndex);
    }
  };

  const handleWordClick = (timestamp: WordTimestamp, index: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = timestamp.start;
    setCurrentTime(timestamp.start);
    setActiveWordIndex(index);
    if (!isPlaying) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        animationFrameRef.current = requestAnimationFrame(updatePlaybackProgress);
      });
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setActiveWordIndex(-1);
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleDownload = async () => {
    if (!generation?.audioBlobUrl) return;
    const filename = generation.id.endsWith('.wav') ? generation.id : `${generation.id}.wav`;

    try {
      const response = await fetch(generation.audioBlobUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Direct blob link fallback
      const anchor = document.createElement('a');
      anchor.href = generation.audioBlobUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }
  };

  const handleCopyText = () => {
    if (!generation?.rawText) return;
    navigator.clipboard.writeText(generation.rawText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m}:${s < 10 ? '0' : ''}${s}.${ms}`;
  };

  // Generate deterministic wave bars for visualization
  const waveBarsCount = 48;
  const progressRatio = duration > 0 ? currentTime / duration : 0;

  return (
    <div id="audio-player-workbench" className="bg-gradient-to-b from-[#111622] to-[#0a0d14] rounded-2xl border border-slate-800/80 p-5 md:p-6 shadow-2xl relative overflow-hidden flex flex-col">
      <audio
        ref={audioRef}
        onEnded={() => {
          setIsPlaying(false);
          setActiveWordIndex(-1);
        }}
        preload="auto"
      />

      {/* Background neon ambient highlight */}
      <div className="absolute -right-20 -top-20 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar of Player: REAL-TIME SYNC ENGINE */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
            <Radio className={`w-4 h-4 ${isPlaying ? 'animate-pulse text-[#10b981]' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                REAL-TIME SYNC ENGINE
              </span>
              <div className="flex gap-1 items-end h-4 ml-1">
                <div className={`w-1 h-2.5 bg-[#06b6d4] ${isPlaying ? 'animate-pulse' : 'opacity-40'}`} />
                <div className={`w-1 h-4 bg-[#06b6d4] ${isPlaying ? 'animate-pulse delay-75' : ''}`} />
                <div className={`w-1 h-2 bg-[#10b981] ${isPlaying ? 'animate-pulse delay-150' : ''}`} />
                <div className={`w-1 h-5 bg-[#10b981] ${isPlaying ? 'animate-pulse delay-100' : ''}`} />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
              {generation ? (
                <>
                  <span className="text-slate-300 font-medium">{generation.voice.nameNe}</span>
                  <span>•</span>
                  <span>{generation.charactersUsed} {lang === 'ne' ? 'अक्षर' : 'chars'}</span>
                  <span>•</span>
                  <span>MMS Forced Alignment</span>
                </>
              ) : (
                <span className="text-slate-400">
                  {lang === 'ne' ? 'अडियो उत्पन्न भएको छैन' : 'No audio generated yet'}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action buttons on top right */}
        {generation && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              id="copy-transcript-button"
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>{lang === 'ne' ? 'प्रतिलिपि भयो' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#06b6d4]" />
                  <span>{lang === 'ne' ? 'पाठ प्रतिलिपि' : 'Copy Text'}</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              id="download-audio-button"
              className="text-xs px-3.5 py-1.5 rounded-lg bg-[#10b981] hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'ne' ? '.WAV डाउनलोड' : 'Download .WAV'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Karaoke Display with Immersive Glowing Typography */}
      <div className="py-4">
        {generation ? (
          <div className="p-5 rounded-xl bg-[#0a0d14]/80 border border-slate-800/80 leading-relaxed text-xl md:text-2xl font-medium flex flex-wrap gap-x-3 gap-y-2 max-h-56 overflow-y-auto select-none">
            {generation.timestamps.map((item, idx) => {
              const isActive = idx === activeWordIndex;
              const isPast = currentTime > item.end;

              return (
                <span
                  key={idx}
                  onClick={() => handleWordClick(item, idx)}
                  id={`karaoke-word-${idx}`}
                  className={`cursor-pointer transition-all duration-150 rounded px-1.5 py-0.5 ${
                    isActive
                      ? 'text-[#10b981] font-bold drop-shadow-[0_0_10px_rgba(16,185,129,0.4)] bg-[#10b981]/15 border border-[#10b981]/30 scale-105'
                      : isPast
                      ? 'text-[#06b6d4] opacity-90 drop-shadow-[0_0_8px_rgba(6,182,212,0.25)] hover:text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={`${item.start}s - ${item.end}s (Click to seek)`}
                >
                  {item.word}
                </span>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-[#0a0d14]/40 border border-dashed border-slate-800 text-center text-slate-500 text-sm">
            <Music className="w-7 h-7 mx-auto mb-2 text-slate-600 opacity-60" />
            <p>
              {lang === 'ne'
                ? 'माथि पाठ लेखी "ध्वनि उत्पन्न गर्नुहोस्" थिच्नुहोस्। यहाँ शब्द-शब्दको प्रत्यक्ष हाइलाइटिङ देखिनेछ।'
                : 'Enter Devanagari text and click "Generate Nepali Audio" to see synchronized live word-level highlighting here.'}
            </p>
          </div>
        )}
      </div>

      {/* Waveform Visualization Bars */}
      <div className="my-2 p-3 rounded-xl bg-[#0a0d14]/70 border border-slate-800/60 relative">
        <div className="flex items-end justify-between gap-1 h-14 px-2 select-none">
          {Array.from({ length: waveBarsCount }).map((_, idx) => {
            const barProgress = idx / waveBarsCount;
            const isPlayed = barProgress <= progressRatio;
            const sinVal = Math.sin(idx * 0.4) * 0.5 + Math.cos(idx * 0.18) * 0.3;
            const pseudoHeight = Math.max(16, Math.min(95, Math.floor(Math.abs(sinVal) * 90) + 18));
            
            const dynamicScale = isPlaying && Math.abs(barProgress - progressRatio) < 0.1 ? 1.25 : 1.0;

            return (
              <div
                key={idx}
                onClick={() => {
                  if (duration > 0 && audioRef.current) {
                    const newTime = barProgress * duration;
                    audioRef.current.currentTime = newTime;
                    setCurrentTime(newTime);
                  }
                }}
                className={`flex-1 rounded-full transition-all duration-150 cursor-pointer ${
                  isPlayed
                    ? 'bg-gradient-to-t from-[#10b981] to-[#06b6d4] shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : 'bg-slate-800/80 hover:bg-slate-700'
                }`}
                style={{
                  height: `${Math.min(100, pseudoHeight * dynamicScale)}%`,
                  minWidth: '2px',
                }}
                title={`${(barProgress * duration).toFixed(1)}s`}
              />
            );
          })}
        </div>
      </div>

      {/* Immersive Bottom Player Dock */}
      <div className="mt-auto flex items-center gap-4 bg-black/40 p-3.5 rounded-xl border border-white/5">
        {/* Play/Pause CTA */}
        <button
          onClick={togglePlayPause}
          disabled={!generation || isGenerating}
          id="audio-play-pause-btn"
          className="w-10 h-10 rounded-full bg-[#10b981] hover:bg-emerald-400 text-black flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-transform active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          aria-label={isPlaying ? 'Pause Audio' : 'Play Audio'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-black text-black" />
          ) : (
            <Play className="w-5 h-5 fill-black text-black translate-x-0.5" />
          )}
        </button>

        {/* Progress & Scrub */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="range"
              id="audio-scrub-slider"
              min="0"
              max={duration || 1}
              step="0.01"
              value={currentTime}
              onChange={handleSeek}
              disabled={!generation}
              className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-[#10b981] focus:outline-none disabled:opacity-40"
            />
          </div>
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-[10px] font-mono text-slate-500">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <div className="flex items-center gap-3">
              {/* Speed Switchers */}
              <div className="flex items-center gap-1">
                {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                  <span
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    id={`playback-rate-${speed}x`}
                    className={`text-[10px] font-mono cursor-pointer px-1 rounded transition-colors ${
                      playbackRate === speed
                        ? 'text-[#10b981] font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {speed}x
                  </span>
                ))}
              </div>

              {/* Restart */}
              <button
                onClick={handleRestart}
                disabled={!generation}
                id="audio-restart-btn"
                className="text-slate-500 hover:text-white cursor-pointer transition-colors disabled:opacity-40"
                title="Restart"
              >
                <RotateCcw className="w-3 h-3" />
              </button>

              {/* Download Icon Button */}
              <button
                onClick={handleDownload}
                disabled={!generation}
                id="download-audio-icon-button"
                className="text-slate-500 hover:text-[#10b981] cursor-pointer transition-colors disabled:opacity-25 disabled:pointer-events-none p-0.5 rounded hover:bg-white/5"
                title={lang === 'ne' ? 'अडियो डाउनलोड गर्नुहोस्' : `Download (${generation?.id || 'audio'}.wav)`}
                aria-label="Download Audio"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              {/* Volume Control (Mute Toggle + Slider) */}
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-800/80">
                <button
                  onClick={toggleMute}
                  id="audio-volume-toggle-btn"
                  className="text-slate-500 hover:text-white cursor-pointer transition-colors p-0.5 rounded"
                  title={isMuted ? 'Unmute' : 'Mute'}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <input
                  type="range"
                  id="audio-volume-slider"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-14 sm:w-20 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-[#10b981] focus:outline-none"
                  title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                  aria-label="Audio playback volume slider"
                />
                <span className="text-[9px] font-mono text-slate-500 w-6 text-right select-none hidden sm:inline">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
