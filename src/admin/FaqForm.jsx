import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { Modal } from '../components/Modal';
import { LanguageTabs } from './components/LanguageTabs';
import { AdminField } from './components/AdminField';
import { AdminFormActions } from './components/AdminFormActions';
import { adminApi, toPlainError } from '../services/api';
import { useToast } from '../hooks/useToast';
import { LANGUAGES } from '../../shared/languages';

function emptyValues() {
  return {
    order: 0,
    ...Object.fromEntries(
      LANGUAGES.flatMap(({ code }) => [
        [`question_${code}`, ''],
        [`answer_${code}`, ''],
      ]),
    ),
  };
}

function toValues(item) {
  const values = emptyValues();
  if (!item) return values;
  Object.keys(values).forEach((key) => {
    if (item[key] !== undefined && item[key] !== null) values[key] = item[key];
  });
  return values;
}

export function FaqForm({ item, onClose, onSaved }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [values, setValues] = useState(() => toValues(item));
  const [activeLanguage, setActiveLanguage] = useState('uz');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(item);

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const next = {};
    if (!values.question_uz.trim()) next.question_uz = t('form.required');
    if (!values.answer_uz.trim()) next.answer_uz = t('form.required');
    if (values.order === '' || Number(values.order) < 0) next.order = t('admin.validation.order');
    if (Object.keys(next).length) {
      setErrors(next);
      setActiveLanguage('uz');
      setFormError(t('admin.common.requiredFields'));
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const payload = { ...values, order: Number(values.order) };
      const saved = isEdit
        ? await adminApi.updateFaq(item.id, payload)
        : await adminApi.createFaq(payload);
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
    <Modal open onClose={onClose} title={isEdit ? t('admin.faq.editTitle') : t('admin.faq.createTitle')} size="large">
      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <AdminField label={t('admin.fields.order')} htmlFor="faq-order" error={errors.order} required>
            <input id="faq-order" type="number" min="0" value={values.order} onChange={(event) => update('order', event.target.value)} aria-invalid={Boolean(errors.order)} />
          </AdminField>
        </div>

        <div className="admin-form-section">
          <h3>{t('admin.common.languageTabs')}</h3>
          <LanguageTabs active={activeLanguage} onChange={setActiveLanguage} />
        </div>
        <div className="form-grid">
          <AdminField label={t('admin.fields.question')} htmlFor={`faq-question-${activeLanguage}`} error={errors[`question_${activeLanguage}`]} required wide>
            <input
              id={`faq-question-${activeLanguage}`}
              value={values[`question_${activeLanguage}`]}
              onChange={(event) => update(`question_${activeLanguage}`, event.target.value)}
              maxLength={500}
              aria-invalid={Boolean(errors[`question_${activeLanguage}`])}
            />
          </AdminField>
          <AdminField label={t('admin.fields.answer')} htmlFor={`faq-answer-${activeLanguage}`} error={errors[`answer_${activeLanguage}`]} required wide>
            <textarea
              id={`faq-answer-${activeLanguage}`}
              value={values[`answer_${activeLanguage}`]}
              onChange={(event) => update(`answer_${activeLanguage}`, event.target.value)}
              rows={6}
              maxLength={5000}
              aria-invalid={Boolean(errors[`answer_${activeLanguage}`])}
            />
          </AdminField>
        </div>

        {formError ? <p className="form-error" role="alert"><AlertCircle size={16} aria-hidden="true" /> {formError}</p> : null}
        <AdminFormActions onCancel={onClose} loading={saving} />
      </form>
    </Modal>
  );
}
