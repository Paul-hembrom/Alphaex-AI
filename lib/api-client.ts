import { WordTimestamp } from '@/types/tts';

/**
 * KathaAI / Alphanex Indic TTS Client SDK
 * Direct typed interface to Next.js API route proxies and live FastAPI backend.
 */

export type BackendVoiceId =
  | 'amrita_news'
  | 'amrita_story'
  | 'bikram_news'
  | 'sita_casual';

export interface GenerateSpeechParams {
  text: string;
  voice_id: BackendVoiceId | string;
  custom_prompt?: string | null;
  temperature?: number;
  apiKey?: string;
}

export interface SpeechResult {
  blob: Blob;
  audioUrl: string;
  remainingCredits: number | null;
  duration: number | null;
  timestamps: WordTimestamp[];
}

export interface UserCreditsResponse {
  api_key: string;
  credits: number;
  user: string;
}

export interface CreateApiKeyResponse {
  api_key: string;
  credits: number;
  user: string;
}

export interface HealthCheckResponse {
  status: string;
  gpu_available?: boolean;
  device?: string;
  model?: string;
  error?: string;
}

/**
 * Normalizes input voice ID strings to the 4 canonical backend voice IDs.
 */
export function normalizeBackendVoiceId(voiceId?: string): BackendVoiceId {
  if (!voiceId) return 'amrita_news';
  const v = voiceId.toLowerCase().trim();

  if (v === 'amrita_news' || v === 'amrita_story' || v === 'bikram_news' || v === 'sita_casual') {
    return v;
  }
  if (v === 'amrita') return 'amrita_news';
  if (v === 'bikram') return 'bikram_news';
  if (v === 'sita') return 'sita_casual';
  if (v.includes('story')) return 'amrita_story';
  if (v.includes('bikram')) return 'bikram_news';
  if (v.includes('sita')) return 'sita_casual';

  return 'amrita_news';
}

/**
 * Synthesizes speech from Devanagari text using the Next.js /api/tts proxy.
 */
export async function generateSpeech(params: GenerateSpeechParams): Promise<SpeechResult> {
  const { text, voice_id, custom_prompt, temperature, apiKey } = params;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (apiKey && apiKey.trim()) {
    headers['x-api-key'] = apiKey.trim();
  }

  const response = await fetch('/api/tts', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      text: text.trim(),
      voice_id: normalizeBackendVoiceId(voice_id),
      custom_prompt: custom_prompt ?? null,
      temperature: typeof temperature === 'number' ? temperature : 0.35,
    }),
  });

  if (!response.ok) {
    let errorData: { error?: string; details?: unknown } = {};
    try {
      errorData = await response.json();
    } catch {
      // fallback if not JSON
    }

    const message =
      errorData.error ||
      `TTS generation failed with HTTP status ${response.status}.`;
    throw new Error(message);
  }

  const data = await response.json();

  if (!data || !data.audio_base64) {
    throw new Error('TTS synthesis failed: response missing audio data.');
  }

  // Decode base64 to Blob of type audio/wav
  const rawBase64 = data.audio_base64.includes(',')
    ? data.audio_base64.split(',')[1]
    : data.audio_base64;
  const binaryString = atob(rawBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'audio/wav' });
  const audioUrl = URL.createObjectURL(blob);

  const remainingCredits =
    typeof data.remaining_credits === 'number' && !isNaN(data.remaining_credits)
      ? data.remaining_credits
      : typeof data.remainingCredits === 'number' && !isNaN(data.remainingCredits)
      ? data.remainingCredits
      : null;

  const duration =
    typeof data.duration === 'number' && !isNaN(data.duration)
      ? data.duration
      : null;

  const timestamps: WordTimestamp[] = Array.isArray(data.timestamps)
    ? data.timestamps
    : [];

  return {
    blob,
    audioUrl,
    remainingCredits,
    duration,
    timestamps,
  };
}

/**
 * Checks remaining balance & account info for a given API key.
 */
export async function checkCredits(apiKey?: string): Promise<UserCreditsResponse> {
  const headers: HeadersInit = {};
  if (apiKey && apiKey.trim()) {
    headers['x-api-key'] = apiKey.trim();
  }

  const response = await fetch('/api/credits', {
    method: 'GET',
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Failed to fetch credits (${response.status})`);
  }

  return data as UserCreditsResponse;
}

/**
 * Creates a new developer API key on the backend.
 */
export async function createApiKey(developerName: string): Promise<CreateApiKeyResponse> {
  const response = await fetch('/api/keys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      developer_name: developerName.trim() || 'Developer',
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Failed to create API key (${response.status})`);
  }

  return data as CreateApiKeyResponse;
}

/**
 * Health check to verify if the HF Space T4 GPU instance is awake and operational.
 */
export async function checkHealth(): Promise<HealthCheckResponse> {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    return data as HealthCheckResponse;
  } catch (err: unknown) {
    return {
      status: 'unreachable',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
