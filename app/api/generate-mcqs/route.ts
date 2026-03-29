import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { interest } = await request.json();

  const prompt = `You are an expert curator. Generate 3 multiple-choice questions to deeply understand the user's interest in "${interest}".
Each question should have 3-4 options.
Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
    }
  ]
}`;

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "grok-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  const data = await response.json();
  const rawText = data.choices[0].message.content;

  // Extract JSON
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  let questionsData;
  try {
    questionsData = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
  } catch (e) {
    questionsData = { questions: [] };
  }

  return NextResponse.json(questionsData);
}