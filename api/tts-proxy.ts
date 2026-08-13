export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { text, model } = await req.json();
    const apiKey = process.env.DEEPGRAM_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'DEEPGRAM_API_KEY is not configured on the server.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const voiceModel = model || 'aura-asteria-en';

    const ttsRes = await fetch(`https://api.deepgram.com/v1/speak?model=${voiceModel}`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!ttsRes.ok) {
      const errorText = await ttsRes.text();
      return new Response(JSON.stringify({ error: `Deepgram TTS error: ${ttsRes.status}`, details: errorText }), {
        status: ttsRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stream the audio blob directly back to the client
    return new Response(ttsRes.body, {
      status: 200,
      headers: {
        'Content-Type': ttsRes.headers.get('Content-Type') || 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('TTS proxy error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
