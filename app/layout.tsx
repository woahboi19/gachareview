import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
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
        <main className="container" style={{ paddingBottom: '4rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
