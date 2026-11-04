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
import { toDateInputValue } from '../utils/format';
import { LANGUAGES } from '../../shared/languages';

const categories = ['english', 'it', 'math', 'russian'];

function createEmptyValues() {
  const translations = Object.fromEntries(
    LANGUAGES.flatMap(({ code }) => [
      [`name_${code}`, ''],
      [`description_${code}`, ''],
      [`curriculum_${code}`, ''],
      [`duration_${code}`, ''],
      [`targetAudience_${code}`, ''],
      [`requiredLevel_${code}`, ''],
      [`paymentTerms_${code}`, ''],
    ]),
  );
  return {
    slug: '',
    category: 'english',
    price: '',
    lessonsPerWeek: 3,
    startDate: '',
    image: '',
    teacherIds: [],
    ...translations,
  };
}

function courseToValues(course) {
  const values = createEmptyValues();
  if (!course) return values;
  Object.keys(values).forEach((key) => {
    if (course[key] !== undefined && course[key] !== null) values[key] = course[key];
  });
  values.startDate = toDateInputValue(course.startDate);
  values.teacherIds = course.teacherIds || [];
  return values;
}

export function CourseForm({ course, teachers, onClose, onSaved }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [values, setValues] = useState(() => courseToValues(course));
  const [activeLanguage, setActiveLanguage] = useState('uz');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(course);

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function toggleTeacher(id) {
    setValues((current) => ({
      ...current,
      teacherIds: current.teacherIds.includes(id)
        ? current.teacherIds.filter((teacherId) => teacherId !== id)
        : [...current.teacherIds, id],
    }));
  }

  function validate() {
    const next = {};
    if (!values.slug.trim()) next.slug = t('form.required');
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug.trim())) next.slug = t('admin.validation.slug');
    ['name_uz', 'description_uz', 'curriculum_uz', 'duration_uz', 'targetAudience_uz', 'requiredLevel_uz', 'paymentTerms_uz'].forEach((key) => {
      if (!String(values[key] || '').trim()) next[key] = t('form.required');
    });
    if (!values.price || Number(values.price) < 0) next.price = t('admin.validation.price');
    if (!values.lessonsPerWeek || Number(values.lessonsPerWeek) < 1) next.lessonsPerWeek = t('admin.validation.number');
    if (!values.startDate) next.startDate = t('form.required');
    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setActiveLanguage('uz');
      setFormError(t('admin.common.requiredFields'));
      return;
    }

    setSaving(true);
    setFormError(null);
    setErrors({});
    try {
      const payload = {
        ...values,
        slug: values.slug.trim(),
        price: Number(values.price),
        lessonsPerWeek: Number(values.lessonsPerWeek),
        image: values.image || null,
        teacherIds: values.teacherIds.map(Number),
      };
      const saved = isEdit
        ? await adminApi.updateCourse(course.id, payload)
        : await adminApi.createCourse(payload);
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

  const errorFor = (key) => errors[key];

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? t('admin.courses.editTitle') : t('admin.courses.createTitle')}
      size="large"
    >
      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <div className="admin-form-section">
          <h3>{t('admin.common.languageTabs')}</h3>
          <LanguageTabs active={activeLanguage} onChange={setActiveLanguage} />
        </div>

        <div className="form-grid">
          <AdminField label={t('admin.fields.name')} htmlFor={`course-name-${activeLanguage}`} error={errorFor(`name_${activeLanguage}`)} required>
            <input
              id={`course-name-${activeLanguage}`}
              value={values[`name_${activeLanguage}`]}
              onChange={(event) => update(`name_${activeLanguage}`, event.target.value)}
              maxLength={160}
              aria-invalid={Boolean(errorFor(`name_${activeLanguage}`))}
            />
          </AdminField>

          <AdminField label={t('admin.fields.duration')} htmlFor={`course-duration-${activeLanguage}`} error={errorFor(`duration_${activeLanguage}`)} required>
            <input
              id={`course-duration-${activeLanguage}`}
              value={values[`duration_${activeLanguage}`]}
              onChange={(event) => update(`duration_${activeLanguage}`, event.target.value)}
              maxLength={120}
              aria-invalid={Boolean(errorFor(`duration_${activeLanguage}`))}
            />
          </AdminField>

          <AdminField label={t('admin.fields.description')} htmlFor={`course-description-${activeLanguage}`} error={errorFor(`description_${activeLanguage}`)} required wide>
            <textarea
              id={`course-description-${activeLanguage}`}
              value={values[`description_${activeLanguage}`]}
              onChange={(event) => update(`description_${activeLanguage}`, event.target.value)}
              rows={4}
              maxLength={5000}
              aria-invalid={Boolean(errorFor(`description_${activeLanguage}`))}
            />
          </AdminField>

          <AdminField label={t('admin.fields.curriculum')} htmlFor={`course-curriculum-${activeLanguage}`} error={errorFor(`curriculum_${activeLanguage}`)} hint={t('course.curriculum')} required wide>
            <textarea
              id={`course-curriculum-${activeLanguage}`}
              value={values[`curriculum_${activeLanguage}`]}
              onChange={(event) => update(`curriculum_${activeLanguage}`, event.target.value)}
              rows={5}
              maxLength={10000}
              aria-invalid={Boolean(errorFor(`curriculum_${activeLanguage}`))}
            />
          </AdminField>

          <AdminField label={t('admin.fields.targetAudience')} htmlFor={`course-audience-${activeLanguage}`} error={errorFor(`targetAudience_${activeLanguage}`)} required>
            <textarea
              id={`course-audience-${activeLanguage}`}
              value={values[`targetAudience_${activeLanguage}`]}
              onChange={(event) => update(`targetAudience_${activeLanguage}`, event.target.value)}
              rows={2}
              maxLength={1000}
              aria-invalid={Boolean(errorFor(`targetAudience_${activeLanguage}`))}
            />
          </AdminField>

          <AdminField label={t('admin.fields.requiredLevel')} htmlFor={`course-level-${activeLanguage}`} error={errorFor(`requiredLevel_${activeLanguage}`)} required>
            <input
              id={`course-level-${activeLanguage}`}
              value={values[`requiredLevel_${activeLanguage}`]}
              onChange={(event) => update(`requiredLevel_${activeLanguage}`, event.target.value)}
              maxLength={200}
              aria-invalid={Boolean(errorFor(`requiredLevel_${activeLanguage}`))}
            />
          </AdminField>

          <AdminField label={t('admin.fields.paymentTerms')} htmlFor={`course-payment-${activeLanguage}`} error={errorFor(`paymentTerms_${activeLanguage}`)} required wide>
            <textarea
              id={`course-payment-${activeLanguage}`}
              value={values[`paymentTerms_${activeLanguage}`]}
              onChange={(event) => update(`paymentTerms_${activeLanguage}`, event.target.value)}
              rows={2}
              maxLength={2000}
              aria-invalid={Boolean(errorFor(`paymentTerms_${activeLanguage}`))}
            />
          </AdminField>
        </div>

        <div className="admin-form-section">
          <h3>{t('admin.fields.slug')}</h3>
        </div>
        <div className="form-grid">
          <AdminField label={t('admin.fields.slug')} htmlFor="course-slug" error={errorFor('slug')} hint={t('admin.courses.slugHint')} required>
            <input
              id="course-slug"
              value={values.slug}
              onChange={(event) => update('slug', event.target.value.toLowerCase())}
              maxLength={120}
              dir="ltr"
              aria-invalid={Boolean(errorFor('slug'))}
            />
          </AdminField>

          <AdminField label={t('admin.fields.category')} htmlFor="course-category" error={errorFor('category')} required>
            <select id="course-category" value={values.category} onChange={(event) => update('category', event.target.value)}>
              {categories.map((category) => <option key={category} value={category}>{t(`categories.${category}`)}</option>)}
            </select>
          </AdminField>

          <AdminField label={t('admin.fields.price')} htmlFor="course-price" error={errorFor('price')} required>
            <input id="course-price" type="number" min="0" step="1000" value={values.price} onChange={(event) => update('price', event.target.value)} aria-invalid={Boolean(errorFor('price'))} />
          </AdminField>

          <AdminField label={t('admin.fields.lessonsPerWeek')} htmlFor="course-lessons" error={errorFor('lessonsPerWeek')} required>
            <input id="course-lessons" type="number" min="1" max="14" value={values.lessonsPerWeek} onChange={(event) => update('lessonsPerWeek', event.target.value)} aria-invalid={Boolean(errorFor('lessonsPerWeek'))} />
          </AdminField>

          <AdminField label={t('admin.fields.startDate')} htmlFor="course-start" error={errorFor('startDate')} required>
            <input id="course-start" type="date" value={values.startDate} onChange={(event) => update('startDate', event.target.value)} aria-invalid={Boolean(errorFor('startDate'))} />
          </AdminField>
        </div>

        <MediaField value={values.image} onChange={(value) => update('image', value)} label={t('admin.fields.image')} />

        <fieldset className="check-grid">
          <legend>{t('admin.fields.teacherIds')}</legend>
          {teachers.map((teacher) => (
            <label key={teacher.id} className="check-card">
              <input
                type="checkbox"
                checked={values.teacherIds.includes(teacher.id)}
                onChange={() => toggleTeacher(teacher.id)}
              />
              <span>{teacher.name}</span>
            </label>
          ))}
          {!teachers.length ? <p className="field__hint">{t('admin.common.empty')}</p> : null}
        </fieldset>

        {formError ? (
          <p className="form-error" role="alert"><AlertCircle size={16} aria-hidden="true" /> {formError}</p>
        ) : null}

        <AdminFormActions onCancel={onClose} loading={saving} />
      </form>
    </Modal>
  );
}
