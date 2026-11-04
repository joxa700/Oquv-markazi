import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { Modal } from '../components/Modal';
import { LanguageTabs } from './components/LanguageTabs';
import { AdminField } from './components/AdminField';
import { AdminFormActions } from './components/AdminFormActions';
import { adminApi, toPlainError } from '../services/api';
import { useToast } from '../hooks/useToast';
import { toDateInputValue } from '../utils/format';
import { LANGUAGES } from '../../shared/languages';

const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const statuses = ['open', 'full', 'soon'];

function emptyValues() {
  return {
    courseId: '',
    teacherId: '',
    days: [],
    time: '',
    capacity: 12,
    enrolledCount: 0,
    startDate: '',
    status: 'open',
    ...Object.fromEntries(LANGUAGES.map(({ code }) => [`level_${code}`, ''])),
  };
}

function toValues(group) {
  const values = emptyValues();
  if (!group) return values;
  Object.keys(values).forEach((key) => {
    if (group[key] !== undefined && group[key] !== null) values[key] = group[key];
  });
  values.courseId = group.courseId || group.course?.id || '';
  values.teacherId = group.teacherId || group.teacher?.id || '';
  values.days = group.days || [];
  values.startDate = toDateInputValue(group.startDate);
  return values;
}

export function GroupForm({ group, courses, teachers, onClose, onSaved }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [values, setValues] = useState(() => toValues(group));
  const [activeLanguage, setActiveLanguage] = useState('uz');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(group);

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function toggleDay(day) {
    setValues((current) => ({
      ...current,
      days: current.days.includes(day)
        ? current.days.filter((item) => item !== day)
        : [...current.days, day],
    }));
    setErrors((current) => ({ ...current, days: undefined }));
  }

  function validate() {
    const next = {};
    if (!values.courseId) next.courseId = t('form.required');
    if (!values.days.length) next.days = t('admin.validation.days');
    if (!values.time.trim()) next.time = t('form.required');
    if (!values.capacity || Number(values.capacity) < 1) next.capacity = t('admin.validation.number');
    if (Number(values.enrolledCount) > Number(values.capacity)) next.enrolledCount = t('admin.validation.capacity');
    if (!values.level_uz.trim()) next.level_uz = t('form.required');
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
        courseId: Number(values.courseId),
        teacherId: values.teacherId ? Number(values.teacherId) : null,
        capacity: Number(values.capacity),
        enrolledCount: Number(values.enrolledCount),
        time: values.time.trim(),
      };
      const saved = isEdit
        ? await adminApi.updateGroup(group.id, payload)
        : await adminApi.createGroup(payload);
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
    <Modal open onClose={onClose} title={isEdit ? t('admin.groups.editTitle') : t('admin.groups.createTitle')} size="large">
      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <AdminField label={t('admin.fields.course')} htmlFor="group-course" error={errors.courseId} required>
            <select id="group-course" value={values.courseId} onChange={(event) => update('courseId', event.target.value)} aria-invalid={Boolean(errors.courseId)}>
              <option value="">{t('enrollment.selectCourse')}</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course[`name_${activeLanguage}`] || course.name_uz}</option>
              ))}
            </select>
          </AdminField>

          <AdminField label={t('admin.fields.teacher')} htmlFor="group-teacher">
            <select id="group-teacher" value={values.teacherId} onChange={(event) => update('teacherId', event.target.value)}>
              <option value="">{t('common.none')}</option>
              {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
            </select>
          </AdminField>

          <AdminField label={t('admin.fields.time')} htmlFor="group-time" error={errors.time} required>
            <input id="group-time" value={values.time} onChange={(event) => update('time', event.target.value)} placeholder="18:00–19:30" maxLength={40} aria-invalid={Boolean(errors.time)} />
          </AdminField>

          <AdminField label={t('admin.fields.capacity')} htmlFor="group-capacity" error={errors.capacity} hint={t('admin.groups.capacityHint')} required>
            <input id="group-capacity" type="number" min="1" max="500" value={values.capacity} onChange={(event) => update('capacity', event.target.value)} aria-invalid={Boolean(errors.capacity)} />
          </AdminField>

          <AdminField label={t('admin.fields.enrolledCount')} htmlFor="group-enrolled" error={errors.enrolledCount} required>
            <input id="group-enrolled" type="number" min="0" max="500" value={values.enrolledCount} onChange={(event) => update('enrolledCount', event.target.value)} aria-invalid={Boolean(errors.enrolledCount)} />
          </AdminField>

          <AdminField label={t('admin.fields.startDate')} htmlFor="group-start" error={errors.startDate} required>
            <input id="group-start" type="date" value={values.startDate} onChange={(event) => update('startDate', event.target.value)} aria-invalid={Boolean(errors.startDate)} />
          </AdminField>

          <AdminField label={t('admin.fields.status')} htmlFor="group-status" required>
            <select id="group-status" value={values.status} onChange={(event) => update('status', event.target.value)}>
              {statuses.map((status) => <option key={status} value={status}>{t(`admin.statuses.${status}`)}</option>)}
            </select>
          </AdminField>
        </div>

        <fieldset className="check-grid">
          <legend>{t('admin.fields.days')}</legend>
          {weekdays.map((day) => (
            <label key={day} className="check-card">
              <input type="checkbox" checked={values.days.includes(day)} onChange={() => toggleDay(day)} />
              <span>{t(`weekdays.${day}`)}</span>
            </label>
          ))}
          {errors.days ? <p className="field__error">{errors.days}</p> : null}
        </fieldset>

        <div className="admin-form-section">
          <h3>{t('admin.common.languageTabs')}</h3>
          <LanguageTabs active={activeLanguage} onChange={setActiveLanguage} />
        </div>
        <div className="form-grid">
          <AdminField label={t('admin.fields.level')} htmlFor={`group-level-${activeLanguage}`} error={errors[`level_${activeLanguage}`]} required wide>
            <input
              id={`group-level-${activeLanguage}`}
              value={values[`level_${activeLanguage}`]}
              onChange={(event) => update(`level_${activeLanguage}`, event.target.value)}
              maxLength={120}
              aria-invalid={Boolean(errors[`level_${activeLanguage}`])}
            />
          </AdminField>
        </div>

        {formError ? <p className="form-error" role="alert"><AlertCircle size={16} aria-hidden="true" /> {formError}</p> : null}
        <AdminFormActions onCancel={onClose} loading={saving} />
      </form>
    </Modal>
  );
}
