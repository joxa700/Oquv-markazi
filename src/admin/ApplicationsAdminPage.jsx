import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, FilterX, Search, Trash2 } from 'lucide-react';
import { AdminPageHeader } from './components/AdminPageHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/State';
import { adminApi, toPlainError } from '../services/api';
import { useAdminResource } from '../hooks/useAdminResource';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../hooks/useLanguage';
import { formatDateTime } from '../utils/format';
import { localizedField } from '../utils/localized';

const statuses = ['new', 'contacted', 'accepted', 'rejected'];
const emptyFilters = { search: '', status: '', courseId: '', dateFrom: '', dateTo: '' };

export function ApplicationsAdminPage() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const language = useLanguage();
  const toast = useToast();
  const [draft, setDraft] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const applications = useAdminResource(() => adminApi.getApplications(applied), JSON.stringify(applied));
  const courses = useAdminResource(adminApi.getCourses);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const newCount = useMemo(
    () => applications.items.filter((application) => application.status === 'new').length,
    [applications.items],
  );

  function updateDraft(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function applyFilters(event) {
    event.preventDefault();
    setApplied(draft);
  }

  function clearFilters() {
    setDraft(emptyFilters);
    setApplied(emptyFilters);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await adminApi.deleteApplication(deleteTarget.id);
      applications.setItems((current) => current.filter((application) => application.id !== deleteTarget.id));
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
      <AdminPageHeader title={t('admin.applications.title')} subtitle={t('admin.applications.subtitle')} />

      <section className="admin-card">
        <form className="admin-filters" onSubmit={applyFilters}>
          <label className="search-field">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={draft.search}
              onChange={(event) => updateDraft('search', event.target.value)}
              placeholder={t('admin.applications.searchPlaceholder')}
              aria-label={t('admin.common.search')}
            />
          </label>

          <label className="select-field">
            <span className="sr-only">{t('admin.common.filterStatus')}</span>
            <select value={draft.status} onChange={(event) => updateDraft('status', event.target.value)} aria-label={t('admin.common.filterStatus')}>
              <option value="">{t('admin.common.all')}</option>
              {statuses.map((status) => <option key={status} value={status}>{t(`admin.statuses.${status}`)}</option>)}
            </select>
          </label>

          <label className="select-field">
            <span className="sr-only">{t('admin.common.filterCourse')}</span>
            <select value={draft.courseId} onChange={(event) => updateDraft('courseId', event.target.value)} aria-label={t('admin.common.filterCourse')}>
              <option value="">{t('admin.common.all')}</option>
              {courses.items.map((course) => (
                <option key={course.id} value={course.id}>{localizedField(course, 'name', language)}</option>
              ))}
            </select>
          </label>

          <label className="date-field">
            <span>{t('admin.common.filterDateFrom')}</span>
            <input type="date" value={draft.dateFrom} onChange={(event) => updateDraft('dateFrom', event.target.value)} />
          </label>

          <label className="date-field">
            <span>{t('admin.common.filterDateTo')}</span>
            <input type="date" value={draft.dateTo} onChange={(event) => updateDraft('dateTo', event.target.value)} />
          </label>

          <div className="admin-filters__actions">
            <button type="submit" className="button button--primary button--small">{t('admin.common.applyFilters')}</button>
            <button type="button" className="button button--ghost button--small" onClick={clearFilters}>
              <FilterX size={16} aria-hidden="true" />
              {t('admin.common.clearFilters')}
            </button>
          </div>
        </form>

        <div className="admin-toolbar admin-toolbar--between">
          <span className="admin-count">{t('admin.common.total')}: {applications.items.length}</span>
          <span className="status-pill status-pill--new">{t('admin.applications.newCount', { count: newCount })}</span>
        </div>

        {applications.status === 'loading' ? <LoadingState /> : null}
        {applications.status === 'failed' ? (
          <ErrorState message={t(`errors.${applications.error}`, { defaultValue: t('admin.common.loadError') })} onRetry={applications.reload} />
        ) : null}

        {applications.status === 'succeeded' && applications.items.length ? (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.applications.student')}</th>
                  <th>{t('admin.applications.phone')}</th>
                  <th>{t('admin.applications.course')}</th>
                  <th>{t('admin.applications.group')}</th>
                  <th>{t('admin.applications.status')}</th>
                  <th>{t('admin.applications.date')}</th>
                  <th>{t('admin.common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {applications.items.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <strong>{application.firstName} {application.lastName}</strong>
                      <small>{application.ageOrLevel || '—'}</small>
                    </td>
                    <td><a href={`tel:${application.phone}`}>{application.phone}</a></td>
                    <td>{application.course ? localizedField(application.course, 'name', language) : '—'}</td>
                    <td>{application.group ? `#${application.group.id} · ${application.group.time}` : t('admin.applications.notSelected')}</td>
                    <td><StatusBadge status={application.status} type="application" /></td>
                    <td>{formatDateTime(application.createdAt, language)}</td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/${lang}/admin/applications/${application.id}`} className="icon-button" aria-label={t('admin.common.details')} title={t('admin.common.details')}>
                          <Eye size={17} aria-hidden="true" />
                        </Link>
                        <button type="button" className="icon-button icon-button--danger" onClick={() => setDeleteTarget(application)} aria-label={t('admin.common.delete')} title={t('admin.common.delete')}>
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

        {applications.status === 'succeeded' && !applications.items.length ? (
          <EmptyState title={t('admin.applications.noItems')} icon={Search} />
        ) : null}
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('admin.common.confirmDeleteTitle')}
        message={t('admin.applications.deleteConfirm')}
        confirmLabel={t('admin.common.deleteConfirm')}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
