import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header, Footer } from '@/components/layout';
import { Toaster } from '@/components/ui/sonner';
import { Providers } from '@/components/providers';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
      <Providers>
        <div className="flex min-h-screen flex-col bg-gray-50">
          <Header />
          <main className="flex-1 flex flex-col bg-gray-50">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </Providers>
    </NextIntlClientProvider>
  );
}
