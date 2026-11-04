import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Layers3,
  Phone,
  Users,
  Wallet,
} from 'lucide-react';
import { Seo } from '../components/Seo';
import { LoadingState, ErrorState } from '../components/State';
import { StatusBadge } from '../components/StatusBadge';
import { TeacherProfileModal } from '../components/TeacherProfileModal';
import { CourseCard } from '../components/CourseCard';
import { fetchCourse, fetchCourses, resetCourseDetail } from '../features/courses/coursesSlice';
import { useEnrollment } from '../components/EnrollmentProvider';
import { useLanguage } from '../hooks/useLanguage';
import { formatDate, formatPrice, parseCurriculum } from '../utils/format';
import { resolveAssetUrl } from '../services/api';
import { siteConfig } from '../config/site';

export function CourseDetailPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const lang = useLanguage();
  const dispatch = useDispatch();
  const { openEnrollment } = useEnrollment();
  const courseState = useSelector((state) => state.courses);
  const course = courseState.currentSlug === slug ? courseState.current : null;
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const coursesStateRef = useRef(courseState);
  coursesStateRef.current = courseState;

  useEffect(() => {
    const coursesState = coursesStateRef.current;
    dispatch(fetchCourse({ slug, lang }));
    if (coursesState.status === 'idle' || coursesState.lang !== lang) dispatch(fetchCourses(lang));
    return () => dispatch(resetCourseDetail());
  }, [dispatch, lang, slug]);

  if (courseState.detailStatus === 'loading' || courseState.detailStatus === 'idle') {
    return <div className="container section"><LoadingState /></div>;
  }

  if (courseState.detailStatus === 'failed') {
    const notFound = courseState.detailError === 'NOT_FOUND';
    return (
      <>
        <Seo title={t(notFound ? 'courseDetails.notFoundTitle' : 'common.error')} noIndex />
        <section className="section">
          <div className="container narrow-container">
            {notFound ? (
              <div className="not-found-card">
                <BookOpen size={42} aria-hidden="true" />
                <h1>{t('courseDetails.notFoundTitle')}</h1>
                <p>{t('courseDetails.notFoundText')}</p>
                <Link to={`/${lang}/courses`} className="button button--primary">
                  <ArrowLeft size={17} aria-hidden="true" />
                  {t('courseDetails.backToCourses')}
                </Link>
              </div>
            ) : (
              <ErrorState
                message={t(`errors.${courseState.detailError}`, { defaultValue: t('errors.generic') })}
                onRetry={() => dispatch(fetchCourse({ slug, lang }))}
              />
            )}
          </div>
        </section>
      </>
    );
  }

  if (!course) return null;

  const curriculum = parseCurriculum(course.curriculum);
  const openGroups = course.groups?.filter((group) => group.status === 'open') || [];
  const related = courseState.items.filter((item) => item.id !== course.id).slice(0, 3);

  return (
    <>
      <Seo
        title={course.name}
        description={course.description?.slice(0, 160)}
        titleKey="meta.courses.title"
        descriptionKey="meta.courses.description"
      />

      <div className="container breadcrumbs">
        <Link to={`/${lang}`}>{t('nav.home')}</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/${lang}/courses`}>{t('nav.courses')}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{course.name}</span>
      </div>

      <section className="course-detail-hero">
        <div className="container course-detail-hero__grid">
          <div className="course-detail-hero__content">
            <span className="badge badge--soft">{t(`categories.${course.category}`)}</span>
            <h1>{course.name}</h1>
            <p>{course.description}</p>
            <div className="course-detail-hero__meta">
              <span><Clock3 size={18} aria-hidden="true" />{course.duration}</span>
              <span><Layers3 size={18} aria-hidden="true" />{t('course.lessonsPerWeekValue', { count: course.lessonsPerWeek })}</span>
              <span><CalendarDays size={18} aria-hidden="true" />{formatDate(course.startDate, lang)}</span>
            </div>
            <div className="course-detail-hero__actions">
              <button type="button" className="button button--primary button--large" onClick={() => openEnrollment({ courseId: course.id })}>
                {t('course.enrollNow')}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
              <a href={siteConfig.phoneHref} className="button button--outline button--large">
                <Phone size={17} aria-hidden="true" />
                {siteConfig.phone}
              </a>
            </div>
          </div>
          <div className="course-detail-hero__media">
            <img
              src={resolveAssetUrl(course.image)}
              alt=""
              onError={(event) => {
                event.currentTarget.src = '/logo.svg';
              }}
            />
            <div className="course-price-card">
              <span>{t('course.price')}</span>
              <strong>{formatPrice(course.price, lang, t)}</strong>
              <small>{t('common.perMonth')}</small>
            </div>
          </div>
        </div>
      </section>

      <section className="section page-section">
        <div className="container course-detail-layout">
          <div className="course-detail-main">
            <article className="content-card">
              <h2>{t('course.aboutCourse')}</h2>
              <p className="prose">{course.description}</p>

              <div className="info-pairs">
                <div>
                  <span><GraduationCap size={18} aria-hidden="true" />{t('course.targetAudience')}</span>
                  <p>{course.targetAudience}</p>
                </div>
                <div>
                  <span><BookOpen size={18} aria-hidden="true" />{t('course.requiredLevel')}</span>
                  <p>{course.requiredLevel}</p>
                </div>
                <div>
                  <span><Wallet size={18} aria-hidden="true" />{t('course.paymentTerms')}</span>
                  <p>{course.paymentTerms}</p>
                </div>
              </div>
            </article>

            <article className="content-card">
              <h2>{t('course.curriculum')}</h2>
              {curriculum.length ? (
                <ol className="curriculum-list">
                  {curriculum.map((item, index) => (
                    <li key={`${index}-${item}`}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <p>{item}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>{t('course.curriculumEmpty')}</p>
              )}
            </article>

            {course.teachers?.length ? (
              <article className="content-card">
                <h2>{t('course.teachers')}</h2>
                <div className="compact-teacher-list">
                  {course.teachers.map((teacher) => (
                    <button key={teacher.id} type="button" className="compact-teacher" onClick={() => setSelectedTeacher(teacher)}>
                      <img
                        src={resolveAssetUrl(teacher.photo)}
                        alt=""
                        onError={(event) => {
                          event.currentTarget.src = '/logo.svg';
                        }}
                      />
                      <span>
                        <strong>{teacher.name}</strong>
                        <small>{teacher.specialization}</small>
                      </span>
                      <ArrowRight size={17} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </article>
            ) : null}

            <article className="content-card">
              <h2>{t('course.groups')}</h2>
              {course.groups?.length ? (
                <div className="group-list">
                  {course.groups.map((group) => (
                    <div key={group.id} className="group-row">
                      <div className="group-row__primary">
                        <strong>#{group.id}</strong>
                        <StatusBadge status={group.status} />
                      </div>
                      <div className="group-row__details">
                        <span><CalendarDays size={16} aria-hidden="true" />{group.days.map((day) => t(`weekdays.${day}`)).join(', ')}</span>
                        <span><Clock3 size={16} aria-hidden="true" />{group.time}</span>
                        <span><GraduationCap size={16} aria-hidden="true" />{group.teacher?.name}</span>
                        <span><Users size={16} aria-hidden="true" />{t('course.seatsLeft', { count: group.seatsLeft })}</span>
                        <span><CalendarDays size={16} aria-hidden="true" />{formatDate(group.startDate, lang)}</span>
                      </div>
                      <button
                        type="button"
                        className="button button--outline button--small"
                        onClick={() => openEnrollment({ courseId: course.id, groupId: group.id })}
                        disabled={group.status !== 'open' || group.seatsLeft === 0}
                      >
                        {group.status === 'full' || group.seatsLeft === 0 ? t('course.groupFull') : t('schedule.enroll')}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>{t('course.noGroups')}</p>
              )}
            </article>
          </div>

          <aside className="course-detail-sidebar">
            <div className="sticky-card">
              <h2>{t('course.courseInfo')}</h2>
              <dl className="detail-list">
                <div><dt>{t('course.duration')}</dt><dd>{course.duration}</dd></div>
                <div><dt>{t('course.lessonsPerWeek')}</dt><dd>{t('course.lessonsPerWeekValue', { count: course.lessonsPerWeek })}</dd></div>
                <div><dt>{t('course.startDate')}</dt><dd>{formatDate(course.startDate, lang)}</dd></div>
                <div><dt>{t('course.price')}</dt><dd>{formatPrice(course.price, lang, t)} / {t('common.perMonth')}</dd></div>
                <div><dt>{t('course.availableGroups')}</dt><dd>{openGroups.length}</dd></div>
              </dl>
              <button type="button" className="button button--primary button--block" onClick={() => openEnrollment({ courseId: course.id })}>
                {t('course.enrollNow')}
              </button>
              <div className="sidebar-contact">
                <h3>{t('course.contactUs')}</h3>
                <p>{t('course.contactText')}</p>
                <a href={siteConfig.phoneHref}>{siteConfig.phone}</a>
              </div>
            </div>
            <div className="promise-card">
              <CheckCircle2 size={21} aria-hidden="true" />
              <p>{t('home.heroNote')}</p>
            </div>
          </aside>
        </div>
      </section>

      {related.length ? (
        <section className="section section--muted">
          <div className="container">
            <div className="section-heading section-heading--split">
              <div>
                <span className="eyebrow">{t('course.relatedCourses')}</span>
                <h2>{t('course.relatedCourses')}</h2>
              </div>
              <Link to={`/${lang}/courses`} className="button button--outline">{t('common.viewAll')}</Link>
            </div>
            <div className="course-grid">
              {related.map((item) => <CourseCard key={item.id} course={item} />)}
            </div>
          </div>
        </section>
      ) : null}

      <TeacherProfileModal teacher={selectedTeacher} onClose={() => setSelectedTeacher(null)} />
    </>
  );
}
