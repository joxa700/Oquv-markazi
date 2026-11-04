import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus, Search, Trash2, UserRound } from 'lucide-react';
import { AdminPageHeader } from './components/AdminPageHeader';
import { TeacherForm } from './TeacherForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState, ErrorState, LoadingState } from '../components/State';
import { adminApi, resolveAssetUrl, toPlainError } from '../services/api';
import { useAdminResource } from '../hooks/useAdminResource';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../hooks/useLanguage';
import { localizedField } from '../utils/localized';

export function TeachersAdminPage() {
  const { t } = useTranslation();
  const language = useLanguage();
  const toast = useToast();
  const teachers = useAdminResource(adminApi.getTeachers);
  const courses = useAdminResource(adminApi.getCourses);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ open: false, teacher: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(language);
    if (!query) return teachers.items;
    return teachers.items.filter((teacher) =>
      `${teacher.name} ${localizedField(teacher, 'specialization', language)}`.toLocaleLowerCase(language).includes(query),
    );
  }, [language, search, teachers.items]);

  function handleSaved(saved) {
    teachers.setItems((current) => {
      const exists = current.some((teacher) => teacher.id === saved.id);
      return exists ? current.map((teacher) => (teacher.id === saved.id ? saved : teacher)) : [...current, saved];
    });
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await adminApi.deleteTeacher(deleteTarget.id);
      teachers.setItems((current) => current.filter((teacher) => teacher.id !== deleteTarget.id));
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
        title={t('admin.teachers.title')}
        subtitle={t('admin.teachers.subtitle')}
        actions={
          <button type="button" className="button button--primary" onClick={() => setForm({ open: true, teacher: null })}>
            <Plus size={17} aria-hidden="true" />
            {t('admin.teachers.add')}
          </button>
        }
      />

      <section className="admin-card">
        <div className="admin-toolbar">
          <label className="search-field">
            <Search size={17} aria-hidden="true" />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('admin.common.searchPlaceholder')} aria-label={t('admin.common.search')} />
          </label>
          <span className="admin-count">{t('admin.common.total')}: {filtered.length}</span>
        </div>

        {teachers.status === 'loading' ? <LoadingState /> : null}
        {teachers.status === 'failed' ? (
          <ErrorState message={t(`errors.${teachers.error}`, { defaultValue: t('admin.common.loadError') })} onRetry={teachers.reload} />
        ) : null}

        {teachers.status === 'succeeded' && filtered.length ? (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.fields.name')}</th>
                  <th>{t('admin.fields.specialization')}</th>
                  <th>{t('admin.fields.experienceYears')}</th>
                  <th>{t('admin.common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>
                      <div className="admin-entity">
                        <span className="admin-entity__thumb admin-entity__thumb--round">
                          {teacher.photo ? <img src={resolveAssetUrl(teacher.photo)} alt="" /> : <UserRound size={18} aria-hidden="true" />}
                        </span>
                        <span><strong>{teacher.name}</strong></span>
                      </div>
                    </td>
                    <td>{localizedField(teacher, 'specialization', language)}</td>
                    <td>{t('teachers.experienceValue', { count: teacher.experienceYears })}</td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="icon-button" onClick={() => setForm({ open: true, teacher })} aria-label={t('admin.common.edit')} title={t('admin.common.edit')}>
                          <Pencil size={17} aria-hidden="true" />
                        </button>
                        <button type="button" className="icon-button icon-button--danger" onClick={() => setDeleteTarget(teacher)} aria-label={t('admin.common.delete')} title={t('admin.common.delete')}>
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

        {teachers.status === 'succeeded' && !filtered.length ? (
          <EmptyState title={t('admin.teachers.noItems')} icon={UserRound} />
        ) : null}
      </section>

      {form.open ? (
        <TeacherForm
          teacher={form.teacher}
          courses={courses.items}
          onClose={() => setForm({ open: false, teacher: null })}
          onSaved={handleSaved}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('admin.common.confirmDeleteTitle')}
        message={t('admin.teachers.deleteConfirm')}
        confirmLabel={t('admin.common.deleteConfirm')}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
