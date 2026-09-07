import { NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.HF_SPACE_URL?.replace(/\/+$/, '') || 'https://paulhemb-alphanex.hf.space';

export async function GET() {
  try {
    const targetUrl = `${BACKEND_BASE_URL}/health`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let upstreamRes: Response;
    try {
      upstreamRes = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
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
          status: 'unhealthy',
          statusCode: upstreamRes.status,
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

    return NextResponse.json(
      {
        status: 'unreachable',
        error: isAbort
          ? 'Health check timed out (Hugging Face Space may be cold starting).'
          : 'Failed to connect to Hugging Face Space.',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 503 }
    );
  }
}
