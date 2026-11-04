import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { Modal } from './Modal';
import { resolveAssetUrl } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';

export function TeacherProfileModal({ teacher, onClose }) {
  const { t } = useTranslation();
  const lang = useLanguage();

  return (
    <Modal open={Boolean(teacher)} onClose={onClose} title={teacher?.name || ''} subtitle={teacher?.specialization || ''} size="medium">
      {teacher ? (
        <div className="teacher-profile">
          <div className="teacher-profile__top">
            <img
              src={resolveAssetUrl(teacher.photo)}
              alt={teacher.name}
              onError={(event) => {
                event.currentTarget.src = '/logo.svg';
              }}
            />
            <div>
              <span className="teacher-profile__experience">
                <GraduationCap size={18} aria-hidden="true" />
                {t('teachers.experienceValue', { count: teacher.experienceYears })}
              </span>
              <p>{teacher.bio}</p>
            </div>
          </div>

          {teacher.courses?.length ? (
            <div className="teacher-profile__courses">
              <h3>{t('teachers.teaches')}</h3>
              <ul>
                {teacher.courses.map((course) => (
                  <li key={course.id}>
                    <Link to={`/${lang}/courses/${course.slug}`} onClick={onClose}>
                      <span>{course.name}</span>
                      <span className="badge badge--soft">{t(`categories.${course.category}`)}</span>
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
