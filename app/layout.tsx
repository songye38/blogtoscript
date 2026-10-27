import './globals.css';
export const metadata = { title: 'Blog to Script', description: '블로그 콘텐츠를 영상 대본으로 변환' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
