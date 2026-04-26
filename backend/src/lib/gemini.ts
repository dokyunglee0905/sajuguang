import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function generateJSON<T = any>(prompt: string): Promise<T> {
  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text().trim();
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Gemini 응답에서 JSON을 찾을 수 없습니다.');
  return JSON.parse(match[0]) as T;
}
