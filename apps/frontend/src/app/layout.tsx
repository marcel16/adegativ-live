import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'AdegaTV Live',
  description: 'Sistema de TV ao vivo para adegas e distribuidoras',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
