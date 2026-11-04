export function localizedField(entity, field, lang) {
  if (!entity) return '';
  return entity[`${field}_${lang}`] || entity[`${field}_uz`] || '';
}

export function localizedPath(lang, path = '') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `/${lang}${normalized === '/' ? '' : normalized}`;
}

export function replaceLanguageInPath(pathname, nextLanguage) {
  const parts = pathname.split('/');
  if (parts.length > 1) {
    parts[1] = nextLanguage;
    return parts.join('/') || `/${nextLanguage}`;
  }
  return `/${nextLanguage}`;
}
