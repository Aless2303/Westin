import type { Metadata } from "next";
import { geistSans, geistMono } from "../src/lib/nextFonts";
import "../src/assets/styles/globals.css";  // Check this path
import { AuthProvider } from "../src/context/AuthContext";
import ClientOnly from "../src/components/ClientOnly";
import AuthCheck from "../src/components/AuthCheck"

export const metadata: Metadata = {
  title: "Westin - Unde Vestul întâlnește Orientul",
  description: "Joc online MMORPG inspirat de Metin2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <ClientOnly>
            <AuthCheck/>
            {children}
          </ClientOnly>
        </AuthProvider>
      </body>
    </html>
  );
}