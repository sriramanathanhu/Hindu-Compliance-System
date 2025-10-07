import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { ReactQueryProvider } from '@/lib/providers';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Hindu Compliance System',
  description: 'Official Hindu temple compliance and certification system',
  keywords: ['hindu', 'temple', 'compliance', 'certification'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary-600 focus:text-white">
          Skip to main content
        </a>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
