
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import BottomNav from '@/components/layout/BottomNav';
import { ThemeProvider } from "@/components/theme-provider";
import { CurrentUserProvider } from '@/components/blocksmith-ai/CurrentUserProvider';
import { SolanaWalletProvider } from '@/components/blocksmith-ai/SolanaWalletProvider';
import Footer from '@/components/layout/Footer';

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
        <CurrentUserProvider>
          <SolanaWalletProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              disableTransitionOnChange
            >
              <div className="relative z-10 text-foreground min-h-screen flex flex-col">
                <main className="flex-grow flex flex-col pb-24">
                  {children}
                  <Footer />
                </main>
                <BottomNav />
              </div>
              <Toaster />
            </ThemeProvider>
          </SolanaWalletProvider>
        </CurrentUserProvider>
      </body>
    </html>
  );
}
