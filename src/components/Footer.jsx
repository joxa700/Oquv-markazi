import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Facebook, Instagram, Mail, MapPin, Phone, Send, Youtube } from 'lucide-react';
import { getSiteText, siteConfig } from '../config/site';
import { useLanguage } from '../hooks/useLanguage';

export function Footer() {
  const { t } = useTranslation();
  const lang = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src="/logo.svg" alt="" width="52" height="52" />
          <div>
            <strong>{getSiteText('logoText', lang)}</strong>
            <p>{t('footer.about')}</p>
          </div>
        </div>

        <div>
          <h2>{t('footer.quickLinks')}</h2>
          <ul className="footer-links">
            <li><Link to={`/${lang}/courses`}>{t('nav.courses')}</Link></li>
            <li><Link to={`/${lang}/teachers`}>{t('nav.teachers')}</Link></li>
            <li><Link to={`/${lang}/schedule`}>{t('nav.schedule')}</Link></li>
            <li><Link to={`/${lang}/faq`}>{t('nav.faq')}</Link></li>
            <li><Link to={`/${lang}/contact`}>{t('nav.contact')}</Link></li>
            <li><Link to={`/${lang}/privacy`}>{t('footer.privacy')}</Link></li>
          </ul>
        </div>

        <div>
          <h2>{t('footer.contact')}</h2>
          <ul className="footer-contact">
            <li>
              <MapPin size={17} aria-hidden="true" />
              <span>{getSiteText('address', lang)}</span>
            </li>
            <li>
              <Phone size={17} aria-hidden="true" />
              <a href={siteConfig.phoneHref}>{siteConfig.phone}</a>
            </li>
            <li>
              <Mail size={17} aria-hidden="true" />
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            </li>
            <li>
              <Clock size={17} aria-hidden="true" />
              <span>{getSiteText('workingHours', lang)}</span>
            </li>
          </ul>
        </div>

        <div>
          <h2>{t('footer.follow')}</h2>
          <div className="social-links">
            <a href={siteConfig.telegram} target="_blank" rel="noreferrer noopener" aria-label="Telegram">
              <Send size={19} aria-hidden="true" />
            </a>
            <a href={siteConfig.instagram} target="_blank" rel="noreferrer noopener" aria-label="Instagram">
              <Instagram size={19} aria-hidden="true" />
            </a>
            <a href={siteConfig.facebook} target="_blank" rel="noreferrer noopener" aria-label="Facebook">
              <Facebook size={19} aria-hidden="true" />
            </a>
            <a href={siteConfig.youtube} target="_blank" rel="noreferrer noopener" aria-label="YouTube">
              <Youtube size={19} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {year} {getSiteText('shortName', lang)}. {t('footer.rights')}</p>
        <Link to={`/${lang}/privacy`}>{t('footer.privacy')}</Link>
      </div>
    </footer>
  );
}
