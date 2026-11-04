import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { LANGUAGES } from '../../shared/languages';
import { useLanguage } from '../hooks/useLanguage';
import { replaceLanguageInPath } from '../utils/localized';

export function LanguageSwitcher({ compact = false }) {
  const { t } = useTranslation();
  const lang = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  function handleChange(event) {
    const nextLanguage = event.target.value;
    const nextPath = replaceLanguageInPath(location.pathname, nextLanguage);
    navigate(`${nextPath}${location.search}${location.hash}`);
  }

  return (
    <label className={`language-switcher ${compact ? 'language-switcher--compact' : ''}`.trim()}>
      <Languages size={17} aria-hidden="true" />
      <span className="sr-only">{t('common.language')}</span>
      <select value={lang} onChange={handleChange} aria-label={t('common.language')}>
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {compact ? language.code.toUpperCase() : language.nativeName}
          </option>
        ))}
      </select>
    </label>
  );
}
