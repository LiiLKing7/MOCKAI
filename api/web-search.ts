export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { query } = await req.json();
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'TAVILY_API_KEY is not configured on the server.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const searchRes = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        api_key: apiKey, 
        query: query, 
        search_depth: "basic" 
      })
    });

    if (!searchRes.ok) {
      const errorText = await searchRes.text();
      return new Response(JSON.stringify({ error: `Tavily API error: ${searchRes.status}`, details: errorText }), {
        status: searchRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const searchData = await searchRes.json();

    return new Response(JSON.stringify(searchData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Web search proxy error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
