import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, GraduationCap, Phone, Trash2, UserRound } from 'lucide-react';
import { AdminPageHeader } from './components/AdminPageHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState, LoadingState } from '../components/State';
import { adminApi, toPlainError } from '../services/api';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../hooks/useLanguage';
import { formatDateTime } from '../utils/format';
import { localizedField } from '../utils/localized';

const statuses = ['new', 'contacted', 'accepted', 'rejected'];

export function ApplicationDetailPage() {
  const { id, lang } = useParams();
  const { t } = useTranslation();
  const language = useLanguage();
  const navigate = useNavigate();
  const toast = useToast();
  const [application, setApplication] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [nextStatus, setNextStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    adminApi
      .getApplication(id)
      .then((data) => {
        if (!alive) return;
        setApplication(data);
        setNextStatus(data.status);
        setStatus('succeeded');
      })
      .catch((err) => {
        if (!alive) return;
        setError(toPlainError(err).code);
        setStatus('failed');
      });
    return () => {
      alive = false;
    };
  }, [id]);

  async function handleStatusUpdate() {
    if (!application || nextStatus === application.status) return;
    setSaving(true);
    try {
      const updated = await adminApi.updateApplication(application.id, { status: nextStatus });
      setApplication(updated);
      toast.success(t('admin.applications.statusUpdated'));
    } catch (err) {
      const plain = toPlainError(err);
      toast.error(t(`errors.${plain.code}`, { defaultValue: t('admin.common.generalError') }));
      setNextStatus(application.status);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await adminApi.deleteApplication(application.id);
      toast.success(t('admin.toasts.deleted'));
      navigate(`/${lang}/admin/applications`, { replace: true });
    } catch (err) {
      toast.error(t(`errors.${toPlainError(err).code}`, { defaultValue: t('admin.common.generalError') }));
    } finally {
      setDeleting(false);
    }
  }

  if (status === 'loading') return <LoadingState />;
  if (status === 'failed') {
    return (
      <ErrorState
        message={t(`errors.${error}`, { defaultValue: t('admin.common.loadError') })}
        onRetry={() => window.location.reload()}
      />
    );
  }
  if (!application) return null;

  return (
    <>
      <AdminPageHeader
        title={t('admin.applications.detailsTitle')}
        subtitle={`#${application.id}`}
        actions={
          <Link to={`/${lang}/admin/applications`} className="button button--outline">
            <ArrowLeft size={17} aria-hidden="true" />
            {t('admin.common.back')}
          </Link>
        }
      />

      <div className="admin-detail-grid">
        <section className="admin-card">
          <div className="admin-detail-heading">
            <span className="admin-detail-avatar">{application.firstName.charAt(0)}{application.lastName.charAt(0)}</span>
            <div>
              <h2>{application.firstName} {application.lastName}</h2>
              <StatusBadge status={application.status} type="application" />
            </div>
          </div>

          <dl className="admin-detail-list">
            <div>
              <dt><Phone size={16} aria-hidden="true" />{t('admin.fields.phone')}</dt>
              <dd><a href={`tel:${application.phone}`}>{application.phone}</a></dd>
            </div>
            <div>
              <dt><GraduationCap size={16} aria-hidden="true" />{t('admin.fields.course')}</dt>
              <dd>{application.course ? localizedField(application.course, 'name', language) : t('admin.applications.notSelected')}</dd>
            </div>
            <div>
              <dt><UserRound size={16} aria-hidden="true" />{t('admin.applications.preferredGroup')}</dt>
              <dd>
                {application.group
                  ? `#${application.group.id} · ${application.group.time} · ${application.group.days.map((day) => t(`weekdays.short${day.charAt(0).toUpperCase()}${day.slice(1)}`)).join(', ')}`
                  : t('admin.applications.notSelected')}
              </dd>
            </div>
            <div>
              <dt>{t('admin.applications.ageOrLevel')}</dt>
              <dd>{application.ageOrLevel || t('admin.common.notProvided')}</dd>
            </div>
            <div>
              <dt>{t('admin.applications.language')}</dt>
              <dd>{String(application.preferredLanguage || 'uz').toUpperCase()}</dd>
            </div>
            <div>
              <dt><Calendar size={16} aria-hidden="true" />{t('admin.common.createdAt')}</dt>
              <dd>{formatDateTime(application.createdAt, language)}</dd>
            </div>
          </dl>

          <div className="admin-detail-comment">
            <h3>{t('admin.fields.comment')}</h3>
            <p>{application.comment || t('admin.common.notProvided')}</p>
          </div>
        </section>

        <aside className="admin-side-stack">
          <section className="admin-card">
            <h2>{t('admin.applications.changeStatus')}</h2>
            <div className="field">
              <label htmlFor="application-status">{t('admin.fields.status')}</label>
              <select id="application-status" value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}>
                {statuses.map((item) => <option key={item} value={item}>{t(`admin.statuses.${item}`)}</option>)}
              </select>
            </div>
            <button
              type="button"
              className="button button--primary button--block"
              onClick={handleStatusUpdate}
              disabled={saving || nextStatus === application.status}
            >
              {saving ? t('admin.common.saving') : t('admin.common.save')}
            </button>
          </section>

          <section className="admin-card admin-card--danger">
            <h2>{t('admin.common.delete')}</h2>
            <p>{t('admin.common.deleteWarning')}</p>
            <button type="button" className="button button--danger button--block" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={17} aria-hidden="true" />
              {t('admin.applications.deleteConfirm')}
            </button>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={t('admin.common.confirmDeleteTitle')}
        message={t('admin.applications.deleteConfirm')}
        confirmLabel={t('admin.common.deleteConfirm')}
        loading={deleting}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
