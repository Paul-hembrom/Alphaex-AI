import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.HF_SPACE_URL?.replace(/\/+$/, '') || 'https://paulhemb-alphanex.hf.space';

const DEFAULT_API_KEY =
  process.env.NEXT_PUBLIC_DEFAULT_API_KEY || 'nep_live_testkey_999';

const VALID_VOICE_IDS = [
  'amrita_news',
  'amrita_story',
  'bikram_news',
  'sita_casual',
] as const;

type BackendVoiceId = (typeof VALID_VOICE_IDS)[number];

function mapVoiceId(inputVoiceId?: string): BackendVoiceId {
  if (!inputVoiceId) return 'amrita_news';

  const normalized = inputVoiceId.toLowerCase().trim();
  if (VALID_VOICE_IDS.includes(normalized as BackendVoiceId)) {
    return normalized as BackendVoiceId;
  }

  // Map simplified frontend identifiers
  if (normalized === 'amrita') return 'amrita_news';
  if (normalized === 'bikram') return 'bikram_news';
  if (normalized === 'sita') return 'sita_casual';
  if (normalized.includes('story')) return 'amrita_story';
  if (normalized.includes('bikram')) return 'bikram_news';
  if (normalized.includes('sita')) return 'sita_casual';

  return 'amrita_news';
}

export async function POST(req: NextRequest) {
  try {
    const rawApiKey = req.headers.get('x-api-key');
    const apiKey = rawApiKey && rawApiKey.trim() ? rawApiKey.trim() : DEFAULT_API_KEY;

    const body = await req.json().catch(() => ({}));
    const { text, voice_id, custom_prompt, temperature } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Text field is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    const mappedVoiceId = mapVoiceId(voice_id);
    const targetUrl = `${BACKEND_BASE_URL}/v1/audio/speech`;

    // 90 second timeout for GPU inference / HF Space cold starts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    const upstreamPayload = {
      text: text.trim(),
      voice_id: mappedVoiceId,
      custom_prompt: custom_prompt ?? null,
      temperature: typeof temperature === 'number' ? temperature : 0.35,
    };

    let upstreamRes: Response;
    try {
      upstreamRes = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(upstreamPayload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!upstreamRes.ok) {
      let errorBody: unknown;
      const contentType = upstreamRes.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        errorBody = await upstreamRes.json().catch(() => null);
      } else {
        errorBody = await upstreamRes.text().catch(() => null);
      }

      const errorMessage =
        upstreamRes.status === 401
          ? 'Invalid or missing API key. Please check your x-api-key header.'
          : upstreamRes.status === 402
          ? 'Insufficient credits. Please top up or use an active key.'
          : upstreamRes.status === 422
          ? 'Unprocessable entity. Please verify your payload parameters.'
          : `TTS synthesis failed with status ${upstreamRes.status}.`;

      return NextResponse.json(
        {
          error: errorMessage,
          status: upstreamRes.status,
          details: errorBody,
        },
        { status: upstreamRes.status }
      );
    }

    // Forward stream directly
    const remainingCredits = upstreamRes.headers.get('x-remaining-credits') || '';
    const totalDuration = upstreamRes.headers.get('x-total-duration') || '';

    const headers = new Headers();
    headers.set('Content-Type', 'audio/wav');
    if (remainingCredits) {
      headers.set('X-Remaining-Credits', remainingCredits);
    }
    if (totalDuration) {
      headers.set('X-Total-Duration', totalDuration);
    }
    headers.set(
      'Access-Control-Expose-Headers',
      'X-Remaining-Credits, X-Total-Duration'
    );

    return new Response(upstreamRes.body, {
      status: 200,
      headers,
    });
  } catch (err: unknown) {
    const isAbort =
      err instanceof Error &&
      (err.name === 'AbortError' || err.message.includes('aborted'));
    const status = isAbort ? 504 : 503;
    const message = isAbort
      ? 'Request timed out waiting for Hugging Face Space GPU inference (T4 may be cold starting).'
      : 'Failed to connect to Hugging Face Space TTS backend.';

    return NextResponse.json(
      {
        error: message,
        details: err instanceof Error ? err.message : String(err),
      },
      { status }
    );
  }
}
