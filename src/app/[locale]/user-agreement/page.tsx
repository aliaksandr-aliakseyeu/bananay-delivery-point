import { Link } from '@/i18n/routing';

type Locale = 'en' | 'ru';

const content = {
  ru: {
    appName: 'Bananay Track',
    title: 'Пользовательское соглашение',
    updatedAt: 'Дата обновления: 13 апреля 2026',
    intro:
      'Настоящее соглашение регулирует использование сервиса Bananay Track. Начиная использование сервиса, вы подтверждаете согласие с его условиями.',
    backLabel: 'Вернуться ко входу',
    sections: [
      {
        title: '1. Предмет соглашения',
        paragraphs: [
          'Сервис предоставляет пользователю доступ к функциям авторизации, управления личным кабинетом и инструментам, связанным с выполнением рабочих задач внутри платформы Bananay.',
        ],
      },
      {
        title: '2. Регистрация и вход',
        paragraphs: [
          'Для доступа к сервису пользователь использует номер телефона и код подтверждения. Пользователь обязуется предоставлять достоверные данные и не передавать доступ третьим лицам.',
        ],
      },
      {
        title: '3. Обязанности пользователя',
        paragraphs: [
          'Пользователь обязуется использовать сервис добросовестно, не нарушать применимое законодательство, не вмешиваться в работу платформы и не использовать сервис для неправомерных целей.',
        ],
      },
      {
        title: '4. Ограничения и доступность',
        paragraphs: [
          'Сервис предоставляется по модели "как есть". Мы можем изменять состав функций, интерфейс и порядок доступа, если это необходимо для развития продукта, безопасности или соблюдения закона.',
        ],
      },
      {
        title: '5. Ответственность',
        paragraphs: [
          'Мы стремимся обеспечивать корректную работу сервиса, однако не гарантируем его абсолютную бесперебойность. Пользователь самостоятельно несёт ответственность за сохранность своих данных для входа и действия, совершённые под его аккаунтом.',
        ],
      },
      {
        title: '6. Персональные данные',
        paragraphs: [
          'Обработка персональных данных осуществляется в соответствии с политикой конфиденциальности, действующей для данного сервиса.',
        ],
      },
      {
        title: '7. Заключительные положения',
        paragraphs: [
          'Мы вправе обновлять настоящее соглашение. Продолжение использования сервиса после обновления означает согласие пользователя с новой редакцией документа.',
        ],
      },
    ],
  },
  en: {
    appName: 'Bananay Track',
    title: 'User Agreement',
    updatedAt: 'Last updated: April 13, 2026',
    intro:
      'This agreement governs the use of Bananay Track. By using the service, you confirm that you accept these terms.',
    backLabel: 'Back to sign in',
    sections: [
      {
        title: '1. Scope of the agreement',
        paragraphs: [
          'The service provides access to sign-in features, account management, and tools related to operational tasks within the Bananay platform.',
        ],
      },
      {
        title: '2. Registration and sign-in',
        paragraphs: [
          'To access the service, the user signs in with a phone number and verification code. The user agrees to provide accurate information and not share account access with third parties.',
        ],
      },
      {
        title: '3. User obligations',
        paragraphs: [
          'The user agrees to use the service in good faith, comply with applicable law, avoid interfering with the platform, and not use the service for unlawful purposes.',
        ],
      },
      {
        title: '4. Limitations and availability',
        paragraphs: [
          'The service is provided on an "as is" basis. We may change features, interface elements, or access procedures when necessary for product development, security, or legal compliance.',
        ],
      },
      {
        title: '5. Liability',
        paragraphs: [
          'We aim to keep the service operating properly, but we do not guarantee uninterrupted availability at all times. The user is responsible for protecting sign-in data and for actions performed under their account.',
        ],
      },
      {
        title: '6. Personal data',
        paragraphs: [
          'Personal data is processed in accordance with the privacy policy applicable to this service.',
        ],
      },
      {
        title: '7. Final provisions',
        paragraphs: [
          'We may update this agreement from time to time. Continued use of the service after an update means the user accepts the revised version.',
        ],
      },
    ],
  },
} satisfies Record<
  Locale,
  {
    appName: string;
    title: string;
    updatedAt: string;
    intro: string;
    backLabel: string;
    sections: Array<{ title: string; paragraphs: string[] }>;
  }
>;

export default async function UserAgreementPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = content[(locale === 'en' ? 'en' : 'ru') as Locale];

  return (
    <div className="bg-gray-50 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="p-0 sm:p-0">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {page.title}
          </h1>
          <p className="mt-3 text-sm text-slate-500">{page.updatedAt}</p>
          <p className="mt-6 text-base leading-7 text-slate-700">{page.intro}</p>

          <div className="mt-8 space-y-8">
            {page.sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold text-slate-950">{section.title}</h2>
                <div className="mt-3 space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-base leading-7 text-slate-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10">
            <Link href="/login" className="text-sm font-medium text-[#1e3a8a] hover:underline">
              {page.backLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
