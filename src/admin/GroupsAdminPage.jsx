import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { AdminPageHeader } from './components/AdminPageHeader';
import { GroupForm } from './GroupForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/State';
import { adminApi, toPlainError } from '../services/api';
import { useAdminResource } from '../hooks/useAdminResource';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../hooks/useLanguage';
import { formatDate } from '../utils/format';
import { localizedField } from '../utils/localized';

export function GroupsAdminPage() {
  const { t } = useTranslation();
  const language = useLanguage();
  const toast = useToast();
  const groups = useAdminResource(adminApi.getGroups);
  const courses = useAdminResource(adminApi.getCourses);
  const teachers = useAdminResource(adminApi.getTeachers);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ open: false, group: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(language);
    if (!query) return groups.items;
    return groups.items.filter((group) => {
      const courseName = localizedField(group.course, 'name', language);
      return `${courseName} ${group.teacher?.name || ''} ${group.time}`.toLocaleLowerCase(language).includes(query);
    });
  }, [groups.items, language, search]);

  function handleSaved(saved) {
    groups.setItems((current) => {
      const exists = current.some((group) => group.id === saved.id);
      return exists ? current.map((group) => (group.id === saved.id ? saved : group)) : [...current, saved];
    });
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await adminApi.deleteGroup(deleteTarget.id);
      groups.setItems((current) => current.filter((group) => group.id !== deleteTarget.id));
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
        title={t('admin.groups.title')}
        subtitle={t('admin.groups.subtitle')}
        actions={
          <button type="button" className="button button--primary" onClick={() => setForm({ open: true, group: null })}>
            <Plus size={17} aria-hidden="true" />
            {t('admin.groups.add')}
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

        {groups.status === 'loading' ? <LoadingState /> : null}
        {groups.status === 'failed' ? (
          <ErrorState message={t(`errors.${groups.error}`, { defaultValue: t('admin.common.loadError') })} onRetry={groups.reload} />
        ) : null}

        {groups.status === 'succeeded' && filtered.length ? (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.fields.course')}</th>
                  <th>{t('admin.fields.teacher')}</th>
                  <th>{t('admin.fields.days')}</th>
                  <th>{t('admin.fields.time')}</th>
                  <th>{t('admin.fields.capacity')}</th>
                  <th>{t('admin.fields.startDate')}</th>
                  <th>{t('admin.fields.status')}</th>
                  <th>{t('admin.common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((group) => (
                  <tr key={group.id}>
                    <td><strong>{localizedField(group.course, 'name', language)}</strong><small>#{group.id}</small></td>
                    <td>{group.teacher?.name || '—'}</td>
                    <td>{group.days.map((day) => t(`weekdays.short${day.charAt(0).toUpperCase()}${day.slice(1)}`)).join(', ')}</td>
                    <td>{group.time}</td>
                    <td>{group.enrolledCount} / {group.capacity}</td>
                    <td>{formatDate(group.startDate, language)}</td>
                    <td><StatusBadge status={group.status} /></td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="icon-button" onClick={() => setForm({ open: true, group })} aria-label={t('admin.common.edit')} title={t('admin.common.edit')}>
                          <Pencil size={17} aria-hidden="true" />
                        </button>
                        <button type="button" className="icon-button icon-button--danger" onClick={() => setDeleteTarget(group)} aria-label={t('admin.common.delete')} title={t('admin.common.delete')}>
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

        {groups.status === 'succeeded' && !filtered.length ? (
          <EmptyState title={t('admin.groups.noItems')} icon={CalendarDays} />
        ) : null}
      </section>

      {form.open ? (
        <GroupForm
          group={form.group}
          courses={courses.items}
          teachers={teachers.items}
          onClose={() => setForm({ open: false, group: null })}
          onSaved={handleSaved}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('admin.common.confirmDeleteTitle')}
        message={t('admin.groups.deleteConfirm')}
        confirmLabel={t('admin.common.deleteConfirm')}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
