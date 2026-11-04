import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Heart, Search, SlidersHorizontal, X } from 'lucide-react';
import { Seo } from '../components/Seo';
import { CourseCard } from '../components/CourseCard';
import { EmptyState, ErrorState, LoadingState } from '../components/State';
import { fetchCourses } from '../features/courses/coursesSlice';
import { useLanguage } from '../hooks/useLanguage';

const categories = ['english', 'it', 'math', 'russian'];
const sortOptions = ['sortPopular', 'sortPriceAsc', 'sortPriceDesc', 'sortNewest'];

export function CoursesPage() {
  const { t } = useTranslation();
  const lang = useLanguage();
  const dispatch = useDispatch();
  const courses = useSelector((state) => state.courses);
  const favoriteIds = useSelector((state) => state.favorites.courseIds);
  const [params, setParams] = useSearchParams();

  const search = params.get('q') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'sortPopular';
  const favoritesOnly = params.get('favorites') === '1';

  useEffect(() => {
    if (courses.lang !== lang || courses.status === 'idle') dispatch(fetchCourses(lang));
  }, [courses.lang, courses.status, dispatch, lang]);

  function updateParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(lang);
    const items = courses.items.filter((course) => {
      if (category && course.category !== category) return false;
      if (favoritesOnly && !favoriteIds.includes(course.id)) return false;
      if (query && !course.name.toLocaleLowerCase(lang).includes(query)) return false;
      return true;
    });

    return [...items].sort((a, b) => {
      if (sort === 'sortPriceAsc') return a.price - b.price;
      if (sort === 'sortPriceDesc') return b.price - a.price;
      if (sort === 'sortNewest') return new Date(b.startDate) - new Date(a.startDate);
      return a.id - b.id;
    });
  }, [category, courses.items, favoriteIds, favoritesOnly, lang, search, sort]);

  const hasFilters = Boolean(search || category || favoritesOnly || sort !== 'sortPopular');

  return (
    <>
      <Seo titleKey="meta.courses.title" descriptionKey="meta.courses.description" />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t('nav.courses')}</span>
          <h1>{t('courses.title')}</h1>
          <p>{t('courses.subtitle')}</p>
        </div>
      </section>

      <section className="section page-section">
        <div className="container">
          <div className="filter-bar">
            <label className="search-field">
              <Search size={18} aria-hidden="true" />
              <span className="sr-only">{t('courses.searchLabel')}</span>
              <input
                type="search"
                value={search}
                onChange={(event) => updateParam('q', event.target.value)}
                placeholder={t('courses.searchPlaceholder')}
                aria-label={t('courses.searchLabel')}
              />
              {search ? (
                <button type="button" className="search-field__clear" onClick={() => updateParam('q', '')} aria-label={t('common.reset')}>
                  <X size={16} aria-hidden="true" />
                </button>
              ) : null}
            </label>

            <label className="select-field">
              <SlidersHorizontal size={17} aria-hidden="true" />
              <span className="sr-only">{t('courses.categoryFilter')}</span>
              <select value={category} onChange={(event) => updateParam('category', event.target.value)} aria-label={t('courses.categoryFilter')}>
                <option value="">{t('courses.allCategories')}</option>
                {categories.map((key) => (
                  <option key={key} value={key}>{t(`categories.${key}`)}</option>
                ))}
              </select>
            </label>

            <label className="select-field">
              <span className="sr-only">{t('courses.sortLabel')}</span>
              <select value={sort} onChange={(event) => updateParam('sort', event.target.value)} aria-label={t('courses.sortLabel')}>
                {sortOptions.map((key) => (
                  <option key={key} value={key}>{t(`courses.${key}`)}</option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className={`button button--outline favorites-filter ${favoritesOnly ? 'is-active' : ''}`.trim()}
              onClick={() => updateParam('favorites', favoritesOnly ? '' : '1')}
              aria-pressed={favoritesOnly}
            >
              <Heart size={17} fill={favoritesOnly ? 'currentColor' : 'none'} aria-hidden="true" />
              {t('courses.favoritesOnly')}
            </button>
          </div>

          <div className="results-row">
            <p>{t('courses.results', { count: filtered.length })}</p>
            {hasFilters ? (
              <button type="button" className="text-button" onClick={() => setParams({}, { replace: true })}>
                {t('courses.clearFilters')}
              </button>
            ) : null}
          </div>

          {courses.status === 'loading' && courses.items.length === 0 ? <LoadingState /> : null}
          {courses.status === 'failed' && courses.items.length === 0 ? (
            <ErrorState
              message={t(`errors.${courses.error}`, { defaultValue: t('errors.generic') })}
              onRetry={() => dispatch(fetchCourses(lang))}
            />
          ) : null}

          {filtered.length ? (
            <div className="course-grid">
              {filtered.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : courses.status === 'succeeded' ? (
            <EmptyState
              title={favoritesOnly ? t('favorites.emptyTitle') : t('courses.emptyTitle')}
              text={favoritesOnly ? t('favorites.emptyText') : t('courses.emptyText')}
              action={hasFilters ? (
                <button type="button" className="button button--outline" onClick={() => setParams({}, { replace: true })}>
                  {t('courses.clearFilters')}
                </button>
              ) : null}
            />
          ) : null}
        </div>
      </section>
    </>
  );
}
