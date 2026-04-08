'use client';

import Image from 'next/image';
import { useRouter } from '@/i18n/routing';
import { RedirectWhenAuthenticated } from '@/components/auth/redirect-when-authenticated';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const steps = [
    {
      number: '01',
      title: 'Видите входящие поставки',
      text: 'Что едет в ваше заведение и в каком статусе.',
    },
    {
      number: '02',
      title: 'Отслеживаете доставку',
      text: 'Где находится поставка и когда прибудет.',
    },
    {
      number: '03',
      title: 'Смотрите историю',
      text: 'Все прошлые доставки в одном месте.',
    },
  ];
  const benefits = [
    'Актуальный статус доставки',
    'Что едет и когда прибудет',
    'История всех поставок',
    'Меньше звонков и уточнений',
    'Понятный процесс получения',
  ];

  return (
    <RedirectWhenAuthenticated>
      <div className="flex flex-col bg-white text-slate-900">
        <section className="relative flex min-h-[75vh] items-center overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/hero.png')" }}
          />
          <div aria-hidden className="absolute inset-0 bg-slate-950/45" />
          <div className="relative mx-auto flex min-h-[72vh] max-w-7xl items-center px-4 py-10 sm:px-6 md:py-14 lg:px-8">
            <div className="flex w-full flex-col justify-center">
              <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Все поставки в ваше заведение - под контролем.
              </h1>

              <p className="mt-6 w-full text-lg leading-8 text-slate-100">
                Статусы, движение и история поставок - в одном интерфейсе.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="rounded-2xl bg-[#1e3a8a] px-6 text-base font-semibold text-white hover:bg-[#1d4ed8]"
                  onClick={() => router.push('/login')}
                >
                  Зарегистрироваться
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-2xl border-white/55 bg-white/5 px-6 text-base font-semibold text-white/90 hover:bg-white/15 hover:text-white"
                  onClick={() => router.push('/login')}
                >
                  Войти в приложение
                </Button>
              </div>
            </div>
          </div>
        </section>
        <div className="relative h-0 overflow-visible" aria-hidden="true">
          <div className="pointer-events-none absolute inset-x-0 -top-3 h-6 bg-white/55 blur-md" />
        </div>

        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Как это работает</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Как это работает для вашего заведения
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Вы видите только то, что важно при получении товара - без лишних действий и перегруженных экранов.
              </p>
            </div>

            <div className="mt-10 grid gap-12 lg:grid-cols-3 lg:gap-16">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={index === 0 ? 'pt-1' : 'pt-1 lg:border-l lg:border-slate-200 lg:pl-10'}
                >
                  <div className="text-5xl font-extrabold tracking-tight text-[#1d4ed8]">{step.number}</div>
                  <h3 className="mt-7 text-2xl font-bold tracking-tight text-slate-950">{step.title}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <div className="relative h-0 overflow-visible" aria-hidden="true">
          <div className="pointer-events-none absolute inset-x-0 -top-3 h-6 bg-white/55 blur-md" />
        </div>

        <section className="relative bg-slate-50 py-10">
          <div className="absolute inset-0">
            <div className="absolute bottom-0 left-1/2 top-0 w-full max-w-7xl -translate-x-1/2 overflow-hidden px-6">
              <Image
                src="/img.png"
                alt=""
                fill
                className="object-contain object-right"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
              <div
                className="absolute inset-0 bg-[linear-gradient(to_right,rgb(248_250_252)_0%,rgb(248_250_252)_52%,rgba(248,250,252,0.62)_64%,rgba(248,250,252,0.22)_76%,rgb(248_250_252)_100%)]"
                aria-hidden
              />
              <div
                className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50/95 via-slate-50/65 to-transparent"
                aria-hidden
              />
              <div
                className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-50/55 to-transparent"
                aria-hidden
              />
            </div>
          </div>
          <div className="relative z-10 mx-auto flex max-w-7xl flex-col justify-start px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl lg:pr-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Преимущества</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Почему это удобно
              </h2>
            </div>

            <ul className="mt-8 max-w-xl space-y-6">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-4">
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a] text-white">
                    <Check className="h-4 w-4" />
                  </span>
                  <p className="text-lg leading-8 text-slate-700">{benefit}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <div className="relative h-0 overflow-visible" aria-hidden="true">
          <div className="pointer-events-none absolute inset-x-0 -top-3 h-6 bg-slate-50/70 blur-md" />
        </div>

        <section className="bg-white">
          <div className="mx-auto max-w-4xl px-4 pb-8 pt-12 text-center sm:px-6 lg:px-8 lg:pb-10 lg:pt-14">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Следующий шаг</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Подключите свое заведение
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Зарегистрируйтесь или войдите, чтобы отслеживать поставки и историю.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                className="rounded-2xl bg-[#1e3a8a] px-6 text-base font-semibold text-white hover:bg-[#1d4ed8]"
                onClick={() => router.push('/login')}
              >
                Зарегистрироваться
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-2xl border-slate-300 bg-white px-6 text-base font-semibold text-slate-800 hover:bg-slate-50"
                onClick={() => router.push('/login')}
              >
                Войти в приложение
              </Button>
            </div>
          </div>
        </section>
      </div>
    </RedirectWhenAuthenticated>
  );
}
