import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { AuthSessionProvider } from '@/components/providers/session-provider';

const dmSans = localFont({
  src: [
    { path: './fonts/dm-sans-latin-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/dm-sans-latin-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/dm-sans-latin-600.woff2', weight: '600', style: 'normal' },
    { path: './fonts/dm-sans-latin-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
});

const instrumentSans = localFont({
  src: [
    { path: './fonts/instrument-sans-latin-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/instrument-sans-latin-600.woff2', weight: '600', style: 'normal' },
    { path: './fonts/instrument-sans-latin-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
});

const jetbrains = localFont({
  src: [
    { path: './fonts/jetbrains-mono-latin-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/jetbrains-mono-latin-500.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sorted — Company paperwork, sorted.',
  description:
    'Simple company records and compliance management for Indian Private Limited companies and their CAs.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://sorted.clipera.in'
  ),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${instrumentSans.variable} ${jetbrains.variable} font-sans antialiased`}
      >
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
