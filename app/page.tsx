'use client';

import { useState, type FormEvent } from 'react';
import type { ScriptResult } from '../lib/types';

type InputMode = 'text' | 'url';

export default function Home() {
  const [mode, setMode] = useState<InputMode>('text');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function switchMode(next: InputMode) {
    setMode(next);
    setInput('');
    setError('');
    setResult(null);
  }

  async function createScript(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim()) {
      setError(mode === 'url' ? '블로그 URL을 입력해 줘.' : '블로그 본문을 입력해 줘.');
      setResult(null);
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch('/api/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '대본을 생성하지 못했어.');
      setResult(data as ScriptResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했어.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <nav className="topbar" aria-label="서비스 정보">
        <div className="brand"><span className="brand-mark">✳</span> POPSCRIPT<span className="brand-dot">.</span></div>
        <span className="top-tag">BLOG → VIDEO SCRIPT <span aria-hidden="true">↗</span></span>
      </nav>

      <header className="hero">
        <div className="hero-copy">
          <span className="kicker"><span className="sparkle">✦</span> YOUR CONTENT, REMIXED</span>
          <h1>글에서 <span className="title-highlight">장면으로!</span><span className="title-star" aria-hidden="true">✳</span></h1>
          <p>블로그 링크만 주면 바로 쇼츠 영상을 만들 수 있어요.<br className="desktop-break" /> 아이디어를 다음 장면으로 연결해 봐.</p>
          <div className="hero-stickers" aria-hidden="true"><span>CREATE ✦</span><span>PLAY ▶</span><span>REPEAT ↗</span></div>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-card art-card-back">BLOG<br />POST <span>✎</span></div><div className="art-arrow">➜</div><div className="art-card art-card-front"><span className="art-play">▶</span><strong>SCENE<br />01—06</strong></div><span className="art-spark">✳</span></div>
      </header>

      <div className="workspace">
        <section className="editor-panel" aria-labelledby="editor-title">
          <div className="section-heading"><span className="step">01 / INPUT</span><h2 id="editor-title">콘텐츠 넣기 <span aria-hidden="true">↘</span></h2></div>
          <div className="mode-tabs" role="group" aria-label="입력 방식">
            <button type="button" className={mode === 'text' ? 'mode-tab active' : 'mode-tab'} aria-pressed={mode === 'text'} onClick={() => switchMode('text')} disabled={loading}>✎ 본문 내용을 입력하기</button>
            <button type="button" className={mode === 'url' ? 'mode-tab active' : 'mode-tab'} aria-pressed={mode === 'url'} onClick={() => switchMode('url')} disabled={loading}>↗ URL 입력하기</button>
          </div>
          <form onSubmit={createScript}>
            <label className="input-label" htmlFor="content">{mode === 'url' ? 'BLOG URL' : 'BLOG CONTENT'}</label>
            {mode === 'url' ? <input id="content" type="url" value={input} onChange={e => { setInput(e.target.value); setError(''); }} placeholder="https://example.com/post" disabled={loading} aria-describedby="input-hint" /> : <textarea id="content" value={input} onChange={e => { setInput(e.target.value); setError(''); }} placeholder="블로그 본문을 여기에 붙여넣어 줘. 어떤 이야기가 영상으로 변할까?" rows={8} disabled={loading} aria-describedby="input-hint" />}
            <p id="input-hint" className="input-hint">{mode === 'url' ? 'URL 자동 본문 추출은 아직 지원하지 않아. 현재는 본문 입력을 이용해 줘.' : '블로그 본문을 직접 입력하면 AI가 대본과 4~6개 장면을 구성해.'}</p>
            <button className="generate-button" type="submit" disabled={loading || mode === 'url'}><span>{loading ? '대본 만드는 중…' : '대본 만들기'}</span><span className={loading ? 'button-icon spinning' : 'button-icon'}>{loading ? '✳' : '↗'}</span></button>
            {error && <p className="error-message" role="alert">⚠ {error}</p>}
          </form>
          <div className="editor-footer"><span>✦ AI SCRIPT STUDIO</span><span>MAKE SOMETHING NEW!</span></div>
        </section>

        <section className="result-panel" aria-labelledby="result-title" aria-live="polite">
          <div className="section-heading"><span className="step">02 / OUTPUT</span><h2 id="result-title">완성된 스토리 <span aria-hidden="true">✳</span></h2></div>
          {loading ? <div className="empty-state" role="status"><span className="empty-icon spinning">✳</span><h3>장면을 조립하는 중!</h3><p>대본과 스토리보드를 만들고 있어.</p></div> : result ? <div className="result-content"><article className="script-card"><div className="card-topline"><span>✦ GENERATED SCRIPT</span><span>01</span></div><h3>영상 대본</h3><p>{result.script}</p></article><div className="storyboard-heading"><h3>STORYBOARD <span>↘</span></h3><span>{String(result.scenes.length).padStart(2, '0')} SCENES</span></div><div className="scene-grid">{result.scenes.map((scene, index) => <article className={`scene-card scene-color-${index % 4}`} key={`${scene.order}-${index}`}><div className="scene-top"><span>SCENE</span><span>↗</span></div><strong>{String(scene.order).padStart(2, '0')}</strong><p>{scene.description}</p></article>)}</div></div> : <div className="empty-state"><div className="empty-illustration" aria-hidden="true"><span className="empty-sheet">✎<br />— —<br />— —</span><span className="empty-arrow">➜</span><span className="empty-film">▶</span></div><h3>여기서 이야기가 시작돼!</h3><p>본문을 입력하고 버튼을 누르면<br />대본과 장면 카드가 나타나.</p><span className="empty-caption">WAITING FOR YOUR STORY ✦</span></div>}
        </section>
      </div>
      <footer className="footer"><span>POPSCRIPT ✳</span><span>FROM WORDS TO SCENES © 2026</span></footer>
    </main>
  );
}
