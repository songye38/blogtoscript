# POPSCRIPT — Blog to Script

팝아트 스타일의 블로그 → 영상 대본 MVP. Next.js App Router + OpenAI API.

## 실행

```bash
npm install
cp .env.example .env.local
# .env.local에 OPENAI_API_KEY를 설정하세요.
npm run dev
```

기존 프로젝트에 덮어쓸 때는 `app/page.tsx`와 `app/globals.css`만 교체해도 됩니다. 기존 `.env.local`은 덮어쓰거나 공유하지 마세요.

## 기능

- 본문 직접 입력 → `/api/script` → 대본 및 4~6개 장면 카드
- 빈 입력 / 로딩 / API 오류 상태
- URL 입력 탭은 UI만 제공하며, URL 본문 자동 추출은 아직 지원하지 않습니다. 버튼이 비활성화되어 있습니다.
- 모바일 우선 반응형

## Vercel

Framework Preset을 Next.js로 설정하고, Output Directory Override를 끄세요. `OPENAI_API_KEY`는 Vercel 프로젝트 환경변수에 별도로 설정해야 합니다.
