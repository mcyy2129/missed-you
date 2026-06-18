import { siteConfig } from '@/siteConfig_blog';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const apiKey = (process.env.NVIDIA_API_KEY || '').trim();

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Key missing" }), { status: 500 });
    }

    const modelId = 'minimaxai/minimax-m3';
    const systemPrompt = siteConfig.geminiConfig.systemPrompt;

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: siteConfig.geminiConfig.maxOutputTokens,
        temperature: siteConfig.geminiConfig.temperature,
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("NVIDIA API error:", JSON.stringify(data));
      return new Response(JSON.stringify({
        error: `Model error: ${response.status}`,
        details: data.error?.message || "Unknown error"
      }), { status: response.status });
    }

    const reply = data.choices?.[0]?.message?.content || "本喵现在不想理你喵...";

    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Chat API error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ status: "Ready", model: "minimaxai/minimax-m3" }), { status: 200 });
}
