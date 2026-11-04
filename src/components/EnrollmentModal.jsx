import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Modal } from './Modal';
import { fetchCourses } from '../features/courses/coursesSlice';
import { resetApplicationState, submitApplication } from '../features/applications/applicationsSlice';
import { publicApi, toPlainError } from '../services/api';
import { formatUzPhoneInput } from '../../shared/phone';
import { validateEnrollment, hasErrors } from '../utils/validation';
import { useLanguage } from '../hooks/useLanguage';
import { formatDate } from '../utils/format';

const emptyValues = {
  firstName: '',
  lastName: '',
  phone: '',
  courseId: '',
  groupId: '',
  ageOrLevel: '',
  comment: '',
};

function EnrollmentForm({ request, onClose }) {
  const { t } = useTranslation();
  const lang = useLanguage();
  const dispatch = useDispatch();
  const courses = useSelector((state) => state.courses);
  const application = useSelector((state) => state.applications);
  const [values, setValues] = useState(() => ({
    ...emptyValues,
    courseId: request.courseId ? String(request.courseId) : '',
    groupId: request.groupId ? String(request.groupId) : '',
  }));
  const [errors, setErrors] = useState({});
  const [groups, setGroups] = useState([]);
  const [groupsStatus, setGroupsStatus] = useState('idle');
  const [groupsError, setGroupsError] = useState(null);

  useEffect(() => {
    dispatch(resetApplicationState());
    return () => dispatch(resetApplicationState());
  }, [dispatch]);

  useEffect(() => {
    if (courses.status === 'idle' || courses.lang !== lang) {
      dispatch(fetchCourses(lang));
    }
  }, [courses.lang, courses.status, dispatch, lang]);

  useEffect(() => {
    if (!values.courseId) {
      setGroups([]);
      setGroupsStatus('idle');
      return undefined;
    }

    const controller = new AbortController();
    setGroupsStatus('loading');
    setGroupsError(null);
    publicApi
      .getGroups(lang, { courseId: values.courseId })
      .then((items) => {
        if (controller.signal.aborted) return;
        setGroups(items.filter((group) => group.status === 'open' && group.seatsLeft > 0));
        setGroupsStatus('succeeded');
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setGroupsError(toPlainError(error).code);
        setGroupsStatus('failed');
      });

    return () => controller.abort();
  }, [lang, values.courseId]);

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({
      ...current,
      [name]: name === 'phone' ? formatUzPhoneInput(value) : value,
      ...(name === 'courseId' ? { groupId: '' } : {}),
    }));
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === 'courseId' ? { groupId: undefined } : {}),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateEnrollment(values, t);
    if (hasErrors(nextErrors)) {
      setErrors(nextErrors);
      requestAnimationFrame(() => {
        document.querySelector('.enrollment-form [aria-invalid="true"]')?.focus();
      });
      return;
    }

    const result = await dispatch(
      submitApplication({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: values.phone,
        courseId: Number(values.courseId),
        groupId: values.groupId ? Number(values.groupId) : null,
        ageOrLevel: values.ageOrLevel.trim(),
        comment: values.comment.trim(),
        preferredLanguage: lang,
      }),
    );

    if (result.meta.requestStatus === 'rejected') {
      const fields = result.payload?.fields || {};
      setErrors(
        Object.fromEntries(
          Object.entries(fields).map(([field, code]) => [
            field,
            t(`errors.${code}`, { defaultValue: t('errors.INVALID') }),
          ]),
        ),
      );
    }
  }

  const selectedGroup = groups.find((group) => String(group.id) === values.groupId);

  if (application.status === 'succeeded') {
    return (
      <div className="form-success">
        <span className="form-success__icon">
          <CheckCircle2 size={34} aria-hidden="true" />
        </span>
        <h3>{t('enrollment.successTitle')}</h3>
        <p>{t('enrollment.successText')}</p>
        <button type="button" className="button button--primary" onClick={onClose}>
          {t('enrollment.close')}
        </button>
      </div>
    );
  }

  return (
    <form className="enrollment-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="enrollment-first-name">{t('enrollment.firstName')}</label>
          <input
            id="enrollment-first-name"
            name="firstName"
            value={values.firstName}
            onChange={updateField}
            placeholder={t('enrollment.firstNamePlaceholder')}
            autoComplete="given-name"
            maxLength={60}
            required
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? 'enrollment-first-name-error' : undefined}
          />
          {errors.firstName ? <p id="enrollment-first-name-error" className="field__error">{errors.firstName}</p> : null}
        </div>

        <div className="field">
          <label htmlFor="enrollment-last-name">{t('enrollment.lastName')}</label>
          <input
            id="enrollment-last-name"
            name="lastName"
            value={values.lastName}
            onChange={updateField}
            placeholder={t('enrollment.lastNamePlaceholder')}
            autoComplete="family-name"
            maxLength={60}
            required
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? 'enrollment-last-name-error' : undefined}
          />
          {errors.lastName ? <p id="enrollment-last-name-error" className="field__error">{errors.lastName}</p> : null}
        </div>

        <div className="field field--full">
          <label htmlFor="enrollment-phone">{t('enrollment.phone')}</label>
          <input
            id="enrollment-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            value={values.phone}
            onChange={updateField}
            placeholder={t('enrollment.phonePlaceholder')}
            autoComplete="tel"
            required
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'enrollment-phone-error' : 'enrollment-phone-hint'}
          />
          {errors.phone ? (
            <p id="enrollment-phone-error" className="field__error">{errors.phone}</p>
          ) : (
            <p id="enrollment-phone-hint" className="field__hint">{t('enrollment.phoneHint')}</p>
          )}
        </div>

        <div className="field field--full">
          <label htmlFor="enrollment-course">{t('enrollment.course')}</label>
          <select
            id="enrollment-course"
            name="courseId"
            value={values.courseId}
            onChange={updateField}
            required
            aria-invalid={Boolean(errors.courseId)}
            aria-describedby={errors.courseId ? 'enrollment-course-error' : undefined}
            disabled={courses.status === 'loading'}
          >
            <option value="">{courses.status === 'loading' ? t('common.loading') : t('enrollment.coursePlaceholder')}</option>
            {courses.items.map((course) => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
          {errors.courseId ? <p id="enrollment-course-error" className="field__error">{errors.courseId}</p> : null}
        </div>

        <div className="field field--full">
          <label htmlFor="enrollment-group">
            {t('enrollment.group')} <span className="field__optional">({t('common.optional')})</span>
          </label>
          <select
            id="enrollment-group"
            name="groupId"
            value={values.groupId}
            onChange={updateField}
            disabled={!values.courseId || groupsStatus === 'loading'}
          >
            <option value="">{t('enrollment.groupAny')}</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {`#${group.id} · ${group.days
                  .map((day) => t(`weekdays.short${day.charAt(0).toUpperCase()}${day.slice(1)}`))
                  .join(', ')} · ${group.time} · ${t('course.seatsLeft', { count: group.seatsLeft })}`}
              </option>
            ))}
          </select>
          {groupsStatus === 'loading' ? (
            <p className="field__hint">
              <Loader2 className="spinner" size={14} aria-hidden="true" /> {t('common.loading')}
            </p>
          ) : null}
          {groupsStatus === 'succeeded' && groups.length === 0 ? (
            <p className="field__hint">{t('enrollment.noGroups')}</p>
          ) : null}
          {groupsError ? (
            <p className="field__error">
              {t(`errors.${groupsError}`, { defaultValue: t('enrollment.groupsLoadError') })}
            </p>
          ) : null}
          {selectedGroup ? <p className="field__hint">{formatDate(selectedGroup.startDate, lang)}</p> : null}
        </div>

        <div className="field field--full">
          <label htmlFor="enrollment-level">
            {t('enrollment.ageOrLevel')} <span className="field__optional">({t('common.optional')})</span>
          </label>
          <input
            id="enrollment-level"
            name="ageOrLevel"
            value={values.ageOrLevel}
            onChange={updateField}
            placeholder={t('enrollment.ageOrLevelPlaceholder')}
            maxLength={80}
          />
        </div>

        <div className="field field--full">
          <label htmlFor="enrollment-comment">
            {t('enrollment.comment')} <span className="field__optional">({t('common.optional')})</span>
          </label>
          <textarea
            id="enrollment-comment"
            name="comment"
            value={values.comment}
            onChange={updateField}
            placeholder={t('enrollment.commentPlaceholder')}
            rows={3}
            maxLength={1000}
            aria-invalid={Boolean(errors.comment)}
          />
          {errors.comment ? <p className="field__error">{errors.comment}</p> : null}
        </div>
      </div>

      {application.status === 'failed' ? (
        <p className="form-error" role="alert">
          {t(`errors.${application.error}`, { defaultValue: t('enrollment.errorTitle') })}
        </p>
      ) : null}

      <p className="form-privacy">{t('enrollment.privacy')}</p>

      <button type="submit" className="button button--primary button--block" disabled={application.status === 'loading'}>
        {application.status === 'loading' ? t('enrollment.submitting') : t('enrollment.submit')}
      </button>
    </form>
  );
}

export function EnrollmentModal({ request, onClose }) {
  const { t } = useTranslation();
  return (
    <Modal
      open={Boolean(request)}
      onClose={onClose}
      title={t('enrollment.title')}
      subtitle={t('enrollment.subtitle')}
      size="medium"
    >
      {request ? (
        <EnrollmentForm
          key={`${request.courseId}-${request.groupId}`}
          request={request}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
}
