import { useTranslation } from 'react-i18next';
import { ArrowUpRight, GraduationCap } from 'lucide-react';
import { resolveAssetUrl } from '../services/api';

export function TeacherCard({ teacher, onOpen }) {
  const { t } = useTranslation();
  return (
    <article className="teacher-card">
      <div className="teacher-card__photo">
        <img
          src={resolveAssetUrl(teacher.photo)}
          alt={teacher.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = '/logo.svg';
          }}
        />
      </div>
      <div className="teacher-card__body">
        <span className="teacher-card__specialization">{teacher.specialization}</span>
        <h3>{teacher.name}</h3>
        <p>{teacher.bio}</p>
        <div className="teacher-card__footer">
          <span className="teacher-card__experience">
            <GraduationCap size={17} aria-hidden="true" />
            {t('teachers.experienceValue', { count: teacher.experienceYears })}
          </span>
          <button type="button" className="button button--outline button--small" onClick={() => onOpen(teacher)}>
            {t('teachers.viewProfile')}
            <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
