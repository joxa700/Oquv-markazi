import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass } from 'lucide-react';
import { AdminPageHeader } from './components/AdminPageHeader';

export function AdminNotFound() {
  const { t } = useTranslation();
  const { lang } = useParams();
  return (
    <>
      <AdminPageHeader title={t('notFound.title')} subtitle={t('notFound.text')} />
      <section className="admin-card admin-not-found">
        <Compass size={48} aria-hidden="true" />
        <h2>{t('notFound.title')}</h2>
        <p>{t('notFound.text')}</p>
        <div className="not-found-actions">
          <Link to={`/${lang}/admin`} className="button button--primary">{t('admin.dashboard')}</Link>
          <Link to={`/${lang}`} className="button button--outline">{t('admin.backToSite')}</Link>
        </div>
      </section>
    </>
  );
}
