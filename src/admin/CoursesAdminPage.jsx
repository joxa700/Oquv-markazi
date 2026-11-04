import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { AdminPageHeader } from './components/AdminPageHeader';
import { CourseForm } from './CourseForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState, ErrorState, LoadingState } from '../components/State';
import { adminApi, resolveAssetUrl, toPlainError } from '../services/api';
import { useAdminResource } from '../hooks/useAdminResource';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../hooks/useLanguage';
import { formatPrice } from '../utils/format';
import { localizedField } from '../utils/localized';

export function CoursesAdminPage() {
  const { t } = useTranslation();
  const language = useLanguage();
  const toast = useToast();
  const courses = useAdminResource(adminApi.getCourses);
  const teachers = useAdminResource(adminApi.getTeachers);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ open: false, course: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(language);
    if (!query) return courses.items;
    return courses.items.filter((course) =>
      localizedField(course, 'name', language).toLocaleLowerCase(language).includes(query),
    );
  }, [courses.items, language, search]);

  function handleSaved(saved) {
    courses.setItems((current) => {
      const exists = current.some((course) => course.id === saved.id);
      return exists ? current.map((course) => (course.id === saved.id ? saved : course)) : [...current, saved];
    });
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await adminApi.deleteCourse(deleteTarget.id);
      courses.setItems((current) => current.filter((course) => course.id !== deleteTarget.id));
      toast.success(t('admin.toasts.deleted'));
      setDeleteTarget(null);
    } catch (error) {
      toast.error(t(`errors.${toPlainError(error).code}`, { defaultValue: t('admin.common.generalError') }));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        title={t('admin.courses.title')}
        subtitle={t('admin.courses.subtitle')}
        actions={
          <button type="button" className="button button--primary" onClick={() => setForm({ open: true, course: null })}>
            <Plus size={17} aria-hidden="true" />
            {t('admin.courses.add')}
          </button>
        }
      />

      <section className="admin-card">
        <div className="admin-toolbar">
          <label className="search-field">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('admin.courses.searchPlaceholder')}
              aria-label={t('admin.common.search')}
            />
          </label>
          <span className="admin-count">{t('admin.common.total')}: {filtered.length}</span>
        </div>

        {courses.status === 'loading' ? <LoadingState /> : null}
        {courses.status === 'failed' ? (
          <ErrorState
            message={t(`errors.${courses.error}`, { defaultValue: t('admin.common.loadError') })}
            onRetry={courses.reload}
          />
        ) : null}

        {courses.status === 'succeeded' && filtered.length ? (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.courses.table.name')}</th>
                  <th>{t('admin.courses.table.category')}</th>
                  <th>{t('admin.courses.table.price')}</th>
                  <th>{t('admin.courses.table.lessons')}</th>
                  <th>{t('admin.courses.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div className="admin-entity">
                        <span className="admin-entity__thumb">
                          {course.image ? <img src={resolveAssetUrl(course.image)} alt="" /> : <BookOpen size={18} aria-hidden="true" />}
                        </span>
                        <span>
                          <strong>{localizedField(course, 'name', language)}</strong>
                          <small>{course.slug}</small>
                        </span>
                      </div>
                    </td>
                    <td><span className="badge badge--soft">{t(`categories.${course.category}`)}</span></td>
                    <td>{formatPrice(course.price, language, t)}</td>
                    <td>{course.lessonsPerWeek}</td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="icon-button" onClick={() => setForm({ open: true, course })} aria-label={t('admin.common.edit')} title={t('admin.common.edit')}>
                          <Pencil size={17} aria-hidden="true" />
                        </button>
                        <button type="button" className="icon-button icon-button--danger" onClick={() => setDeleteTarget(course)} aria-label={t('admin.common.delete')} title={t('admin.common.delete')}>
                          <Trash2 size={17} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {courses.status === 'succeeded' && !filtered.length ? (
          <EmptyState title={t('admin.courses.noItems')} text={search ? t('admin.common.noResults') : ''} icon={BookOpen} />
        ) : null}
      </section>

      {form.open ? (
        <CourseForm
          course={form.course}
          teachers={teachers.items}
          onClose={() => setForm({ open: false, course: null })}
          onSaved={handleSaved}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('admin.common.confirmDeleteTitle')}
        message={t('admin.courses.deleteConfirm')}
        confirmLabel={t('admin.common.deleteConfirm')}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
