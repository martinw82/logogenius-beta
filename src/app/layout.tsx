import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// Using system fonts instead of Google Fonts for better build compatibility
// Google Fonts can be added back once build environment has stable internet
const inter = { variable: '' };
const robotoMono = { variable: '' };

export const metadata: Metadata = {
  title: 'LogoGenius - AI Powered Logo Creation',
  description: 'Generate stunning logo concepts with AI. Create professional brand identities in minutes.',
  keywords: 'AI logo, logo generator, brand identity, artificial intelligence, logo design, brand guide',
  authors: [{ name: 'LogoGenius Team' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'),
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