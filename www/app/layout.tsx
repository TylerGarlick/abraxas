export const metadata = { title: 'Abraxas', description: 'Sovereign Brain' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0a0a0a', color: '#fafafa', fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}