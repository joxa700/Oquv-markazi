import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Send,
  Youtube,
} from 'lucide-react';
import { Seo } from '../components/Seo';
import { getSiteText, siteConfig } from '../config/site';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { publicApi, toPlainError } from '../services/api';
import { formatUzPhoneInput } from '../../shared/phone';
import { hasErrors, validateContact } from '../utils/validation';

const initialValues = { name: '', phone: '+998', email: '', message: '' };

export function ContactPage() {
  const { t } = useTranslation();
  const lang = useLanguage();
  const toast = useToast();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [serverError, setServerError] = useState(null);

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${siteConfig.map.longitude - 0.008}%2C${siteConfig.map.latitude - 0.004}%2C${siteConfig.map.longitude + 0.008}%2C${siteConfig.map.latitude + 0.004}&layer=mapnik&marker=${siteConfig.map.latitude}%2C${siteConfig.map.longitude}`;

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: name === 'phone' ? formatUzPhoneInput(value) : value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateContact(values, t);
    if (hasErrors(nextErrors)) {
      setErrors(nextErrors);
      requestAnimationFrame(() => document.querySelector('.contact-form [aria-invalid="true"]')?.focus());
      return;
    }

    setStatus('loading');
    setServerError(null);
    try {
      await publicApi.createMessage({
        name: values.name.trim(),
        phone: values.phone === '+998' ? '' : values.phone,
        email: values.email.trim(),
        text: values.message.trim(),
        language: lang,
      });
      setStatus('succeeded');
      setValues(initialValues);
      toast.success(t('contact.successTitle'));
    } catch (error) {
      const plain = toPlainError(error);
      setStatus('failed');
      setServerError(plain.code);
      if (plain.fields) {
        setErrors(
          Object.fromEntries(
            Object.entries(plain.fields).map(([field, code]) => [
              field,
              t(`errors.${code}`, { defaultValue: t('errors.INVALID') }),
            ]),
          ),
        );
      }
    }
  }

  return (
    <>
      <Seo titleKey="meta.contact.title" descriptionKey="meta.contact.description" />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t('nav.contact')}</span>
          <h1>{t('contact.title')}</h1>
          <p>{t('contact.subtitle')}</p>
        </div>
      </section>

      <section className="section page-section">
        <div className="container contact-layout">
          <div className="contact-info">
            <h2>{t('contact.addressLabel')}</h2>
            <div className="contact-info__cards">
              <a href={`https://www.openstreetmap.org/?mlat=${siteConfig.map.latitude}&mlon=${siteConfig.map.longitude}#map=${siteConfig.map.zoom}/${siteConfig.map.latitude}/${siteConfig.map.longitude}`} target="_blank" rel="noreferrer noopener" className="contact-info__card">
                <MapPin size={22} aria-hidden="true" />
                <span>
                  <strong>{t('contact.address')}</strong>
                  {getSiteText('address', lang)}
                </span>
              </a>
              <a href={siteConfig.phoneHref} className="contact-info__card">
                <Phone size={22} aria-hidden="true" />
                <span>
                  <strong>{t('common.phone')}</strong>
                  {siteConfig.phone}
                </span>
              </a>
              <a href={`mailto:${siteConfig.email}`} className="contact-info__card">
                <Mail size={22} aria-hidden="true" />
                <span>
                  <strong>{t('common.email')}</strong>
                  {siteConfig.email}
                </span>
              </a>
              <div className="contact-info__card">
                <Clock size={22} aria-hidden="true" />
                <span>
                  <strong>{t('contact.workingHours')}</strong>
                  {getSiteText('workingHours', lang)}
                </span>
              </div>
            </div>

            <div className="contact-socials">
              <h3>{t('contact.socials')}</h3>
              <div className="social-links">
                <a href={siteConfig.telegram} target="_blank" rel="noreferrer noopener" aria-label="Telegram"><Send size={19} aria-hidden="true" /></a>
                <a href={siteConfig.instagram} target="_blank" rel="noreferrer noopener" aria-label="Instagram"><Instagram size={19} aria-hidden="true" /></a>
                <a href={siteConfig.facebook} target="_blank" rel="noreferrer noopener" aria-label="Facebook"><Facebook size={19} aria-hidden="true" /></a>
                <a href={siteConfig.youtube} target="_blank" rel="noreferrer noopener" aria-label="YouTube"><Youtube size={19} aria-hidden="true" /></a>
              </div>
            </div>

            <div className="map-frame">
              <iframe
                title={t('contact.mapTitle')}
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="contact-form-card">
            {status === 'succeeded' ? (
              <div className="form-success">
                <span className="form-success__icon"><CheckCircle2 size={34} aria-hidden="true" /></span>
                <h2>{t('contact.successTitle')}</h2>
                <p>{t('contact.successText')}</p>
                <button type="button" className="button button--primary" onClick={() => setStatus('idle')}>
                  {t('contact.sendAnother')}
                </button>
              </div>
            ) : (
              <>
                <div className="form-heading">
                  <h2>{t('contact.formTitle')}</h2>
                  <p>{t('contact.formSubtitle')}</p>
                </div>
                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                  <div className="field">
                    <label htmlFor="contact-name">{t('contact.name')}</label>
                    <input
                      id="contact-name"
                      name="name"
                      value={values.name}
                      onChange={updateField}
                      placeholder={t('contact.namePlaceholder')}
                      autoComplete="name"
                      maxLength={80}
                      required
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    />
                    {errors.name ? <p id="contact-name-error" className="field__error">{errors.name}</p> : null}
                  </div>

                  <div className="field">
                    <label htmlFor="contact-phone">{t('contact.phone')}</label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      value={values.phone}
                      onChange={updateField}
                      placeholder={t('contact.phonePlaceholder')}
                      autoComplete="tel"
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
                    />
                    {errors.phone ? <p id="contact-phone-error" className="field__error">{errors.phone}</p> : null}
                  </div>

                  <div className="field">
                    <label htmlFor="contact-email">{t('contact.email')} <span className="field__optional">({t('common.optional')})</span></label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={updateField}
                      placeholder={t('contact.emailPlaceholder')}
                      autoComplete="email"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    />
                    {errors.email ? <p id="contact-email-error" className="field__error">{errors.email}</p> : null}
                  </div>

                  <div className="field">
                    <label htmlFor="contact-message">{t('contact.message')}</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      value={values.message}
                      onChange={updateField}
                      placeholder={t('contact.messagePlaceholder')}
                      rows={6}
                      maxLength={2000}
                      required
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? 'contact-message-error' : undefined}
                    />
                    {errors.message ? <p id="contact-message-error" className="field__error">{errors.message}</p> : null}
                  </div>

                  {status === 'failed' ? (
                    <p className="form-error" role="alert">
                      {t(`errors.${serverError}`, { defaultValue: t('contact.error') })}
                    </p>
                  ) : null}

                  <p className="form-privacy">{t('contact.privacyNote')}</p>
                  <button type="submit" className="button button--primary button--block" disabled={status === 'loading'}>
                    {status === 'loading' ? t('contact.submitting') : t('contact.submit')}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
