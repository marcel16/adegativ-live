import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AdegaTV Live - Admin',
  description: 'Painel Administrativo AdegaTV Live',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
