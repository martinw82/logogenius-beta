import type {Metadata} from 'next';
import { Geist_Sans } from 'next/font/google'; // Correct import for Geist Sans
import { Geist_Mono } from 'next/font/google'; // Correct import for Geist Mono
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist_Sans({ // Corrected variable name
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({ // Corrected variable name
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LogoGenius - AI Powered Logo Creation',
  description: 'Generate stunning logo concepts with AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
