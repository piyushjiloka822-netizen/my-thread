import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const interest = searchParams.get('interest') || 'AI';

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'News API key missing' }, { status: 500 });
  }

  const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&q=${encodeURIComponent(interest)}&country=in&language=en&size=10`;

  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();

  if (!data.results) {
    return NextResponse.json({ articles: [], insight: "No new updates found." });
  }

  const articles = data.results.map((article: any) => ({
    title: article.title || 'No title',
    description: article.description || 'No summary available',
    link: article.link || '#',
    image: article.image_url || null,
    source: article.source_name || 'News Source',
    pubDate: article.pubDate || 'Just now',
  }));

  // Grok generates one personalized insight for the whole feed
  let insight = "Latest updates curated just for you.";
  try {
    const grokRes = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-4",
        messages: [{
          role: "user",
          content: `You are a helpful news curator. The user is interested in "${interest}". Generate ONE short, friendly sentence (max 15 words) explaining why these news updates are perfect for them. Be warm and specific.`
        }],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });
    const grokData = await grokRes.json();
    insight = grokData.choices[0].message.content.trim();
  } catch (e) {}

  return NextResponse.json({ articles, insight });
}