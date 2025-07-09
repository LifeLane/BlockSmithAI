
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import BottomNav from '@/components/layout/BottomNav';
import { ThemeProvider } from "@/components/theme-provider";
import ParticleBackground from '@/components/blocksmith-ai/ParticleBackground';
import ConnectionStatus from '@/components/layout/ConnectionStatus';

export const metadata: Metadata = {
  title: 'BlockShadow',
  description: 'AI-Powered Trading Insights from the BlockShadow Ecosystem',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="no-scrollbar">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ConnectionStatus />
          <ParticleBackground />
          <div className="relative z-10 text-foreground min-h-screen flex flex-col pt-12">
            <main className="flex-grow pb-16">
              {children}
            </main>
            <BottomNav />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
