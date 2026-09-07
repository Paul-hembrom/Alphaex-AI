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

  // Parse headers from the response stream
  const rawRemaining = response.headers.get('X-Remaining-Credits');
  const rawDuration = response.headers.get('X-Total-Duration');

  const remainingCredits =
    rawRemaining && !isNaN(parseInt(rawRemaining, 10))
      ? parseInt(rawRemaining, 10)
      : null;

  const duration =
    rawDuration && !isNaN(parseFloat(rawDuration))
      ? parseFloat(rawDuration)
      : null;

  const blob = await response.blob();
  const audioUrl = URL.createObjectURL(blob);

  return {
    blob,
    audioUrl,
    remainingCredits,
    duration,
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
