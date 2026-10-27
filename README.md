# Blog to Script

Next.js App Router 기반 단일 페이지 MVP.

## 실행

```bash
npm install
cp .env.example .env.local
# .env.local의 GEMINI_API_KEY를 로컬에서 설정
npm run dev
```

Vercel 배포 시 동일한 환경변수를 프로젝트 설정에서 등록.

## 참고

- 본문 직접 입력은 Gemini에 전달해 대본 및 장면을 생성함.
- URL은 현재 모델에 전달하는 뼈대만 제공하며, URL 본문 수집 및 추출은 구현하지 않음. 따라서 URL 입력만으로 안정적인 결과 생성을 보장하지 않음.
- URL 본문 수집을 추가할 경우 SSRF, DNS, 리디렉션, 응답 크기 및 콘텐츠 형식 검증이 필요함.
- API 모델명과 무료 구간의 사용 가능 여부는 실제 환경에서 확인해야 함.
