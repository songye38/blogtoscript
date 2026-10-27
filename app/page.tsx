'use client';
import { useState } from 'react';
import type { ScriptResult } from '../lib/types';
export default function Home() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function createScript(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim()) { setError('블로그 URL 또는 본문을 입력해 줘.'); setResult(null); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const response = await fetch('/api/script', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: input.trim() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '대본을 생성하지 못했어.');
      setResult(data as ScriptResult);
    } catch (err) { setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했어.'); }
    finally { setLoading(false); }
  }
  return <main className="shell"><header><span className="eyebrow">BLOG → SCRIPT</span><h1>블로그 글을<br />영상 대본으로.</h1><p className="intro">URL 또는 본문을 넣으면 대본과 4~6개 장면 구성을 만들어 줘.</p></header>
    <form onSubmit={createScript} className="panel"><label htmlFor="content">블로그 URL 또는 본문</label><textarea id="content" value={input} onChange={e => {setInput(e.target.value); if(error) setError('');}} placeholder="블로그 URL을 붙여넣거나 본문을 입력해 줘." rows={7} disabled={loading} aria-describedby="input-hint"/><p id="input-hint" className="hint">URL은 공개적으로 접근 가능한 페이지여야 해.</p><button disabled={loading} type="submit">{loading ? '대본 만드는 중…' : '대본 만들기'}</button>{error && <p className="error" role="alert">{error}</p>}</form>
    <section className="output" aria-live="polite"><h2>생성 결과</h2>{loading ? <div className="placeholder" role="status">대본과 장면을 구성하고 있어…</div> : result ? <><article className="panel"><h3>대본</h3><p className="script">{result.script}</p></article><h3 className="scene-title">장면 구성 <span>{result.scenes.length}개</span></h3><div className="scenes">{result.scenes.map(scene => <article className="scene" key={scene.order}><span>SCENE {String(scene.order).padStart(2,'0')}</span><p>{scene.description}</p></article>)}</div></> : <div className="placeholder">아직 생성된 대본이 없어. 위에서 콘텐츠를 입력해 줘.</div>}</section>
  </main>;
}
