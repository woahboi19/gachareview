import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Toaster } from 'react-hot-toast';
import { auth } from "../auth";

export const metadata: Metadata = {
  title: "Gacha Review",
  description: "Review your favorite gacha game stories",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <Header session={session} />
        <main className="container" style={{ paddingBottom: '4rem', minHeight: '80vh' }}>
          {children}
        </main>
        <Footer />
        <Toaster position="bottom-right" toastOptions={{ 
          style: { background: 'var(--color-surface-border)', color: 'var(--color-text-main)', border: '1px solid var(--color-primary)' }
        }} />
      </body>
    </html>
  );
}
