import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.HF_SPACE_URL?.replace(/\/+$/, '') || 'https://paulhemb-alphanex.hf.space';

const DEFAULT_API_KEY =
  process.env.NEXT_PUBLIC_DEFAULT_API_KEY || 'nep_live_testkey_999';

export async function GET(req: NextRequest) {
  try {
    const rawApiKey = req.headers.get('x-api-key');
    const apiKey = rawApiKey && rawApiKey.trim() ? rawApiKey.trim() : DEFAULT_API_KEY;

    const targetUrl = `${BACKEND_BASE_URL}/v1/user/credits`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let upstreamRes: Response;
    try {
      upstreamRes = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const data = await upstreamRes.json().catch(() => null);

    if (!upstreamRes.ok) {
      return NextResponse.json(
        {
          error:
            upstreamRes.status === 401
              ? 'Invalid or unauthorized API key.'
              : `Failed to fetch user credits (${upstreamRes.status})`,
          details: data,
        },
        { status: upstreamRes.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const isAbort =
      err instanceof Error &&
      (err.name === 'AbortError' || err.message.includes('aborted'));
    const status = isAbort ? 504 : 503;

    return NextResponse.json(
      {
        error: isAbort
          ? 'Timed out fetching credits from Hugging Face Space.'
          : 'Failed to connect to Hugging Face Space credits service.',
        details: err instanceof Error ? err.message : String(err),
      },
      { status }
    );
  }
}
