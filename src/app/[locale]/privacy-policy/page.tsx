import { LegalDocumentPage } from '@/components/auth/legal-document-page';

type Locale = 'en' | 'ka' | 'ru';

function resolveLegalLocale(locale: string): Locale {
  if (locale === 'ka') return 'ka';
  if (locale === 'ru') return 'ru';
  return 'en';
}

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
  ka: {
    appName: 'Bananay Track',
    title: 'კონფიდენციალურობის პოლიტიკა',
    updatedAt: 'განახლების თარიღი: 13 აპრილი, 2026',
    intro:
      'ეს პოლიტიკა აღწერს, რა მონაცემებს ვამუშავებთ Bananay Track-ის გამოყენებისას, რატომ გვჭირდება ისინი და როგორ ვიცავთ მათ.',
    backLabel: 'შესვლაზე დაბრუნება',
    sections: [
      {
        title: '1. რა მონაცემებს შეიძლება დავამუშაოთ',
        paragraphs: [
          'შეიძლება დავამუშაოთ თქვენი ტელეფონის ნომერი, ავტორიზაციის ინფორმაცია, მოწყობილობის ტექნიკური მონაცემები და სხვა ინფორმაცია, რომელსაც მომხმარებელი ნებაყოფლებით აწვდის სერვისის გამოყენებისას.',
          'ასევე შეიძლება დამუშავდეს მონაცემები, დაკავშირებული მიწოდების თვალყურის დევნებასთან, წერტილების მისამართებთან, შეკვეთების სტატუსებთან და ანგარიშში შესრულებულ ქმედებებთან.',
        ],
      },
      {
        title: '2. რისთვის გამოიყენება მონაცემები',
        paragraphs: [
          'მონაცემები გამოიყენება ანგარიშში შესასვლელად, სერვისის ფუნქციებზე წვდომისთვის, მომხმარებელთან კომუნიკაციისთვის, უსაფრთხოების გასაუმჯობესებლად და პლატფორმის სტაბილური მუშაობისთვის.',
          'ასევე შეიძლება გამოვიყენოთ მონაცემები სერვისის გასაუმჯობესებლად, შეცდომების ასაღმოფხვრელად და კანონით გათვალისწინებული მოთხოვნების შესასრულებლად.',
        ],
      },
      {
        title: '3. მონაცემების გადაცემა მესამე პირებზე',
        paragraphs: [
          'პერსონალურ მონაცემებს არ ვყიდით. მონაცემების გადაცემა შესაძლებელია მხოლოდ პარტნიორებზე და კონტრაქტორებზე, რომლებიც სერვისის მუშაობაში გვეხმარებიან, ან როცა გამჟღავნება კანონითაა გათვალისწინებული.',
        ],
      },
      {
        title: '4. მონაცემების შენახვა და დაცვა',
        paragraphs: [
          'ვიღებთ გონივრულ ტექნიკურ და ორგანიზაციულ ზომებს მონაცემების დაკარგვის, არაავტორიზებული წვდომის, ცვლილების ან გამჟღავნებისგან დასაცავად.',
          'მონაცემები ინახება იმ ხანს, რაც საჭიროა სერვისის მუშაობისთვის, ვალდებულებების შესასრულებლად და კანონის მოთხოვნების დასაცავად.',
        ],
      },
      {
        title: '5. მომხმარებლის უფლებები',
        paragraphs: [
          'მომხმარებელს შეუძლია მოითხოვოს მონაცემების გასწორება, განახლება ან წაშლა იმ ფარგლებში, რაც დაშვებულია გამოყენებადი კანონმდებლობითა და სერვისის ტექნიკური შესაძლებლობებით.',
        ],
      },
      {
        title: '6. კონტაქტი',
        paragraphs: [
          'მონაცემების დამუშავებასთან ან კონფიდენციალურობასთან დაკავშირებული კითხვებისთვის შეგიძლიათ დაუკავშირდეთ Bananay-ის გუნდს ოფიციალური კომუნიკაციის არხებით.',
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
  const page = content[resolveLegalLocale(locale)];

  return (
    <LegalDocumentPage
      title={page.title}
      updatedAt={page.updatedAt}
      intro={page.intro}
      backLabel={page.backLabel}
      sections={page.sections}
    />
  );
}
