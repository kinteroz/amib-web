import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "../globals.css";
import AiChatBot from "@/components/ui/ai/AiChatBot";

export const metadata: Metadata = {
  title: "Asociación Mexicana de Instituciones Bursátiles",
  description: "Portal oficial de la AMIB",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Critical: parsed before any external CSS file, eliminates white flash */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root { color-scheme: dark; }
          html, body {
            background-color: #002048 !important;
            margin: 0; padding: 0;
          }
        `}} />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
          <AiChatBot />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
