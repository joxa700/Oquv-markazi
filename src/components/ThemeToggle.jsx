import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Moon, Sun } from 'lucide-react';
import { toggleTheme } from '../features/settings/settingsSlice';

export function ThemeToggle() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.settings.theme);
  const isDark = theme === 'dark';
  const label = `${t('common.theme')}: ${isDark ? t('common.dark') : t('common.light')}`;

  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      onClick={() => dispatch(toggleTheme())}
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
