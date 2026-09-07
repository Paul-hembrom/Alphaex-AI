import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.HF_SPACE_URL?.replace(/\/+$/, '') || 'https://paulhemb-alphanex.hf.space';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const developerName =
      typeof body.developer_name === 'string' && body.developer_name.trim()
        ? body.developer_name.trim()
        : 'Developer';

    const targetUrl = `${BACKEND_BASE_URL}/v1/keys/generate`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let upstreamRes: Response;
    try {
      upstreamRes = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ developer_name: developerName }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const data = await upstreamRes.json().catch(() => null);

    if (!upstreamRes.ok) {
      return NextResponse.json(
        {
          error: `Failed to generate API key (${upstreamRes.status})`,
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
          ? 'Timed out connecting to API key generator.'
          : 'Failed to connect to Hugging Face Space key generator.',
        details: err instanceof Error ? err.message : String(err),
      },
      { status }
    );
  }
}
