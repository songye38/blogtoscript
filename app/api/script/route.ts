import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import type { ScriptResult } from '../../../lib/types';

export const runtime = 'nodejs';
const isUrl = (value: string) => /^https?:\/\/\S+$/i.test(value);

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const content = typeof body === 'object' && body !== null && 'content' in body && typeof body.content === 'string' ? body.content.trim() : '';
    if (!content) return NextResponse.json({ error: '블로그 URL 또는 본문을 입력해 줘.' }, { status: 400 });
    if (content.length > 30000) return NextResponse.json({ error: '입력이 너무 길어. 30,000자 이하로 입력해 줘.' }, { status: 400 });
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: '서버 설정을 확인해야 해.' }, { status: 503 });
    if (isUrl(content)) return NextResponse.json({ error: 'URL 본문 가져오기는 아직 지원하지 않아. 블로그 본문을 직접 붙여넣어 줘.' }, { status: 400 });
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 25000 });
    const response = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: '입력된 블로그 본문에 근거해 한국어 영상 대본과 장면 설명 4~6개를 생성해. 원문에 없는 사실은 만들지 마.' },
        { role: 'user', content },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'video_script', strict: true,
          schema: {
            type: 'object', additionalProperties: false,
            properties: {
              script: { type: 'string' },
              scenes: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { order: { type: 'integer' }, description: { type: 'string' } }, required: ['order', 'description'] } },
            }, required: ['script', 'scenes'],
          },
        },
      },
    });
    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error('empty response');
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || !('script' in parsed) || typeof parsed.script !== 'string' || !parsed.script.trim() || !('scenes' in parsed) || !Array.isArray(parsed.scenes) || parsed.scenes.length < 4 || parsed.scenes.length > 6 || !parsed.scenes.every((scene: unknown) => typeof scene === 'object' && scene !== null && 'order' in scene && typeof scene.order === 'number' && 'description' in scene && typeof scene.description === 'string')) throw new Error('invalid response');
    return NextResponse.json(parsed as ScriptResult);
  } catch {
    return NextResponse.json({ error: '대본을 생성하지 못했어. 입력 내용 또는 API 연결 상태를 확인해 줘.' }, { status: 502 });
  }
}
