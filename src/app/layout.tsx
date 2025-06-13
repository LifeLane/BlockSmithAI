
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
// Removed: import MatrixBackground from '@/components/blocksmith-ai/MatrixBackground';
import AnimatedPageBorder from '@/components/blocksmith-ai/AnimatedPageBorder';

export const metadata: Metadata = {
  title: 'BlockSmithAI Trading Edge',
  description: 'AI-Powered Trading Signal Web App by BlockSmithAI Industries',
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
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased"> {/* Body will now get its background from globals.css */}
        {/* Removed: <MatrixBackground /> */}
        <AnimatedPageBorder />
        {/* This div ensures content is correctly layered if other fixed elements exist, and manages overall layout */}
        <div className="text-foreground min-h-screen flex flex-col">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
