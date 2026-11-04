import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, Clock3, Heart, Users } from 'lucide-react';
import { toggleFavorite } from '../features/favorites/favoritesSlice';
import { formatPrice } from '../utils/format';
import { resolveAssetUrl } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';

export function CourseCard({ course, compact = false }) {
  const { t } = useTranslation();
  const lang = useLanguage();
  const dispatch = useDispatch();
  const toast = useToast();
  const isFavorite = useSelector((state) => state.favorites.courseIds.includes(course.id));

  function handleFavorite() {
    dispatch(toggleFavorite(course.id));
    toast.info(t(isFavorite ? 'favorites.remove' : 'favorites.add'));
  }

  return (
    <article className={`course-card ${compact ? 'course-card--compact' : ''}`.trim()}>
      <div className="course-card__media">
        <img
          src={resolveAssetUrl(course.image)}
          alt=""
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = '/logo.svg';
          }}
        />
        <span className="badge badge--soft course-card__category">{t(`categories.${course.category}`)}</span>
        <button
          type="button"
          className={`icon-button course-card__favorite ${isFavorite ? 'is-active' : ''}`.trim()}
          onClick={handleFavorite}
          aria-label={t(isFavorite ? 'favorites.remove' : 'favorites.add')}
          aria-pressed={isFavorite}
        >
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      </div>
      <div className="course-card__body">
        <h3>
          <Link to={`/${lang}/courses/${course.slug}`}>{course.name}</Link>
        </h3>
        <p>{course.description || t('courses.noDescription')}</p>
        <div className="course-card__meta">
          <span><Clock3 size={15} aria-hidden="true" />{course.duration}</span>
          <span><Users size={15} aria-hidden="true" />{t('course.lessonsPerWeekValue', { count: course.lessonsPerWeek })}</span>
        </div>
        <div className="course-card__footer">
          <div className="price">
            <strong>{formatPrice(course.price, lang, t)}</strong>
            <span>{t('common.perMonth')}</span>
          </div>
          <Link to={`/${lang}/courses/${course.slug}`} className="text-link" aria-label={`${t('common.details')}: ${course.name}`}>
            {t('common.details')}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
