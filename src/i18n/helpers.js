export function translateError(t, code) {
  if (!code) return t('errors.UNKNOWN');
  return t(`errors.${code}`, { defaultValue: t('errors.UNKNOWN') });
}

export function translateFieldErrors(t, fields = {}) {
  const translated = {};
  Object.entries(fields).forEach(([field, code]) => {
    translated[field] = translateError(t, code);
  });
  return translated;
}
