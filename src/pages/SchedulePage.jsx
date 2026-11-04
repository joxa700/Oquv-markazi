import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { CalendarDays, FilterX, Users } from 'lucide-react';
import { Seo } from '../components/Seo';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/State';
import { useEnrollment } from '../components/EnrollmentProvider';
import { fetchCourses } from '../features/courses/coursesSlice';
import { fetchGroups } from '../features/content/contentSlice';
import { useLanguage } from '../hooks/useLanguage';
import { formatDate } from '../utils/format';

export function SchedulePage() {
  const { t } = useTranslation();
  const lang = useLanguage();
  const dispatch = useDispatch();
  const { openEnrollment } = useEnrollment();
  const courses = useSelector((state) => state.courses);
  const groups = useSelector((state) => state.content.groups);
  const [courseId, setCourseId] = useState('');
  const [groupId, setGroupId] = useState('');

  useEffect(() => {
    if (courses.status === 'idle' || courses.lang !== lang) dispatch(fetchCourses(lang));
    if (groups.status === 'idle' || groups.lang !== lang) dispatch(fetchGroups(lang));
  }, [courses.lang, courses.status, dispatch, groups.lang, groups.status, lang]);

  const availableGroups = useMemo(
    () => groups.items.filter((group) => !courseId || String(group.course?.id) === courseId),
    [courseId, groups.items],
  );

  const filtered = useMemo(
    () =>
      availableGroups.filter((group) => !groupId || String(group.id) === groupId),
    [availableGroups, groupId],
  );

  function resetFilters() {
    setCourseId('');
    setGroupId('');
  }

  return (
    <>
      <Seo titleKey="meta.schedule.title" descriptionKey="meta.schedule.description" />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t('nav.schedule')}</span>
          <h1>{t('schedule.title')}</h1>
          <p>{t('schedule.subtitle')}</p>
        </div>
      </section>

      <section className="section page-section">
        <div className="container">
          <div className="filter-bar filter-bar--schedule">
            <label className="select-field select-field--wide">
              <CalendarDays size={17} aria-hidden="true" />
              <span className="sr-only">{t('schedule.courseFilter')}</span>
              <select
                value={courseId}
                onChange={(event) => {
                  setCourseId(event.target.value);
                  setGroupId('');
                }}
                aria-label={t('schedule.courseFilter')}
              >
                <option value="">{t('schedule.allCourses')}</option>
                {courses.items.map((course) => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </label>

            <label className="select-field select-field--wide">
              <Users size={17} aria-hidden="true" />
              <span className="sr-only">{t('schedule.groupFilter')}</span>
              <select value={groupId} onChange={(event) => setGroupId(event.target.value)} aria-label={t('schedule.groupFilter')}>
                <option value="">{t('schedule.allGroups')}</option>
                {availableGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {`#${group.id} · ${group.course?.name} · ${group.time}`}
                  </option>
                ))}
              </select>
            </label>

            {(courseId || groupId) ? (
              <button type="button" className="button button--ghost" onClick={resetFilters}>
                <FilterX size={17} aria-hidden="true" />
                {t('schedule.clearFilters')}
              </button>
            ) : null}
          </div>

          {groups.status === 'loading' && groups.items.length === 0 ? <LoadingState /> : null}
          {groups.status === 'failed' && groups.items.length === 0 ? (
            <ErrorState
              message={t(`errors.${groups.error}`, { defaultValue: t('errors.generic') })}
              onRetry={() => dispatch(fetchGroups(lang))}
            />
          ) : null}

          {filtered.length ? (
            <div className="table-wrap schedule-table-wrap">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>{t('schedule.course')}</th>
                    <th>{t('schedule.group')}</th>
                    <th>{t('schedule.teacher')}</th>
                    <th>{t('schedule.level')}</th>
                    <th>{t('schedule.days')}</th>
                    <th>{t('schedule.time')}</th>
                    <th>{t('schedule.seats')}</th>
                    <th>{t('schedule.status')}</th>
                    <th><span className="sr-only">{t('common.actions')}</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((group) => (
                    <tr key={group.id}>
                      <td data-label={t('schedule.course')}>
                        <Link to={`/${lang}/courses/${group.course?.slug}`} className="table-course-link">
                          {group.course?.name}
                        </Link>
                      </td>
                      <td data-label={t('schedule.group')}>#{group.id}</td>
                      <td data-label={t('schedule.teacher')}>{group.teacher?.name || '—'}</td>
                      <td data-label={t('schedule.level')}>{group.level || '—'}</td>
                      <td data-label={t('schedule.days')}>{group.days.map((day) => t(`weekdays.short${day.charAt(0).toUpperCase()}${day.slice(1)}`)).join(', ')}</td>
                      <td data-label={t('schedule.time')}>{group.time}</td>
                      <td data-label={t('schedule.seats')}>
                        <strong>{group.seatsLeft}</strong> / {group.capacity}
                        <small>{formatDate(group.startDate, lang)}</small>
                      </td>
                      <td data-label={t('schedule.status')}><StatusBadge status={group.status} /></td>
                      <td className="schedule-table__action">
                        <button
                          type="button"
                          className="button button--outline button--small"
                          onClick={() => openEnrollment({ courseId: group.course?.id, groupId: group.id })}
                          disabled={group.status !== 'open' || group.seatsLeft === 0}
                        >
                          {group.status === 'full' || group.seatsLeft === 0 ? t('schedule.groupFull') : t('schedule.enroll')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : groups.status === 'succeeded' ? (
            <EmptyState
              title={t('schedule.noGroupsTitle')}
              text={t('schedule.noGroupsText')}
              icon={CalendarDays}
              action={(courseId || groupId) ? (
                <button type="button" className="button button--outline" onClick={resetFilters}>{t('schedule.clearFilters')}</button>
              ) : null}
            />
          ) : null}
        </div>
      </section>
    </>
  );
}
