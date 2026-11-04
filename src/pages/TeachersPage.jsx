import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Seo } from '../components/Seo';
import { TeacherCard } from '../components/TeacherCard';
import { TeacherProfileModal } from '../components/TeacherProfileModal';
import { EmptyState, ErrorState, LoadingState } from '../components/State';
import { fetchTeachers } from '../features/content/contentSlice';
import { useLanguage } from '../hooks/useLanguage';

export function TeachersPage() {
  const { t } = useTranslation();
  const lang = useLanguage();
  const dispatch = useDispatch();
  const teachers = useSelector((state) => state.content.teachers);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    if (teachers.lang !== lang || teachers.status === 'idle') dispatch(fetchTeachers(lang));
  }, [dispatch, lang, teachers.lang, teachers.status]);

  return (
    <>
      <Seo titleKey="meta.teachers.title" descriptionKey="meta.teachers.description" />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t('nav.teachers')}</span>
          <h1>{t('teachers.title')}</h1>
          <p>{t('teachers.subtitle')}</p>
        </div>
      </section>

      <section className="section page-section">
        <div className="container">
          {teachers.status === 'loading' && teachers.items.length === 0 ? <LoadingState /> : null}
          {teachers.status === 'failed' && teachers.items.length === 0 ? (
            <ErrorState
              message={t(`errors.${teachers.error}`, { defaultValue: t('errors.generic') })}
              onRetry={() => dispatch(fetchTeachers(lang))}
            />
          ) : null}
          {teachers.items.length ? (
            <div className="teacher-grid teacher-grid--page">
              {teachers.items.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} onOpen={setSelectedTeacher} />
              ))}
            </div>
          ) : teachers.status === 'succeeded' ? (
            <EmptyState title={t('teachers.emptyTitle')} text={t('teachers.emptyText')} />
          ) : null}
        </div>
      </section>

      <TeacherProfileModal teacher={selectedTeacher} onClose={() => setSelectedTeacher(null)} />
    </>
  );
}
