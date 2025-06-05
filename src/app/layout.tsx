import type {Metadata} from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  weight: '400', // Specify a common weight
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LogoGenius - AI Powered Logo Creation',
  description: 'Generate stunning logo concepts with AI. Create professional brand identities in minutes.',
  keywords: 'AI logo, logo generator, brand identity, artificial intelligence, logo design, brand guide',
  authors: [{ name: 'LogoGenius Team' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://logogenius.app'),
  openGraph: {
    title: 'LogoGenius - AI Powered Logo Creation',
    description: 'Generate stunning logo concepts with AI.',
    images: [{
      url: '/logogenius-og.png',
      width: 1200,
      height: 630,
      alt: 'LogoGenius - AI Powered Logo Creation'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LogoGenius - AI Powered Logo Creation',
    description: 'Generate stunning logo concepts with AI.',
    images: ['/logogenius-og.png']
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${robotoMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}