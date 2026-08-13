export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY is not configured on the server.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": req.headers.get('origin') || 'http://localhost:5173',
        "X-Title": "CEFR Mock AI",
      },
      body: JSON.stringify(body),
    });

    if (!orRes.ok) {
      return new Response(JSON.stringify({ error: `OpenRouter error: ${orRes.status}` }), {
        status: orRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stream the response directly back to the client
    return new Response(orRes.body, {
      status: 200,
      headers: {
        'Content-Type': orRes.headers.get('Content-Type') || 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Chat proxy error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
