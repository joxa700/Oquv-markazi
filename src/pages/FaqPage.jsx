import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { HelpCircle, MessageCircle } from 'lucide-react';
import { Seo } from '../components/Seo';
import { FaqAccordion } from '../components/FaqAccordion';
import { EmptyState, ErrorState, LoadingState } from '../components/State';
import { fetchFaq } from '../features/content/contentSlice';
import { useLanguage } from '../hooks/useLanguage';

export function FaqPage() {
  const { t } = useTranslation();
  const lang = useLanguage();
  const dispatch = useDispatch();
  const faq = useSelector((state) => state.content.faq);

  useEffect(() => {
    if (faq.lang !== lang || faq.status === 'idle') dispatch(fetchFaq(lang));
  }, [dispatch, faq.lang, faq.status, lang]);

  return (
    <>
      <Seo titleKey="meta.faq.title" descriptionKey="meta.faq.description" />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t('nav.faq')}</span>
          <h1>{t('faq.title')}</h1>
          <p>{t('faq.subtitle')}</p>
        </div>
      </section>

      <section className="section page-section">
        <div className="container faq-page-layout">
          <div className="faq-page-main">
            {faq.status === 'loading' && faq.items.length === 0 ? <LoadingState /> : null}
            {faq.status === 'failed' && faq.items.length === 0 ? (
              <ErrorState
                message={t(`errors.${faq.error}`, { defaultValue: t('errors.generic') })}
                onRetry={() => dispatch(fetchFaq(lang))}
              />
            ) : null}
            {faq.items.length ? <FaqAccordion items={faq.items} /> : null}
            {faq.status === 'succeeded' && faq.items.length === 0 ? (
              <EmptyState title={t('faq.emptyTitle')} text={t('faq.emptyText')} icon={HelpCircle} />
            ) : null}
          </div>

          <aside className="faq-help-card">
            <span className="faq-help-card__icon"><MessageCircle size={26} aria-hidden="true" /></span>
            <h2>{t('home.faqSubtitle')}</h2>
            <p>{t('contact.subtitle')}</p>
            <Link to={`/${lang}/contact`} className="button button--primary button--block">{t('nav.contact')}</Link>
          </aside>
        </div>
      </section>
    </>
  );
}
