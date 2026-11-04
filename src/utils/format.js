import { getIntlLocale, isSupportedLanguage, DEFAULT_LANGUAGE } from '../../shared/languages';

export function normalizeLanguage(language) {
  return isSupportedLanguage(language) ? language : DEFAULT_LANGUAGE;
}

export function formatNumber(value, language) {
  return new Intl.NumberFormat(getIntlLocale(normalizeLanguage(language))).format(Number(value) || 0);
}

export function formatPrice(value, language, t) {
  const amount = formatNumber(value, language);
  return `${amount} ${t('common.currency')}`;
}

export function formatDate(value, language, options = {}) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(getIntlLocale(normalizeLanguage(language)), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }).format(date);
}

export function formatDateTime(value, language) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(getIntlLocale(normalizeLanguage(language)), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function toDateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function parseCurriculum(value) {
  if (!value) return [];
  return String(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
