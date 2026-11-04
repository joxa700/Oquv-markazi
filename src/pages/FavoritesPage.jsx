import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { Seo } from '../components/Seo';
import { CourseCard } from '../components/CourseCard';
import { EmptyState, ErrorState, LoadingState } from '../components/State';
import { fetchCourses } from '../features/courses/coursesSlice';
import { useLanguage } from '../hooks/useLanguage';

export function FavoritesPage() {
  const { t } = useTranslation();
  const lang = useLanguage();
  const dispatch = useDispatch();
  const courses = useSelector((state) => state.courses);
  const favoriteIds = useSelector((state) => state.favorites.courseIds);
  const favorites = courses.items.filter((course) => favoriteIds.includes(course.id));

  useEffect(() => {
    if (courses.lang !== lang || courses.status === 'idle') dispatch(fetchCourses(lang));
  }, [courses.lang, courses.status, dispatch, lang]);

  return (
    <>
      <Seo titleKey="meta.favorites.title" descriptionKey="meta.favorites.description" />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t('nav.favorites')}</span>
          <h1>{t('favorites.title')}</h1>
          <p>{t('favorites.subtitle')}</p>
        </div>
      </section>

      <section className="section page-section">
        <div className="container">
          {courses.status === 'loading' && courses.items.length === 0 ? <LoadingState /> : null}
          {courses.status === 'failed' && courses.items.length === 0 ? (
            <ErrorState
              message={t(`errors.${courses.error}`, { defaultValue: t('errors.generic') })}
              onRetry={() => dispatch(fetchCourses(lang))}
            />
          ) : null}
          {favorites.length ? (
            <>
              <p className="results-row">{t('favorites.count', { count: favorites.length })}</p>
              <div className="course-grid">
                {favorites.map((course) => <CourseCard key={course.id} course={course} />)}
              </div>
            </>
          ) : courses.status === 'succeeded' ? (
            <EmptyState
              title={t('favorites.emptyTitle')}
              text={t('favorites.emptyText')}
              icon={Heart}
              action={<Link to={`/${lang}/courses`} className="button button--primary">{t('notFound.browseCourses')}</Link>}
            />
          ) : null}
        </div>
      </section>
    </>
  );
}
