import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function toPrismaKeys(record) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_match, letter) => letter.toUpperCase()),
      value,
    ]),
  );
}

const adminEmail = (process.env.ADMIN_EMAIL || 'admin@nurtalim.uz').toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || 'NurTalim!2026';

const teachers = [
  {
    name: 'Dilnoza Karimova',
    photo: '/images/teachers/teacher-1.svg',
    specialization_uz: 'Ingliz tili o‘qituvchisi',
    specialization_ru: 'Преподаватель английского языка',
    specialization_en: 'English language teacher',
    experienceYears: 9,
    bio_uz:
      'CELTA sertifikatiga ega bo‘lib, 9 yildan beri umumiy ingliz tili va bolalar bilan ishlaydi. Darslarida jonli muloqot va o‘yin elementlaridan foydalanadi.',
    bio_ru:
      'Имеет сертификат CELTA и более 9 лет преподаёт общий английский и работает с детьми. На занятиях использует живое общение и игровые методики.',
    bio_en:
      'CELTA-certified with over 9 years of experience teaching general English and young learners. Her lessons combine live communication with interactive activities.',
  },
  {
    name: 'Aziz Rakhimov',
    photo: '/images/teachers/teacher-2.svg',
    specialization_uz: 'Frontend dasturchi va mentor',
    specialization_ru: 'Frontend-разработчик и ментор',
    specialization_en: 'Frontend developer and mentor',
    experienceYears: 8,
    bio_uz:
      'Amaliyotchi frontend dasturchi. React, JavaScript va zamonaviy veb-texnologiyalar bo‘yicha loyihaga asoslangan darslar olib boradi.',
    bio_ru:
      'Практикующий frontend-разработчик. Ведёт проектные занятия по React, JavaScript и современным веб-технологиям.',
    bio_en:
      'Practising frontend developer who teaches React, JavaScript and modern web technologies through project-based lessons.',
  },
  {
    name: 'Malika Yusupova',
    photo: '/images/teachers/teacher-3.svg',
    specialization_uz: 'Matematika o‘qituvchisi',
    specialization_ru: 'Преподаватель математики',
    specialization_en: 'Mathematics teacher',
    experienceYears: 11,
    bio_uz:
      '11 yillik tajribaga ega matematika o‘qituvchisi. Maktab dasturi, milliy sertifikat va SAT matematikasiga tayyorlaydi.',
    bio_ru:
      'Преподаватель математики с 11-летним опытом. Готовит к школьной программе, национальному сертификату и SAT Math.',
    bio_en:
      'Mathematics teacher with 11 years of experience preparing students for school curriculum, the national certificate and SAT Math.',
  },
  {
    name: 'Sergey Ivanov',
    photo: '/images/teachers/teacher-4.svg',
    specialization_uz: 'Rus tili filologi',
    specialization_ru: 'Филолог русского языка',
    specialization_en: 'Russian language philologist',
    experienceYears: 14,
    bio_uz:
      'Rus tili filologi, 14 yillik o‘qitish tajribasiga ega. Grammatika va so‘zlashuv ko‘nikmalarini amaliy vaziyatlar orqali rivojlantiradi.',
    bio_ru:
      'Филолог русского языка с 14-летним опытом преподавания. Развивает грамматику и разговорные навыки через практические ситуации.',
    bio_en:
      'Russian language philologist with 14 years of teaching experience, developing grammar and speaking skills through practical situations.',
  },
  {
    name: 'Nodira Saidova',
    photo: '/images/teachers/teacher-5.svg',
    specialization_uz: 'IELTS va so‘zlashuv bo‘yicha mutaxassis',
    specialization_ru: 'Специалист по IELTS и разговорной речи',
    specialization_en: 'IELTS and speaking specialist',
    experienceYears: 7,
    bio_uz:
      'IELTS 8.5 natijasiga ega. Imtihon strategiyalari, akademik yozuv va ishonchli so‘zlashuv ko‘nikmalarini o‘rgatadi.',
    bio_ru:
      'Результат IELTS 8.5. Обучает стратегиям экзамена, академическому письму и уверенной разговорной речи.',
    bio_en:
      'Holds an IELTS score of 8.5 and teaches exam strategies, academic writing and confident speaking skills.',
  },
  {
    name: 'Timur Aliyev',
    photo: '/images/teachers/teacher-6.svg',
    specialization_uz: 'Grafik dizayner',
    specialization_ru: 'Графический дизайнер',
    specialization_en: 'Graphic designer',
    experienceYears: 6,
    bio_uz:
      'Brend identifikatsiyasi va raqamli dizayn bo‘yicha mutaxassis. Figma, Adobe Illustrator va portfolio yaratishga o‘rgatadi.',
    bio_ru:
      'Специалист по брендингу и цифровому дизайну. Обучает Figma, Adobe Illustrator и созданию портфолио.',
    bio_en:
      'Specialist in brand identity and digital design, teaching Figma, Adobe Illustrator and portfolio building.',
  },
];

const courses = [
  {
    slug: 'umumiy-ingliz-tili',
    name_uz: 'Umumiy ingliz tili',
    name_ru: 'Общий английский',
    name_en: 'General English',
    description_uz:
      'Kundalik muloqotdan ish muhitigacha bo‘lgan barcha vaziyatlarda ingliz tilidan ishonchli foydalanishni o‘rgatuvchi bosqichma-bosqich kurs.',
    description_ru:
      'Пошаговый курс, который учит уверенно использовать английский в повседневном общении и рабочей среде.',
    description_en:
      'A step-by-step course that builds confidence in using English in everyday communication and the workplace.',
    curriculum_uz:
      'Tanishuv va to‘g‘ri talaffuz asoslari\nKundalik mavzularda so‘zlashuv\nGrammatika va yangi so‘zlar tizimi\nTinglash va o‘qib tushunish\nYozma muloqot va email yozish\nYakuniy suhbat va test',
    curriculum_ru:
      'Знакомство и основы правильного произношения\nРазговорные темы на каждый день\nГрамматика и система новой лексики\nАудирование и чтение\nПисьменное общение и email\nИтоговое собеседование и тест',
    curriculum_en:
      'Getting started and pronunciation foundations\nEveryday conversation topics\nGrammar and vocabulary system\nListening and reading comprehension\nWritten communication and emails\nFinal speaking assessment and test',
    category: 'english',
    price: 750000,
    duration_uz: '6 oy',
    duration_ru: '6 месяцев',
    duration_en: '6 months',
    lessonsPerWeek: 3,
    startDate: '2026-11-03',
    targetAudience_uz: 'Muloqotda ishonch qozonishni istagan o‘smirlar va kattalar',
    targetAudience_ru: 'Подростки и взрослые, желающие уверенно общаться',
    targetAudience_en: 'Teenagers and adults who want to communicate with confidence',
    requiredLevel_uz: 'Boshlang‘ich daraja, 12 yoshdan',
    requiredLevel_ru: 'Начальный уровень, с 12 лет',
    requiredLevel_en: 'Beginner level, ages 12+',
    paymentTerms_uz: 'Oylik to‘lov. Birinchi dars bepul. 2 oylik to‘lovga 5% chegirma.',
    paymentTerms_ru: 'Оплата ежемесячно. Первое занятие бесплатно. Скидка 5% при оплате за 2 месяца.',
    paymentTerms_en: 'Monthly payment. First lesson is free. 5% discount for a 2-month payment.',
    image: '/images/courses/english.svg',
    teacherIndexes: [0, 4],
  },
  {
    slug: 'ielts-tayyorlov',
    name_uz: 'IELTS tayyorlov',
    name_ru: 'Подготовка к IELTS',
    name_en: 'IELTS Preparation',
    description_uz:
      'Akademik va umumiy IELTS imtihoniga maqsadli tayyorlov: barcha to‘rt ko‘nikma, imtihon strategiyalari va muntazam mock testlar.',
    description_ru:
      'Целенаправленная подготовка к Academic и General IELTS: все четыре навыка, экзаменационные стратегии и регулярные пробные тесты.',
    description_en:
      'Targeted preparation for Academic and General IELTS: all four skills, exam strategies and regular mock tests.',
    curriculum_uz:
      'IELTS formati va baholash mezonlari\nListening: savol turlari va strategiyalar\nReading: tez o‘qish va vaqt boshqaruvi\nWriting Task 1 va Task 2\nSpeaking: ravonlik va talaffuz\nHaftalik mock test va fikr-mulohaza',
    curriculum_ru:
      'Формат IELTS и критерии оценивания\nListening: типы заданий и стратегии\nReading: скорочтение и тайм-менеджмент\nWriting Task 1 и Task 2\nSpeaking: беглость и произношение\nЕженедельный пробный тест и обратная связь',
    curriculum_en:
      'IELTS format and assessment criteria\nListening: question types and strategies\nReading: speed reading and time management\nWriting Task 1 and Task 2\nSpeaking: fluency and pronunciation\nWeekly mock test and feedback',
    category: 'english',
    price: 1200000,
    duration_uz: '4 oy',
    duration_ru: '4 месяца',
    duration_en: '4 months',
    lessonsPerWeek: 3,
    startDate: '2026-11-09',
    targetAudience_uz: 'Chet elda o‘qish yoki ishlashni rejalashtirganlar',
    targetAudience_ru: 'Планирующие учёбу или работу за рубежом',
    targetAudience_en: 'People planning to study or work abroad',
    requiredLevel_uz: 'Intermediate (B1) va yuqori',
    requiredLevel_ru: 'Intermediate (B1) и выше',
    requiredLevel_en: 'Intermediate (B1) and above',
    paymentTerms_uz: 'Oylik to‘lov. Mock testlar narxga kiritilgan.',
    paymentTerms_ru: 'Оплата ежемесячно. Пробные тесты включены в стоимость.',
    paymentTerms_en: 'Monthly payment. Mock tests are included in the price.',
    image: '/images/courses/ielts.svg',
    teacherIndexes: [4, 0],
  },
  {
    slug: 'frontend-dasturlash',
    name_uz: 'Frontend dasturlash',
    name_ru: 'Frontend-разработка',
    name_en: 'Frontend Development',
    description_uz:
      'HTML, CSS, JavaScript va React asosida zamonaviy veb-ilovalar yaratishni o‘rgatuvchi amaliy kurs. Yakunda portfolio uchun real loyiha tayyorlanadi.',
    description_ru:
      'Практический курс по созданию современных веб-приложений на HTML, CSS, JavaScript и React. В конце вы создадите реальный проект для портфолио.',
    description_en:
      'A hands-on course in building modern web applications with HTML, CSS, JavaScript and React. You will finish with a real portfolio project.',
    curriculum_uz:
      'HTML5 va semantik markup\nCSS: Flexbox, Grid va responsiv dizayn\nJavaScript asoslari va DOM\nGit va GitHub bilan ishlash\nReact komponentlar va state\nAPI bilan ishlash va yakuniy loyiha',
    curriculum_ru:
      'HTML5 и семантическая разметка\nCSS: Flexbox, Grid и адаптивный дизайн\nОсновы JavaScript и DOM\nРабота с Git и GitHub\nReact-компоненты и state\nРабота с API и финальный проект',
    curriculum_en:
      'HTML5 and semantic markup\nCSS: Flexbox, Grid and responsive design\nJavaScript fundamentals and DOM\nWorking with Git and GitHub\nReact components and state\nAPI integration and final project',
    category: 'it',
    price: 1500000,
    duration_uz: '8 oy',
    duration_ru: '8 месяцев',
    duration_en: '8 months',
    lessonsPerWeek: 3,
    startDate: '2026-11-02',
    targetAudience_uz: 'IT sohasiga o‘tmoqchi bo‘lganlar va talabalar',
    targetAudience_ru: 'Желающие перейти в IT и студенты',
    targetAudience_en: 'Career changers and students interested in IT',
    requiredLevel_uz: 'Kompyuterdan foydalanish ko‘nikmasi',
    requiredLevel_ru: 'Базовые навыки работы с компьютером',
    requiredLevel_en: 'Basic computer literacy',
    paymentTerms_uz: 'Oylik to‘lov yoki to‘liq kurs uchun 10% chegirma.',
    paymentTerms_ru: 'Оплата ежемесячно или скидка 10% за полный курс.',
    paymentTerms_en: 'Monthly payment or 10% discount for the full course.',
    image: '/images/courses/frontend.svg',
    teacherIndexes: [1],
  },
  {
    slug: 'python-dasturlash',
    name_uz: 'Python dasturlash',
    name_ru: 'Программирование на Python',
    name_en: 'Python Programming',
    description_uz:
      'Python tilini noldan o‘rganish, avtomatlashtirish va web backend asoslarini amaliy loyihalar orqali o‘zlashtirish.',
    description_ru:
      'Изучение Python с нуля, автоматизация и основы веб-бэкенда через практические проекты.',
    description_en:
      'Learn Python from scratch, automation and the foundations of web backend through practical projects.',
    curriculum_uz:
      'Python sintaksisi va ma’lumot turlari\nShartlar, tsikllar va funksiyalar\nOOP asoslari\nFayllar va kutubxonalar\nMa’lumotlar bazasi asoslari\nYakuniy avtomatlashtirish loyihasi',
    curriculum_ru:
      'Синтаксис Python и типы данных\nУсловия, циклы и функции\nОсновы ООП\nФайлы и библиотеки\nОсновы баз данных\nИтоговый проект автоматизации',
    curriculum_en:
      'Python syntax and data types\nConditions, loops and functions\nOOP fundamentals\nFiles and libraries\nDatabase fundamentals\nFinal automation project',
    category: 'it',
    price: 1300000,
    duration_uz: '6 oy',
    duration_ru: '6 месяцев',
    duration_en: '6 months',
    lessonsPerWeek: 2,
    startDate: '2026-12-01',
    targetAudience_uz: 'Yangi kasb o‘rganmoqchi bo‘lganlar',
    targetAudience_ru: 'Желающие освоить новую профессию',
    targetAudience_en: 'People looking to learn a new profession',
    requiredLevel_uz: 'Boshlang‘ich, kompyuter savodxonligi',
    requiredLevel_ru: 'Начальный, компьютерная грамотность',
    requiredLevel_en: 'Beginner, basic computer literacy',
    paymentTerms_uz: 'Oylik to‘lov. Noutbuk bilan kelish tavsiya etiladi.',
    paymentTerms_ru: 'Оплата ежемесячно. Рекомендуется приходить со своим ноутбуком.',
    paymentTerms_en: 'Monthly payment. Bringing your own laptop is recommended.',
    image: '/images/courses/python.svg',
    teacherIndexes: [1],
  },
  {
    slug: 'matematika',
    name_uz: 'Matematika',
    name_ru: 'Математика',
    name_en: 'Mathematics',
    description_uz:
      'Maktab matematikasini mustahkamlash, mantiqiy fikrlashni rivojlantirish va imtihonlarga tizimli tayyorlanish.',
    description_ru:
      'Укрепление школьной математики, развитие логического мышления и системная подготовка к экзаменам.',
    description_en:
      'Strengthen school mathematics, develop logical thinking and prepare systematically for exams.',
    curriculum_uz:
      'Sonlar va algebraik ifodalar\nTenglamalar va tengsizliklar\nFunksiyalar va grafiklar\nGeometriya asoslari\nMatematik mantiq va masalalar\nNazorat ishi va tahlil',
    curriculum_ru:
      'Числа и алгебраические выражения\nУравнения и неравенства\nФункции и графики\nОсновы геометрии\nМатематическая логика и задачи\nКонтрольная работа и разбор',
    curriculum_en:
      'Numbers and algebraic expressions\nEquations and inequalities\nFunctions and graphs\nGeometry fundamentals\nMathematical logic and problem solving\nAssessment and review',
    category: 'math',
    price: 800000,
    duration_uz: '9 oy',
    duration_ru: '9 месяцев',
    duration_en: '9 months',
    lessonsPerWeek: 2,
    startDate: '2026-11-04',
    targetAudience_uz: '5–11-sinf o‘quvchilari',
    targetAudience_ru: 'Ученики 5–11 классов',
    targetAudience_en: 'Students in grades 5–11',
    requiredLevel_uz: 'Sinf darajasiga mos bilim',
    requiredLevel_ru: 'Знания в соответствии с классом',
    requiredLevel_en: 'Knowledge appropriate for the grade',
    paymentTerms_uz: 'Oylik to‘lov. Qo‘shimcha konsultatsiyalar bepul.',
    paymentTerms_ru: 'Оплата ежемесячно. Дополнительные консультации бесплатны.',
    paymentTerms_en: 'Monthly payment. Extra consultations are free.',
    image: '/images/courses/math.svg',
    teacherIndexes: [2],
  },
  {
    slug: 'rus-tili',
    name_uz: 'Rus tili',
    name_ru: 'Русский язык',
    name_en: 'Russian Language',
    description_uz:
      'Rus tilida erkin so‘zlashish, grammatikani mustahkamlash va ish muhitida muloqot qilish ko‘nikmalarini rivojlantirish.',
    description_ru:
      'Свободное общение на русском, укрепление грамматики и развитие навыков деловой коммуникации.',
    description_en:
      'Develop fluent Russian, strengthen grammar and build communication skills for the workplace.',
    curriculum_uz:
      'Alifbo va talaffuz\nAsosiy grammatik qoliplar\nKundalik suhbat mavzulari\nO‘qish va tinglash\nIsh yozishmalari\nYakuniy suhbat',
    curriculum_ru:
      'Алфавит и произношение\nОсновные грамматические конструкции\nТемы повседневных разговоров\nЧтение и аудирование\nДеловая переписка\nИтоговое собеседование',
    curriculum_en:
      'Alphabet and pronunciation\nCore grammar patterns\nEveryday conversation topics\nReading and listening\nBusiness correspondence\nFinal speaking assessment',
    category: 'russian',
    price: 700000,
    duration_uz: '6 oy',
    duration_ru: '6 месяцев',
    duration_en: '6 months',
    lessonsPerWeek: 3,
    startDate: '2026-11-10',
    targetAudience_uz: 'Ish va kundalik hayotda rus tili kerak bo‘lganlar',
    targetAudience_ru: 'Тем, кому русский нужен для работы и повседневной жизни',
    targetAudience_en: 'Those who need Russian for work and everyday life',
    requiredLevel_uz: 'Boshlang‘ich daraja',
    requiredLevel_ru: 'Начальный уровень',
    requiredLevel_en: 'Beginner level',
    paymentTerms_uz: 'Oylik to‘lov. Guruhda 12 kishigacha.',
    paymentTerms_ru: 'Оплата ежемесячно. До 12 человек в группе.',
    paymentTerms_en: 'Monthly payment. Up to 12 students per group.',
    image: '/images/courses/russian.svg',
    teacherIndexes: [3],
  },
  {
    slug: 'bolalar-uchun-ingliz-tili',
    name_uz: 'Bolalar uchun ingliz tili',
    name_ru: 'Английский для детей',
    name_en: 'English for Kids',
    description_uz:
      'O‘yin, qo‘shiq va interaktiv topshiriqlar orqali 7–11 yoshli bolalarda ingliz tiliga qiziqish uyg‘otuvchi kurs.',
    description_ru:
      'Курс, который пробуждает интерес к английскому у детей 7–11 лет через игры, песни и интерактивные задания.',
    description_en:
      'A course that inspires a love of English in children aged 7–11 through games, songs and interactive tasks.',
    curriculum_uz:
      'Alifbo va tovushlar\nRanglar, hayvonlar va oila\nKundalik iboralar\nQo‘shiqlar va o‘yinlar\nKichik hikoyalar\nOchiq dars',
    curriculum_ru:
      'Алфавит и звуки\nЦвета, животные и семья\nПовседневные фразы\nПесни и игры\nКороткие истории\nОткрытый урок',
    curriculum_en:
      'Alphabet and sounds\nColours, animals and family\nEveryday phrases\nSongs and games\nShort stories\nOpen lesson',
    category: 'english',
    price: 600000,
    duration_uz: '12 oy',
    duration_ru: '12 месяцев',
    duration_en: '12 months',
    lessonsPerWeek: 2,
    startDate: '2026-11-07',
    targetAudience_uz: '7–11 yoshli bolalar',
    targetAudience_ru: 'Дети 7–11 лет',
    targetAudience_en: 'Children aged 7–11',
    requiredLevel_uz: 'Tayyorlov talab qilinmaydi',
    requiredLevel_ru: 'Подготовка не требуется',
    requiredLevel_en: 'No preparation required',
    paymentTerms_uz: 'Oylik to‘lov. Ota-onalar uchun har oy hisobot.',
    paymentTerms_ru: 'Оплата ежемесячно. Ежемесячный отчёт для родителей.',
    paymentTerms_en: 'Monthly payment. Monthly report for parents.',
    image: '/images/courses/kids-english.svg',
    teacherIndexes: [0],
  },
  {
    slug: 'grafik-dizayn',
    name_uz: 'Grafik dizayn',
    name_ru: 'Графический дизайн',
    name_en: 'Graphic Design',
    description_uz:
      'Figma va Illustrator yordamida brend identifikatsiyasi, ijtimoiy tarmoq dizayni va portfolio yaratishni o‘rgatuvchi amaliy kurs.',
    description_ru:
      'Практический курс по брендингу, дизайну для соцсетей и созданию портфолио в Figma и Illustrator.',
    description_en:
      'A practical course in brand identity, social media design and portfolio creation using Figma and Illustrator.',
    curriculum_uz:
      'Dizayn tafakkuri va kompozitsiya\nFigma asoslari\nAdobe Illustrator\nBrend identifikatsiyasi\nIjtimoiy tarmoq kontenti\nPortfolio taqdimoti',
    curriculum_ru:
      'Дизайн-мышление и композиция\nОсновы Figma\nAdobe Illustrator\nБренд-идентификация\nКонтент для соцсетей\nПрезентация портфолио',
    curriculum_en:
      'Design thinking and composition\nFigma fundamentals\nAdobe Illustrator\nBrand identity\nSocial media content\nPortfolio presentation',
    category: 'it',
    price: 1100000,
    duration_uz: '5 oy',
    duration_ru: '5 месяцев',
    duration_en: '5 months',
    lessonsPerWeek: 2,
    startDate: '2026-12-02',
    targetAudience_uz: 'Dizaynga qiziquvchilar va kontent yaratuvchilar',
    targetAudience_ru: 'Интересующиеся дизайном и контент-мейкеры',
    targetAudience_en: 'Design enthusiasts and content creators',
    requiredLevel_uz: 'Boshlang‘ich, ijodiy qiziqish',
    requiredLevel_ru: 'Начальный, творческий интерес',
    requiredLevel_en: 'Beginner, creative interest',
    paymentTerms_uz: 'Oylik to‘lov. Shaxsiy noutbuk tavsiya etiladi.',
    paymentTerms_ru: 'Оплата ежемесячно. Рекомендуется личный ноутбук.',
    paymentTerms_en: 'Monthly payment. A personal laptop is recommended.',
    image: '/images/courses/design.svg',
    teacherIndexes: [5],
  },
  {
    slug: 'sat-matematika',
    name_uz: 'SAT matematika',
    name_ru: 'SAT Math',
    name_en: 'SAT Math',
    description_uz:
      'SAT imtihonining matematika qismiga yo‘naltirilgan intensiv tayyorlov: formulalar, strategiyalar va vaqtni boshqarish.',
    description_ru:
      'Интенсивная подготовка к математической части SAT: формулы, стратегии и управление временем.',
    description_en:
      'Intensive preparation for the SAT Math section: formulas, strategies and time management.',
    curriculum_uz:
      'SAT Math formati\nAlgebra va funksiyalar\nGeometriya va trigonometriya\nMa’lumotlar tahlili\nKalkulyatorsiz bo‘lim strategiyalari\nTo‘liq mock test',
    curriculum_ru:
      'Формат SAT Math\nАлгебра и функции\nГеометрия и тригонометрия\nАнализ данных\nСтратегии секции без калькулятора\nПолный пробный тест',
    curriculum_en:
      'SAT Math format\nAlgebra and functions\nGeometry and trigonometry\nData analysis\nNo-calculator section strategies\nFull mock test',
    category: 'math',
    price: 1000000,
    duration_uz: '4 oy',
    duration_ru: '4 месяца',
    duration_en: '4 months',
    lessonsPerWeek: 3,
    startDate: '2026-11-05',
    targetAudience_uz: 'SAT topshirishni rejalashtirgan o‘quvchilar',
    targetAudience_ru: 'Ученики, планирующие сдавать SAT',
    targetAudience_en: 'Students planning to take the SAT',
    requiredLevel_uz: 'Yuqori o‘rta maktab matematikasi',
    requiredLevel_ru: 'Математика старшей школы',
    requiredLevel_en: 'High school mathematics',
    paymentTerms_uz: 'Oylik to‘lov. Mock testlar narxga kiritilgan.',
    paymentTerms_ru: 'Оплата ежемесячно. Пробные тесты включены.',
    paymentTerms_en: 'Monthly payment. Mock tests are included.',
    image: '/images/courses/sat-math.svg',
    teacherIndexes: [2],
  },
];

const groups = [
  {
    courseIndex: 0,
    teacherIndex: 0,
    days: ['mon', 'wed', 'fri'],
    time: '18:00–19:30',
    capacity: 12,
    enrolledCount: 8,
    level: { uz: 'Boshlang‘ich', ru: 'Начальный', en: 'Beginner' },
    startDate: '2026-11-03',
    status: 'open',
  },
  {
    courseIndex: 0,
    teacherIndex: 4,
    days: ['tue', 'thu', 'sat'],
    time: '10:00–11:30',
    capacity: 12,
    enrolledCount: 12,
    level: { uz: 'Elementary', ru: 'Elementary', en: 'Elementary' },
    startDate: '2026-11-03',
    status: 'full',
  },
  {
    courseIndex: 1,
    teacherIndex: 4,
    days: ['mon', 'wed', 'fri'],
    time: '19:00–20:30',
    capacity: 10,
    enrolledCount: 6,
    level: { uz: 'Upper-Intermediate', ru: 'Upper-Intermediate', en: 'Upper-Intermediate' },
    startDate: '2026-11-09',
    status: 'open',
  },
  {
    courseIndex: 1,
    teacherIndex: 0,
    days: ['tue', 'thu'],
    time: '17:00–18:30',
    capacity: 10,
    enrolledCount: 10,
    level: { uz: 'Upper-Intermediate', ru: 'Upper-Intermediate', en: 'Upper-Intermediate' },
    startDate: '2026-11-10',
    status: 'full',
  },
  {
    courseIndex: 2,
    teacherIndex: 1,
    days: ['mon', 'wed', 'fri'],
    time: '18:30–20:30',
    capacity: 12,
    enrolledCount: 7,
    level: { uz: 'Intermediate', ru: 'Intermediate', en: 'Intermediate' },
    startDate: '2026-11-02',
    status: 'open',
  },
  {
    courseIndex: 3,
    teacherIndex: 1,
    days: ['tue', 'thu'],
    time: '19:00–20:30',
    capacity: 12,
    enrolledCount: 4,
    level: { uz: 'Boshlang‘ich', ru: 'Начальный', en: 'Beginner' },
    startDate: '2026-12-01',
    status: 'soon',
  },
  {
    courseIndex: 4,
    teacherIndex: 2,
    days: ['mon', 'wed'],
    time: '16:00–17:30',
    capacity: 14,
    enrolledCount: 11,
    level: { uz: 'Intermediate', ru: 'Intermediate', en: 'Intermediate' },
    startDate: '2026-11-04',
    status: 'open',
  },
  {
    courseIndex: 5,
    teacherIndex: 3,
    days: ['tue', 'thu', 'sat'],
    time: '11:00–12:30',
    capacity: 12,
    enrolledCount: 9,
    level: { uz: 'Boshlang‘ich', ru: 'Начальный', en: 'Beginner' },
    startDate: '2026-11-10',
    status: 'open',
  },
  {
    courseIndex: 6,
    teacherIndex: 0,
    days: ['tue', 'thu'],
    time: '16:00–17:00',
    capacity: 10,
    enrolledCount: 8,
    level: { uz: 'Boshlang‘ich', ru: 'Начальный', en: 'Beginner' },
    startDate: '2026-11-07',
    status: 'open',
  },
  {
    courseIndex: 7,
    teacherIndex: 5,
    days: ['mon', 'wed', 'fri'],
    time: '14:00–16:00',
    capacity: 10,
    enrolledCount: 3,
    level: { uz: 'Boshlang‘ich', ru: 'Начальный', en: 'Beginner' },
    startDate: '2026-12-02',
    status: 'soon',
  },
  {
    courseIndex: 8,
    teacherIndex: 2,
    days: ['sat'],
    time: '09:00–12:00',
    capacity: 16,
    enrolledCount: 13,
    level: { uz: 'Advanced', ru: 'Advanced', en: 'Advanced' },
    startDate: '2026-11-05',
    status: 'open',
  },
  {
    courseIndex: 4,
    teacherIndex: 2,
    days: ['tue', 'thu'],
    time: '18:00–19:30',
    capacity: 14,
    enrolledCount: 14,
    level: { uz: 'Boshlang‘ich', ru: 'Начальный', en: 'Beginner' },
    startDate: '2026-11-04',
    status: 'full',
  },
];

const testimonials = [
  {
    author: 'Madina Tursunova',
    text_uz:
      'IELTS kursida 4 oy o‘qib, 7.5 natijaga erishdim. Ustozlar har bir xatoni sabr bilan tushuntirdi. Markazdagi muhit juda iliq.',
    text_ru:
      'За 4 месяца на курсе IELTS я получила 7.5. Преподаватели терпеливо объясняли каждую ошибку. В центре очень тёплая атмосфера.',
    text_en:
      'I reached 7.5 after four months in the IELTS course. The teachers patiently explained every mistake. The atmosphere here is very welcoming.',
    rating: 5,
    photo: '/images/testimonials/student-1.svg',
  },
  {
    author: 'Javohir Rasulov',
    text_uz:
      'Frontend kursida noldan boshladim. Yakunda React bilan o‘z loyihamni yaratdim va ishga joylashdim. Amaliyotga berilgan e’tibor juda katta.',
    text_ru:
      'Начал курс Frontend с нуля. В конце создал собственный проект на React и нашёл работу. Огромное внимание уделяется практике.',
    text_en:
      'I started the Frontend course from scratch. By the end I built my own React project and found a job. The focus on practice is excellent.',
    rating: 5,
    photo: '/images/testimonials/student-2.svg',
  },
  {
    author: 'Kamila Abdullayeva',
    text_uz:
      'Matematikadan imtihonga tayyorlanishda juda katta yordam berdilar. Har hafta nazorat ishi bo‘lib, natijani ota-onam bilan birga kuzatdik.',
    text_ru:
      'Очень помогли с подготовкой к экзамену по математике. Каждую неделю была контрольная, результат отслеживали вместе с родителями.',
    text_en:
      'They helped me a lot with exam preparation in mathematics. Weekly assessments let my parents and me track my progress.',
    rating: 5,
    photo: '/images/testimonials/student-3.svg',
  },
  {
    author: 'Ruslan Ganiev',
    text_uz:
      'Rus tilida ishlash uchun muloqot qilishim kerak edi. Uch oydan keyin mijozlar bilan bemalol gaplashadigan bo‘ldim. Darslar amaliy va qiziqarli.',
    text_ru:
      'Мне нужно было общаться на русском по работе. Через три месяца я уже свободно разговаривал с клиентами. Занятия практичные и интересные.',
    text_en:
      'I needed Russian for work communication. After three months I could speak with clients confidently. The lessons are practical and engaging.',
    rating: 4,
    photo: '/images/testimonials/student-4.svg',
  },
  {
    author: 'Shahnoza Mirzayeva',
    text_uz:
      'Bolam ingliz tili darslarini intiqlik bilan kutadi. Ustozlar bolalar bilan juda yaxshi til topishadi, har oy hisobot berib turadilar.',
    text_ru:
      'Мой ребёнок с нетерпением ждёт уроки английского. Педагоги отлично находят общий язык с детьми и каждый месяц дают отчёт.',
    text_en:
      'My child looks forward to English lessons. The teachers connect wonderfully with children and provide monthly reports.',
    rating: 5,
    photo: '/images/testimonials/student-5.svg',
  },
  {
    author: 'Bobur Yuldashev',
    text_uz:
      'Grafik dizayn kursi kutganimdan ham foydali chiqdi. Portfolio tayyorlab, birinchi buyurtmalarimni oldim. Ustoz har bir ishimni batafsil tahlil qildi.',
    text_ru:
      'Курс графического дизайна оказался даже полезнее, чем я ожидал. Собрал портфолио и получил первые заказы. Преподаватель подробно разбирал каждую работу.',
    text_en:
      'The graphic design course was even more useful than I expected. I built a portfolio and received my first orders. Every project was reviewed in detail.',
    rating: 5,
    photo: '/images/testimonials/student-6.svg',
  },
];

const faqItems = [
  {
    question_uz: 'Birinchi sinov darsi haqiqatan bepulmi?',
    question_ru: 'Первое пробное занятие действительно бесплатное?',
    question_en: 'Is the first trial lesson really free?',
    answer_uz:
      'Ha. Ro‘yxatdan o‘tganingizdan so‘ng darajangizni aniqlaymiz va mos guruhda bir marta bepul sinov darsida qatnashishingiz mumkin.',
    answer_ru:
      'Да. После регистрации мы определим ваш уровень, и вы сможете один раз бесплатно посетить пробное занятие в подходящей группе.',
    answer_en:
      'Yes. After registration we assess your level, and you can attend one free trial lesson in a suitable group.',
    order: 1,
  },
  {
    question_uz: 'Guruhlar qanday hajmda?',
    question_ru: 'Какого размера группы?',
    question_en: 'How large are the groups?',
    answer_uz:
      'Guruhlarda odatda 8–12 o‘quvchi bo‘ladi. Bu har bir o‘quvchiga e’tibor qaratishga va faol mashg‘ulot o‘tkazishga imkon beradi.',
    answer_ru:
      'В группах обычно 8–12 учеников. Это позволяет уделить внимание каждому и проводить активные занятия.',
    answer_en:
      'Groups usually have 8–12 students, allowing us to pay attention to everyone and keep lessons active.',
    order: 2,
  },
  {
    question_uz: 'To‘lovni qanday amalga oshirish mumkin?',
    question_ru: 'Как можно оплатить обучение?',
    question_en: 'How can I pay for the course?',
    answer_uz:
      'To‘lov naqd, bank kartasi yoki bank o‘tkazmasi orqali amalga oshiriladi. Oylik to‘lov va to‘liq kurs uchun chegirma variantlari mavjud.',
    answer_ru:
      'Оплата возможна наличными, банковской картой или переводом. Доступны ежемесячная оплата и скидки за полный курс.',
    answer_en:
      'Payment is available in cash, by bank card or bank transfer. Monthly payments and full-course discounts are available.',
    order: 3,
  },
  {
    question_uz: 'Darslarni qoldirsam nima bo‘ladi?',
    question_ru: 'Что будет, если я пропущу занятие?',
    question_en: 'What happens if I miss a lesson?',
    answer_uz:
      'Sababli sabab bilan qoldirilgan dars materiallarini ustoz bilan kelishilgan qo‘shimcha konsultatsiyada o‘zlashtirish mumkin.',
    answer_ru:
      'Материал пропущенного по уважительной причине занятия можно отработать на дополнительной консультации по договорённости с преподавателем.',
    answer_en:
      'If you miss a lesson for a valid reason, you can catch up during an extra consultation arranged with the teacher.',
    order: 4,
  },
  {
    question_uz: 'Kurs oxirida sertifikat beriladimi?',
    question_ru: 'Выдаётся ли сертификат по окончании курса?',
    question_en: 'Is a certificate issued at the end of the course?',
    answer_uz:
      'Yakuniy test va davomat talablarini bajargan o‘quvchilarga markazning rasmiy sertifikati beriladi.',
    answer_ru:
      'Ученики, успешно сдавшие итоговый тест и выполнившие требования по посещаемости, получают официальный сертификат центра.',
    answer_en:
      'Students who pass the final assessment and attendance requirements receive the center’s official certificate.',
    order: 5,
  },
  {
    question_uz: 'Onlayn o‘qish imkoniyati bormi?',
    question_ru: 'Есть ли возможность учиться онлайн?',
    question_en: 'Is online learning available?',
    answer_uz:
      'Ba’zi kurslar uchun onlayn format mavjud. Aniq guruh bo‘yicha ma’lumotni telefon yoki Telegram orqali so‘rashingiz mumkin.',
    answer_ru:
      'Для некоторых курсов доступен онлайн-формат. Уточните информацию по конкретной группе по телефону или в Telegram.',
    answer_en:
      'Some courses are available online. Ask about a specific group by phone or on Telegram.',
    order: 6,
  },
  {
    question_uz: 'Bolalarni qaysi yoshdan qabul qilasiz?',
    question_ru: 'С какого возраста принимаете детей?',
    question_en: 'From what age do you accept children?',
    answer_uz:
      'Bolalar uchun ingliz tili guruhlariga 7 yoshdan qabul qilamiz. Boshqa yo‘nalishlarda yosh talabi kursga qarab farq qiladi.',
    answer_ru:
      'В группы английского для детей принимаем с 7 лет. Для других направлений возрастные требования зависят от курса.',
    answer_en:
      'We accept children into English groups from age 7. Age requirements for other courses vary.',
    order: 7,
  },
  {
    question_uz: 'Dars jadvalini qanday tanlayman?',
    question_ru: 'Как выбрать расписание?',
    question_en: 'How do I choose a schedule?',
    answer_uz:
      'Ariza formasi orqali qulay vaqtni ko‘rsating. Administrator mavjud guruhlar asosida sizga mos jadvalni taklif qiladi.',
    answer_ru:
      'Укажите удобное время в форме заявки. Администратор предложит подходящее расписание на основе доступных групп.',
    answer_en:
      'Indicate your preferred time in the application form. An administrator will suggest a schedule based on available groups.',
    order: 8,
  },
];

const applications = [
  {
    firstName: 'Sevinch',
    lastName: 'Qodirova',
    phone: '+998901234567',
    courseIndex: 1,
    groupIndex: 2,
    ageOrLevel: '17 yosh, 11-sinf',
    comment: 'IELTS 7.0 natijasini maqsad qilganman.',
    preferredLanguage: 'uz',
    status: 'new',
    createdAt: '2026-10-27T09:20:00.000Z',
  },
  {
    firstName: 'Алексей',
    lastName: 'Смирнов',
    phone: '+998911234567',
    courseIndex: 2,
    groupIndex: 4,
    ageOrLevel: '23 года, экономист',
    comment: 'Хочу сменить профессию.',
    preferredLanguage: 'ru',
    status: 'contacted',
    createdAt: '2026-10-26T14:10:00.000Z',
  },
  {
    firstName: 'Muhammadali',
    lastName: 'Ergashev',
    phone: '+998933456789',
    courseIndex: 0,
    groupIndex: 0,
    ageOrLevel: '15 yosh',
    comment: '',
    preferredLanguage: 'uz',
    status: 'accepted',
    createdAt: '2026-10-24T07:55:00.000Z',
  },
  {
    firstName: 'Emily',
    lastName: 'Carter',
    phone: '+998977654321',
    courseIndex: 5,
    groupIndex: 7,
    ageOrLevel: 'Expat, A1',
    comment: 'I need Russian for daily life.',
    preferredLanguage: 'en',
    status: 'accepted',
    createdAt: '2026-10-22T16:40:00.000Z',
  },
  {
    firstName: 'Nilufar',
    lastName: 'Ismoilova',
    phone: '+998946543210',
    courseIndex: 7,
    groupIndex: 9,
    ageOrLevel: 'Design portfolio',
    comment: '',
    preferredLanguage: 'uz',
    status: 'rejected',
    createdAt: '2026-10-20T11:15:00.000Z',
  },
];

const messages = [
  {
    name: 'Aziza Rahmonova',
    phone: '+998901112233',
    email: 'aziza@example.com',
    text: 'Bolam uchun ingliz tili guruhlari haqida ma’lumot olmoqchi edim. Qaysi kunlarga yozilsa bo‘ladi?',
    language: 'uz',
    isRead: false,
    createdAt: '2026-10-27T12:05:00.000Z',
  },
  {
    name: 'Дмитрий Орлов',
    phone: '+998935556677',
    email: null,
    text: 'Здравствуйте! Есть ли вечерние группы по Python для работающих?',
    language: 'ru',
    isRead: true,
    createdAt: '2026-10-25T18:30:00.000Z',
  },
];

async function main() {
  console.log('Seeding demo data...');

  await prisma.application.deleteMany();
  await prisma.group.deleteMany();
  await prisma.course.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.faqItem.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.admin.deleteMany();

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.admin.create({
    data: {
      email: adminEmail,
      passwordHash,
      role: 'admin',
    },
  });

  const createdTeachers = [];
  for (const teacher of teachers) {
    createdTeachers.push(await prisma.teacher.create({ data: toPrismaKeys(teacher) }));
  }

  const createdCourses = [];
  for (const course of courses) {
    const { teacherIndexes, ...courseData } = course;
    createdCourses.push(
      await prisma.course.create({
        data: {
          ...toPrismaKeys(courseData),
          startDate: new Date(courseData.startDate),
          teachers: {
            connect: teacherIndexes.map((index) => ({ id: createdTeachers[index].id })),
          },
        },
      }),
    );
  }

  const createdGroups = [];
  for (const group of groups) {
    createdGroups.push(
      await prisma.group.create({
        data: {
          courseId: createdCourses[group.courseIndex].id,
          teacherId: createdTeachers[group.teacherIndex].id,
          days: JSON.stringify(group.days),
          time: group.time,
          capacity: group.capacity,
          enrolledCount: group.enrolledCount,
          levelUz: group.level.uz,
          levelRu: group.level.ru,
          levelEn: group.level.en,
          startDate: new Date(group.startDate),
          status: group.status,
        },
      }),
    );
  }

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({ data: toPrismaKeys(testimonial) });
  }

  for (const item of faqItems) {
    await prisma.faqItem.create({ data: toPrismaKeys(item) });
  }

  for (const application of applications) {
    const { courseIndex, groupIndex, createdAt, ...applicationData } = application;
    await prisma.application.create({
      data: {
        ...applicationData,
        courseId: createdCourses[courseIndex].id,
        groupId: createdGroups[groupIndex].id,
        createdAt: new Date(createdAt),
      },
    });
  }

  for (const message of messages) {
    await prisma.contactMessage.create({
      data: {
        ...message,
        createdAt: new Date(message.createdAt),
      },
    });
  }

  console.log(
    `Seed complete: ${createdCourses.length} courses, ${createdTeachers.length} teachers, ${createdGroups.length} groups.`,
  );
  console.log(`Admin account: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
