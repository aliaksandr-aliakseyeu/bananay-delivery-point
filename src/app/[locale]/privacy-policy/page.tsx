import { Link } from '@/i18n/routing';

type Locale = 'en' | 'ru';

const content = {
  ru: {
    appName: 'Bananay Track',
    title: 'Политика конфиденциальности',
    updatedAt: 'Дата обновления: 13 апреля 2026',
    intro:
      'Настоящая политика описывает, какие данные мы обрабатываем при использовании сервиса Bananay Track, зачем они нужны и как мы их защищаем.',
    backLabel: 'Вернуться ко входу',
    sections: [
      {
        title: '1. Какие данные мы можем обрабатывать',
        paragraphs: [
          'Мы можем обрабатывать номер телефона, сведения об авторизации, технические данные устройства и иные данные, которые вы добровольно предоставляете при использовании сервиса.',
          'Также могут обрабатываться данные, связанные с отслеживанием доставок, адресами точек, статусами заказов и действиями внутри личного кабинета.',
        ],
      },
      {
        title: '2. Для чего используются данные',
        paragraphs: [
          'Данные используются для входа в аккаунт, предоставления доступа к функциям сервиса, связи с пользователем, повышения безопасности и поддержки стабильной работы платформы.',
          'Мы также можем использовать данные для улучшения сервиса, устранения ошибок и исполнения требований законодательства.',
        ],
      },
      {
        title: '3. Передача данных третьим лицам',
        paragraphs: [
          'Мы не продаём персональные данные. Передача данных возможна только партнёрам и подрядчикам, которые помогают обеспечивать работу сервиса, а также в случаях, прямо предусмотренных законодательством.',
        ],
      },
      {
        title: '4. Хранение и защита данных',
        paragraphs: [
          'Мы принимаем разумные организационные и технические меры для защиты данных от утраты, неправомерного доступа, изменения или раскрытия.',
          'Данные хранятся столько, сколько это необходимо для работы сервиса, исполнения обязательств и соблюдения требований закона.',
        ],
      },
      {
        title: '5. Права пользователя',
        paragraphs: [
          'Пользователь вправе запросить уточнение, обновление или удаление данных в объёме, допустимом применимым законодательством и техническими возможностями сервиса.',
        ],
      },
      {
        title: '6. Контакты',
        paragraphs: [
          'По вопросам обработки данных и конфиденциальности вы можете связаться с командой сервиса через официальные каналы связи Bananay.',
        ],
      },
    ],
  },
  en: {
    appName: 'Bananay Track',
    title: 'Privacy Policy',
    updatedAt: 'Last updated: April 13, 2026',
    intro:
      'This policy explains what data we process when you use Bananay Track, why we need it, and how we protect it.',
    backLabel: 'Back to sign in',
    sections: [
      {
        title: '1. What data we may process',
        paragraphs: [
          'We may process your phone number, sign-in information, technical device data, and any other information you voluntarily provide while using the service.',
          'We may also process data related to delivery tracking, point addresses, order statuses, and actions performed inside the account.',
        ],
      },
      {
        title: '2. How we use the data',
        paragraphs: [
          'We use data to sign you into your account, provide access to service features, communicate with users, improve security, and keep the platform running properly.',
          'We may also use data to improve the service, fix issues, and comply with legal obligations.',
        ],
      },
      {
        title: '3. Sharing with third parties',
        paragraphs: [
          'We do not sell personal data. Data may be shared only with partners and contractors who help us operate the service, or when disclosure is required by law.',
        ],
      },
      {
        title: '4. Storage and protection',
        paragraphs: [
          'We take reasonable technical and organizational measures to protect data from loss, unauthorized access, alteration, or disclosure.',
          'Data is stored for as long as needed to operate the service, fulfill obligations, and comply with applicable law.',
        ],
      },
      {
        title: '5. User rights',
        paragraphs: [
          'Users may request correction, update, or deletion of their data to the extent allowed by applicable law and the technical capabilities of the service.',
        ],
      },
      {
        title: '6. Contact',
        paragraphs: [
          'If you have questions about data processing or privacy, you may contact the Bananay team through official communication channels.',
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

export default async function PrivacyPolicyPage({
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
