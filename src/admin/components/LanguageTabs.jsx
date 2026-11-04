import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../../shared/languages';

export function LanguageTabs({ active, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="language-tabs" role="tablist" aria-label={t('admin.common.languageTabs')}>
      {LANGUAGES.map((language) => (
        <button
          key={language.code}
          type="button"
          role="tab"
          aria-selected={active === language.code}
          className={active === language.code ? 'is-active' : ''}
          onClick={() => onChange(language.code)}
        >
          <span>{language.nativeName}</span>
          <small>{language.code.toUpperCase()}</small>
        </button>
      ))}
    </div>
  );
}
