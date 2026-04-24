import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "../globals.css";

export const metadata: Metadata = {
  title: {
    template: '%s | AMIB - Asociación Mexicana de Instituciones Bursátiles',
    default: 'AMIB - Asociación Mexicana de Instituciones Bursátiles | Portal Institucional',
  },
  description: "Organismo de autorregulación que representa a las casas de bolsa y operadoras de fondos de inversión en México. Certificaciones, normatividad y eventos bursátiles.",
  keywords: ["AMIB", "Bursátil", "Mercado de Valores", "Certificación AMIB", "Casas de Bolsa", "Inversiones México"],
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
