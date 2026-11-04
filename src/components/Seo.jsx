import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../shared/languages';
import { siteConfig } from '../config/site';

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
}

export function Seo({ titleKey, descriptionKey, title: customTitle, description: customDescription, noIndex = false }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const title = customTitle || t(titleKey || 'meta.home.title');
    const description = customDescription || t(descriptionKey || 'meta.home.description');
    const siteUrl = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '');
    const pageTitle = t('meta.titleTemplate', { title, siteName: siteConfig.siteName });
    const canonical = `${siteUrl}${location.pathname}`;

    document.title = pageTitle;
    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: pageTitle });
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    upsertMeta('meta[property="og:image"]', {
      property: 'og:image',
      content: `${siteUrl}/images/og-image.svg`,
    });
    upsertMeta('meta[property="og:locale"]', {
      property: 'og:locale',
      content: i18n.language === 'ru' ? 'ru_RU' : i18n.language === 'en' ? 'en_US' : 'uz_UZ',
    });
    upsertMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noIndex ? 'noindex, nofollow' : 'index, follow',
    });

    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;

    document.head.querySelectorAll('link[data-seo-alternate]').forEach((node) => node.remove());
    LANGUAGES.forEach(({ code }) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = code;
      link.dataset.seoAlternate = 'true';
      link.href = `${siteUrl}${location.pathname.replace(/^\/[a-z]{2}(?=\/|$)/, `/${code}`)}`;
      document.head.appendChild(link);
    });
  }, [customDescription, customTitle, descriptionKey, i18n.language, location.pathname, noIndex, t, titleKey]);

  return null;
}
