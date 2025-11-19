import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CafeProvider } from '@/context/CafeContext';
import Header from '@/components/common/Header';
import { Providers } from "./provider";

export const metadata: Metadata = {
  title: 'Shega Cafe',
  description: 'Your neighborhood cafe for the finest coffee and food.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Providers>
          <CafeProvider>
            <Header />
            <main className="container mx-auto px-4 py-8">{children}</main>
            <Toaster />
          </CafeProvider>
        </Providers>
      </body>
    </html>
  );
}
