import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass } from 'lucide-react';
import { Seo } from '../components/Seo';
import { useLanguage } from '../hooks/useLanguage';

export function NotFoundPage() {
  const { t } = useTranslation();
  const lang = useLanguage();
  return (
    <>
      <Seo titleKey="meta.notFound.title" descriptionKey="meta.notFound.description" noIndex />
      <section className="section not-found-page">
        <div className="container narrow-container">
          <div className="not-found-art" aria-hidden="true">
            <span>4</span><Compass size={76} /><span>4</span>
          </div>
          <h1>{t('notFound.title')}</h1>
          <p>{t('notFound.text')}</p>
          <div className="not-found-actions">
            <Link to={`/${lang}`} className="button button--primary">{t('notFound.backHome')}</Link>
            <Link to={`/${lang}/courses`} className="button button--outline">{t('notFound.browseCourses')}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
