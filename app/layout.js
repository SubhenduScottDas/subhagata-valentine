import './globals.css';

export const metadata = {
  title: 'Be My Valentine, Swagata? ❤️',
  description: 'A cute and funny Valentine app made with Next.js'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
