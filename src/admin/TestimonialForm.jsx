import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { Modal } from '../components/Modal';
import { LanguageTabs } from './components/LanguageTabs';
import { AdminField } from './components/AdminField';
import { MediaField } from './components/MediaField';
import { AdminFormActions } from './components/AdminFormActions';
import { adminApi, toPlainError } from '../services/api';
import { useToast } from '../hooks/useToast';
import { LANGUAGES } from '../../shared/languages';

function emptyValues() {
  return {
    author: '',
    rating: 5,
    photo: '',
    ...Object.fromEntries(LANGUAGES.map(({ code }) => [`text_${code}`, ''])),
  };
}

function toValues(testimonial) {
  const values = emptyValues();
  if (!testimonial) return values;
  Object.keys(values).forEach((key) => {
    if (testimonial[key] !== undefined && testimonial[key] !== null) values[key] = testimonial[key];
  });
  return values;
}

export function TestimonialForm({ testimonial, onClose, onSaved }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [values, setValues] = useState(() => toValues(testimonial));
  const [activeLanguage, setActiveLanguage] = useState('uz');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(testimonial);

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const next = {};
    if (!values.author.trim()) next.author = t('form.required');
    if (!values.text_uz.trim()) next.text_uz = t('form.required');
    if (!values.rating || values.rating < 1 || values.rating > 5) next.rating = t('admin.validation.rating');
    if (Object.keys(next).length) {
      setErrors(next);
      setActiveLanguage('uz');
      setFormError(t('admin.common.requiredFields'));
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const payload = { ...values, author: values.author.trim(), rating: Number(values.rating), photo: values.photo || null };
      const saved = isEdit
        ? await adminApi.updateTestimonial(testimonial.id, payload)
        : await adminApi.createTestimonial(payload);
      onSaved(saved);
      toast.success(t(isEdit ? 'admin.toasts.updated' : 'admin.toasts.created'));
      onClose();
    } catch (error) {
      const plain = toPlainError(error);
      setErrors(Object.fromEntries(Object.entries(plain.fields || {}).map(([field, code]) => [field, t(`errors.${code}`, { defaultValue: t('admin.validation.invalid') })])));
      setFormError(t(`errors.${plain.code}`, { defaultValue: t('admin.common.generalError') }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={isEdit ? t('admin.testimonials.editTitle') : t('admin.testimonials.createTitle')} size="medium">
      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <AdminField label={t('admin.fields.author')} htmlFor="testimonial-author" error={errors.author} required>
            <input id="testimonial-author" value={values.author} onChange={(event) => update('author', event.target.value)} maxLength={120} aria-invalid={Boolean(errors.author)} />
          </AdminField>
          <AdminField label={t('admin.fields.rating')} htmlFor="testimonial-rating" error={errors.rating} required>
            <select id="testimonial-rating" value={values.rating} onChange={(event) => update('rating', event.target.value)}>
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>{`${rating} ★`}</option>
              ))}
            </select>
          </AdminField>
        </div>

        <div className="admin-form-section">
          <h3>{t('admin.common.languageTabs')}</h3>
          <LanguageTabs active={activeLanguage} onChange={setActiveLanguage} />
        </div>
        <div className="form-grid">
          <AdminField label={t('admin.fields.text')} htmlFor={`testimonial-text-${activeLanguage}`} error={errors[`text_${activeLanguage}`]} required wide>
            <textarea
              id={`testimonial-text-${activeLanguage}`}
              value={values[`text_${activeLanguage}`]}
              onChange={(event) => update(`text_${activeLanguage}`, event.target.value)}
              rows={5}
              maxLength={2000}
              aria-invalid={Boolean(errors[`text_${activeLanguage}`])}
            />
          </AdminField>
        </div>

        <MediaField value={values.photo} onChange={(value) => update('photo', value)} label={t('admin.fields.photo')} />
        {formError ? <p className="form-error" role="alert"><AlertCircle size={16} aria-hidden="true" /> {formError}</p> : null}
        <AdminFormActions onCancel={onClose} loading={saving} />
      </form>
    </Modal>
  );
}
