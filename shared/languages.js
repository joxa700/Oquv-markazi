export const LANGUAGES = [
  {
    code: 'uz',
    label: "O'zbekcha",
    shortLabel: 'UZ',
    intlLocale: 'uz-UZ',
  },
  {
    code: 'ru',
    label: 'Русский',
    shortLabel: 'RU',
    intlLocale: 'ru-RU',
  },
  {
    code: 'en',
    label: 'English',
    shortLabel: 'EN',
    intlLocale: 'en-US',
  },
];

export const LANGUAGE_CODES = LANGUAGES.map((language) => language.code);
export const DEFAULT_LANGUAGE = 'uz';

export function isSupportedLanguage(code) {
  return LANGUAGE_CODES.includes(code);
}

export function getLanguage(code) {
  return LANGUAGES.find((language) => language.code === code) || LANGUAGES[0];
}

export function getIntlLocale(code) {
  return getLanguage(code).intlLocale;
}
