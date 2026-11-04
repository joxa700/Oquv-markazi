export const siteConfig = {
  name: {
    uz: "Nur Ta'lim o'quv markazi",
    ru: "Учебный центр Nur Ta'lim",
    en: "Nur Ta'lim Learning Center",
  },
  shortName: {
    uz: "Nur Ta'lim",
    ru: "Nur Ta'lim",
    en: "Nur Ta'lim",
  },
  logoText: {
    uz: 'NUR TA’LIM',
    ru: 'NUR TA’LIM',
    en: 'NUR TA’LIM',
  },
  tagline: {
    uz: "Bilim bilan kelajakni quramiz",
    ru: "Строим будущее через знания",
    en: "Building the future through knowledge",
  },
  description: {
    uz: "Ingliz tili, IT, matematika va rus tili bo‘yicha zamonaviy o‘quv markazi.",
    ru: "Современный учебный центр английского языка, IT, математики и русского языка.",
    en: "A modern learning center for English, IT, mathematics and Russian.",
  },
  phone: '+998 71 200 40 40',
  phoneHref: 'tel:+998712004040',
  phoneSecondary: '+998 90 123 45 67',
  email: 'hello@nurtalim.example',
  address: {
    uz: "Toshkent shahri, Chilonzor tumani, Bunyodkor shoh ko‘chasi 18",
    ru: "г. Ташкент, Чиланзарский район, проспект Бунёдкор, 18",
    en: "18 Bunyodkor Avenue, Chilanzar District, Tashkent",
  },
  workingHours: {
    uz: "Dushanba–shanba: 09:00–20:00. Yakshanba: dam olish kuni.",
    ru: "Понедельник–суббота: 09:00–20:00. Воскресенье: выходной.",
    en: "Monday–Saturday: 9:00 AM–8:00 PM. Sunday: closed.",
  },
  telegram: 'https://t.me/nurtalim_center',
  instagram: 'https://instagram.com/nurtalim.center',
  facebook: 'https://facebook.com/nurtalim.center',
  youtube: 'https://youtube.com/@nurtalim.center',
  map: {
    latitude: 41.2856,
    longitude: 69.2036,
    zoom: 16,
  },
  siteUrl: import.meta.env?.VITE_SITE_URL || 'https://nurtalim.example',
  foundedYear: 2016,
};

export function getSiteText(field, language) {
  const value = siteConfig[field];
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  return value[language] || value.uz || Object.values(value)[0] || '';
}
