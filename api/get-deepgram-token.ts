export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'DEEPGRAM_API_KEY is not configured on the server.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Get Project ID
    const projectRes = await fetch("https://api.deepgram.com/v1/projects", {
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!projectRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch Deepgram projects' }), {
        status: projectRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const projectData = await projectRes.json();
    const projectId = projectData.projects?.[0]?.project_id;

    if (!projectId) {
      return new Response(JSON.stringify({ error: 'No Deepgram project found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Generate Temporary Key
    const keyRes = await fetch(`https://api.deepgram.com/v1/projects/${projectId}/keys`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        comment: 'Temporary client STT token',
        scopes: ['usage:write'],
        time_to_live_in_seconds: 3600 // 1 hour
      })
    });

    if (!keyRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to generate temporary Deepgram key' }), {
        status: keyRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const keyData = await keyRes.json();

    return new Response(JSON.stringify({ token: keyData.key }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Deepgram token proxy error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
