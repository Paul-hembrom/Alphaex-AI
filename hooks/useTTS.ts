'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  generateSpeech,
  checkCredits,
  BackendVoiceId,
  SpeechResult,
} from '@/lib/api-client';
import { WordTimestamp } from '@/types/tts';

export interface UseTTSOptions {
  initialApiKey?: string;
  onSuccess?: (result: SpeechResult) => void;
  onError?: (error: Error) => void;
}

export interface GenerateOptions {
  customPrompt?: string | null;
  temperature?: number;
  apiKey?: string;
}

export interface UseTTSReturn {
  isGenerating: boolean;
  audioUrl: string | null;
  remainingCredits: number | null;
  duration: number;
  timestamps: WordTimestamp[];
  error: string | null;
  handleGenerate: (
    text: string,
    voiceId: BackendVoiceId | string,
    options?: GenerateOptions
  ) => Promise<string | null>;
  refreshCredits: (apiKey?: string) => Promise<number | null>;
  clearError: () => void;
  resetAudio: () => void;
}

/**
 * Custom React Hook for Alphanex / KathaAI Nepali Speech Synthesis.
 * Handles lifecycle, loading state, object URL revocation, error management,
 * and real-time credit tracking from response headers.
 */
export function useTTS(options: UseTTSOptions = {}): UseTTSReturn {
  const { initialApiKey, onSuccess, onError } = options;

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [timestamps, setTimestamps] = useState<WordTimestamp[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Keep track of current Object URL for cleanup to prevent memory leaks
  const currentAudioUrlRef = useRef<string | null>(null);

  const revokeCurrentAudio = useCallback(() => {
    if (currentAudioUrlRef.current) {
      try {
        URL.revokeObjectURL(currentAudioUrlRef.current);
      } catch {
        // Safe fallback
      }
      currentAudioUrlRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      revokeCurrentAudio();
    };
  }, [revokeCurrentAudio]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetAudio = useCallback(() => {
    revokeCurrentAudio();
    setAudioUrl(null);
    setDuration(0);
    setTimestamps([]);
    setError(null);
  }, [revokeCurrentAudio]);

  const handleGenerate = useCallback(
    async (
      text: string,
      voiceId: BackendVoiceId | string,
      generateOptions?: GenerateOptions
    ): Promise<string | null> => {
      if (!text || !text.trim()) {
        const validationMsg = 'Please enter Nepali Devanagari text to synthesize.';
        setError(validationMsg);
        return null;
      }

      setIsGenerating(true);
      setError(null);

      try {
        const apiKeyToUse = generateOptions?.apiKey || initialApiKey;

        const result = await generateSpeech({
          text,
          voice_id: voiceId,
          custom_prompt: generateOptions?.customPrompt ?? null,
          temperature: generateOptions?.temperature,
          apiKey: apiKeyToUse,
        });

        // Revoke the old object URL before assigning the new one
        revokeCurrentAudio();

        currentAudioUrlRef.current = result.audioUrl;
        setAudioUrl(result.audioUrl);

        if (result.duration !== null && !isNaN(result.duration)) {
          setDuration(result.duration);
        }

        if (result.remainingCredits !== null && !isNaN(result.remainingCredits)) {
          setRemainingCredits(result.remainingCredits);
        }

        setTimestamps(result.timestamps);

        if (onSuccess) {
          onSuccess(result);
        }

        return result.audioUrl;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred during speech synthesis.';
        setError(errorMessage);

        if (onError && err instanceof Error) {
          onError(err);
        }

        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [initialApiKey, onSuccess, onError, revokeCurrentAudio]
  );

  const refreshCredits = useCallback(
    async (apiKey?: string): Promise<number | null> => {
      try {
        const key = apiKey || initialApiKey;
        const data = await checkCredits(key);
        if (typeof data.credits === 'number') {
          setRemainingCredits(data.credits);
          return data.credits;
        }
        return null;
      } catch {
        return null;
      }
    },
    [initialApiKey]
  );

  return {
    isGenerating,
    audioUrl,
    remainingCredits,
    duration,
    timestamps,
    error,
    handleGenerate,
    refreshCredits,
    clearError,
    resetAudio,
  };
}
