import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Mail, Phone, ShieldCheck } from 'lucide-react';
import { Seo } from '../components/Seo';
import { siteConfig } from '../config/site';
import { useLanguage } from '../hooks/useLanguage';

const sections = ['data', 'purpose', 'security', 'cookies', 'rights', 'consent'];

export function PrivacyPage() {
  const { t } = useTranslation();
  const lang = useLanguage();

  return (
    <>
      <Seo titleKey="meta.privacy.title" descriptionKey="meta.privacy.description" />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow"><ShieldCheck size={16} aria-hidden="true" /> {t('privacy.title')}</span>
          <h1>{t('privacy.title')}</h1>
          <p>{t('privacy.subtitle')}</p>
        </div>
      </section>

      <section className="section page-section">
        <div className="container legal-layout">
          <article className="legal-card">
            <p className="legal-updated">{t('privacy.updated')}</p>
            <p>{t('privacy.intro')}</p>
            {sections.map((section, index) => (
              <section key={section} id={section}>
                <h2>{index + 1}. {t(`privacy.${section}Title`)}</h2>
                <p>{t(`privacy.${section}Text`)}</p>
              </section>
            ))}
            <section id="contact">
              <h2>{sections.length + 1}. {t('privacy.contactTitle')}</h2>
              <p>{t('privacy.contactText')}</p>
              <div className="legal-contact">
                <a href={siteConfig.phoneHref}><Phone size={17} aria-hidden="true" />{siteConfig.phone}</a>
                <a href={`mailto:${siteConfig.email}`}><Mail size={17} aria-hidden="true" />{siteConfig.email}</a>
              </div>
            </section>
          </article>
          <aside className="legal-aside">
            <h2>{t('privacy.title')}</h2>
            <nav aria-label={t('privacy.title')}>
              {sections.map((section, index) => (
                <a key={section} href={`#${section}`}>{index + 1}. {t(`privacy.${section}Title`)}</a>
              ))}
              <a href="#contact">{sections.length + 1}. {t('privacy.contactTitle')}</a>
            </nav>
            <Link to={`/${lang}/contact`} className="button button--primary button--block">{t('nav.contact')}</Link>
          </aside>
        </div>
      </section>
    </>
  );
}
