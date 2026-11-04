import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { DEFAULT_LANGUAGE, isSupportedLanguage } from '../../shared/languages';
import { setLanguage } from '../features/settings/settingsSlice';

export function useLanguage() {
  const { lang } = useParams();
  return isSupportedLanguage(lang) ? lang : DEFAULT_LANGUAGE;
}

export function useSyncLanguage(lang) {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!isSupportedLanguage(lang)) return;
    dispatch(setLanguage(lang));
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    document.documentElement.lang = lang;
  }, [dispatch, i18n, lang]);
}
