import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE, LANGUAGE_CODES } from '../../shared/languages';

const localeModules = import.meta.glob('../locales/*.json', {
  eager: true,
  import: 'default',
});

const resources = {};
for (const code of LANGUAGE_CODES) {
  const locale = localeModules[`../locales/${code}.json`];
  if (locale) {
    resources[code] = { translation: locale };
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: LANGUAGE_CODES,
  defaultNS: 'translation',
  ns: ['translation'],
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
  saveMissing: false,
  parseMissingKeyHandler: (key, defaultValue) => {
    if (import.meta.env.DEV) {
      console.warn(`[i18n] Missing translation key: ${key}`);
    }
    return defaultValue && defaultValue !== key ? defaultValue : '';
  },
});

export default i18n;
