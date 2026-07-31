import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Toaster } from 'react-hot-toast';
import { auth } from "../auth";
import { prisma } from "../lib/prisma";
import Providers from "../components/Providers";
import { Rajdhani, Space_Grotesk } from 'next/font/google';

const rajdhani = Rajdhani({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani'
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space'
});

export const metadata: Metadata = {
  title: "Gacha Review",
  description: "Review your favorite gacha game stories",
  referrer: 'no-referrer',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  let initialSpoilerMode = true;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { spoilerMode: true } });
    if (user && typeof user.spoilerMode !== 'undefined') {
      initialSpoilerMode = user.spoilerMode;
    }
  }

  return (
    <html lang="en" className={`${rajdhani.variable} ${spaceGrotesk.variable}`}>
      <body>
        <Providers initialSpoilerMode={initialSpoilerMode}>
          <Header session={session} />
          <main className="container" style={{ paddingBottom: '4rem', minHeight: '80vh' }}>
            {children}
          </main>
          <Footer />
          <Toaster position="bottom-right" toastOptions={{ 
            style: { background: 'var(--color-surface-border)', color: 'var(--color-text-main)', border: '1px solid var(--color-primary)' }
          }} />
        </Providers>
      </body>
    </html>
  );
}
