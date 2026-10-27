import { NextResponse } from 'next/server';
import type { ScriptResult } from '../../../lib/types';
export const runtime = 'nodejs';
const isUrl = (value: string) => /^https?:\/\/\S+$/i.test(value);
async function getSource(content: string): Promise<string> {
  if (!isUrl(content)) return content;
  const url = new URL(content);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('올바른 URL을 입력해 줘.');
  // URL 서버 수집은 SSRF/리디렉션 검증 및 본문 추출 정책이 확정된 뒤 구현.
  // 임의 주소를 서버에서 fetch하지 않고 모델에 공개 URL을 전달하는 초기 뼈대.
  return `공개 블로그 URL: ${url.toString()}\nURL 내용에 접근할 수 없다면 추측하지 말고 오류를 반환해.`;
}
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const content = typeof body === 'object' && body !== null && 'content' in body && typeof body.content === 'string' ? body.content.trim() : '';
    if (!content) return NextResponse.json({ error: '블로그 URL 또는 본문을 입력해 줘.' }, { status: 400 });
    if (content.length > 30000) return NextResponse.json({ error: '입력이 너무 길어. 30,000자 이하로 입력해 줘.' }, { status: 400 });
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: '서버 설정을 확인해야 해.' }, { status: 503 });
    const source = await getSource(content);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    let response: Response;
    try {
      response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
        method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({ contents: [{ parts: [{ text: `다음 블로그 콘텐츠를 바탕으로 한국어 영상 대본과 4~6개 장면 설명을 생성해. 원문에 없는 사실을 만들지 마. URL만 주어진 경우 실제 본문을 확인할 수 없으면 대본을 지어내지 말고 오류를 나타내는 JSON을 반환해.\n\n${source}` }] }], generationConfig: { responseMimeType: 'application/json', responseSchema: { type: 'OBJECT', properties: { script: { type: 'STRING' }, scenes: { type: 'ARRAY', minItems: 4, maxItems: 6, items: { type: 'OBJECT', properties: { order: { type: 'INTEGER' }, description: { type: 'STRING' } }, required: ['order', 'description'] } } }, required: ['script', 'scenes'] } } })
      });
    } finally { clearTimeout(timeout); }
    if (!response.ok) return NextResponse.json({ error: 'AI 요청에 실패했어. 잠시 후 다시 시도해 줘.' }, { status: 502 });
    const payload = await response.json();
    const raw = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof raw !== 'string') throw new Error('empty');
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || !('script' in parsed) || typeof parsed.script !== 'string' || !parsed.script.trim() || !('scenes' in parsed) || !Array.isArray(parsed.scenes) || parsed.scenes.length < 4 || parsed.scenes.length > 6 || !parsed.scenes.every((scene: unknown) => typeof scene === 'object' && scene !== null && 'order' in scene && typeof scene.order === 'number' && 'description' in scene && typeof scene.description === 'string')) throw new Error('invalid response');
    return NextResponse.json(parsed as ScriptResult);
  } catch {
    return NextResponse.json({ error: '대본을 생성하지 못했어. 입력 내용 또는 연결 상태를 확인해 줘.' }, { status: 500 });
  }
}
