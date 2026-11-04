import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { TelegramFloat } from '../components/TelegramFloat';
import { EnrollmentProvider } from '../components/EnrollmentProvider';
import { useSyncLanguage } from '../hooks/useLanguage';
import { DEFAULT_LANGUAGE, isSupportedLanguage } from '../../shared/languages';

export function PublicLayout() {
  const { lang } = useParams();
  const { t } = useTranslation();
  useSyncLanguage(lang);

  if (!isSupportedLanguage(lang)) {
    return <Navigate to={`/${DEFAULT_LANGUAGE}`} replace />;
  }

  return (
    <EnrollmentProvider>
      <a className="skip-link" href="#main-content">{t('common.skipToContent')}</a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <TelegramFloat />
    </EnrollmentProvider>
  );
}
