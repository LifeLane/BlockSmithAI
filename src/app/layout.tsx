
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import MatrixBackground from '@/components/blocksmith-ai/MatrixBackground';
import AnimatedPageBorder from '@/components/blocksmith-ai/AnimatedPageBorder';

export const metadata: Metadata = {
  title: 'The Mind of BlockShadow',
  description: 'AI-Powered Trading Insights from SHADOW of the BlockShadow Ecosystem',
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
        {/* Updated fonts to Orbitron and Space Mono */}
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <MatrixBackground />
        <AnimatedPageBorder />
        {/* This div ensures content is correctly layered and applies the main background */}
        <div className="text-foreground bg-background min-h-screen flex flex-col relative z-10">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
