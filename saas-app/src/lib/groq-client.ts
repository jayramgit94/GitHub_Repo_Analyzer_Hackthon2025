/*
 * ============================================
 * Groq Client — Ultra-Fast AI Inference
 * ============================================
 *
 * Uses Groq's OpenAI-compatible API with LLaMA 3.3 70B.
 * Free tier: ~30 req/min, extremely fast (custom LPU hardware).
 * Drop-in replacement for Gemini with better speed.
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Call Groq API and return the raw text response.
 * Returns null if API key is missing or call fails.
 */
export async function callGroq(
  messages: GroqMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: options?.temperature ?? 0.6,
        max_tokens: options?.maxTokens ?? 2048,
      }),
    });

    if (!res.ok) {
      console.error(`Groq API error: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error("Groq API call failed:", error);
    return null;
  }
}

/**
 * Call Groq and parse the response as JSON.
 * Returns null if parsing fails.
 */
export async function callGroqJSON<T = Record<string, unknown>>(
  messages: GroqMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<T | null> {
  const text = await callGroq(messages, options);
  if (!text) return null;

  try {
    // Handle potential markdown code fences
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]) as T;
  } catch {
    console.error("Groq JSON parse failed. Raw:", text.substring(0, 200));
    return null;
  }
}
