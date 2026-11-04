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
    name: '',
    photo: '',
    experienceYears: 1,
    courseIds: [],
    ...Object.fromEntries(
      LANGUAGES.flatMap(({ code }) => [
        [`specialization_${code}`, ''],
        [`bio_${code}`, ''],
      ]),
    ),
  };
}

function toValues(teacher) {
  const values = emptyValues();
  if (!teacher) return values;
  Object.keys(values).forEach((key) => {
    if (teacher[key] !== undefined && teacher[key] !== null) values[key] = teacher[key];
  });
  values.courseIds = teacher.courseIds || [];
  return values;
}

export function TeacherForm({ teacher, courses, onClose, onSaved }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [values, setValues] = useState(() => toValues(teacher));
  const [activeLanguage, setActiveLanguage] = useState('uz');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(teacher);

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function toggleCourse(id) {
    setValues((current) => ({
      ...current,
      courseIds: current.courseIds.includes(id)
        ? current.courseIds.filter((courseId) => courseId !== id)
        : [...current.courseIds, id],
    }));
  }

  function validate() {
    const next = {};
    if (!values.name.trim()) next.name = t('form.required');
    ['specialization_uz', 'bio_uz'].forEach((key) => {
      if (!String(values[key] || '').trim()) next[key] = t('form.required');
    });
    if (values.experienceYears === '' || Number(values.experienceYears) < 0) next.experienceYears = t('admin.validation.number');
    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setFormError(t('admin.common.requiredFields'));
      return;
    }

    setSaving(true);
    setFormError(null);
    setErrors({});
    try {
      const payload = {
        ...values,
        name: values.name.trim(),
        photo: values.photo || null,
        experienceYears: Number(values.experienceYears),
        courseIds: values.courseIds.map(Number),
      };
      const saved = isEdit
        ? await adminApi.updateTeacher(teacher.id, payload)
        : await adminApi.createTeacher(payload);
      onSaved(saved);
      toast.success(t(isEdit ? 'admin.toasts.updated' : 'admin.toasts.created'));
      onClose();
    } catch (error) {
      const plain = toPlainError(error);
      setErrors(
        Object.fromEntries(
          Object.entries(plain.fields || {}).map(([field, code]) => [
            field,
            t(`errors.${code}`, { defaultValue: t('admin.validation.invalid') }),
          ]),
        ),
      );
      setFormError(t(`errors.${plain.code}`, { defaultValue: t('admin.common.generalError') }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={isEdit ? t('admin.teachers.editTitle') : t('admin.teachers.createTitle')} size="large">
      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <AdminField label={t('admin.fields.name')} htmlFor="teacher-name" error={errors.name} required>
            <input id="teacher-name" value={values.name} onChange={(event) => update('name', event.target.value)} maxLength={120} aria-invalid={Boolean(errors.name)} />
          </AdminField>
          <AdminField label={t('admin.fields.experienceYears')} htmlFor="teacher-experience" error={errors.experienceYears} required>
            <input id="teacher-experience" type="number" min="0" max="60" value={values.experienceYears} onChange={(event) => update('experienceYears', event.target.value)} aria-invalid={Boolean(errors.experienceYears)} />
          </AdminField>
        </div>


        <div className="admin-form-section">
          <h3>{t('admin.common.languageTabs')}</h3>
          <LanguageTabs active={activeLanguage} onChange={setActiveLanguage} />
        </div>

        <div className="form-grid">
          <AdminField label={t('admin.fields.specialization')} htmlFor={`teacher-specialization-${activeLanguage}`} error={errors[`specialization_${activeLanguage}`]} required wide>
            <input
              id={`teacher-specialization-${activeLanguage}`}
              value={values[`specialization_${activeLanguage}`]}
              onChange={(event) => update(`specialization_${activeLanguage}`, event.target.value)}
              maxLength={160}
              aria-invalid={Boolean(errors[`specialization_${activeLanguage}`])}
            />
          </AdminField>
          <AdminField label={t('admin.fields.bio')} htmlFor={`teacher-bio-${activeLanguage}`} error={errors[`bio_${activeLanguage}`]} required wide>
            <textarea
              id={`teacher-bio-${activeLanguage}`}
              value={values[`bio_${activeLanguage}`]}
              onChange={(event) => update(`bio_${activeLanguage}`, event.target.value)}
              rows={5}
              maxLength={5000}
              aria-invalid={Boolean(errors[`bio_${activeLanguage}`])}
            />
          </AdminField>
        </div>

        <MediaField value={values.photo} onChange={(value) => update('photo', value)} label={t('admin.fields.photo')} />

        <fieldset className="check-grid">
          <legend>{t('admin.fields.course')}</legend>
          {courses.map((course) => (
            <label key={course.id} className="check-card">
              <input type="checkbox" checked={values.courseIds.includes(course.id)} onChange={() => toggleCourse(course.id)} />
              <span>{course[`name_${activeLanguage}`] || course.name_uz}</span>
            </label>
          ))}
          {!courses.length ? <p className="field__hint">{t('admin.common.empty')}</p> : null}
        </fieldset>

        {formError ? <p className="form-error" role="alert"><AlertCircle size={16} aria-hidden="true" /> {formError}</p> : null}
        <AdminFormActions onCancel={onClose} loading={saving} />
      </form>
    </Modal>
  );
}
