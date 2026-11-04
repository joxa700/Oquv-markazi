import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminPageHeader } from './components/AdminPageHeader';
import { FaqForm } from './FaqForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState, ErrorState, LoadingState } from '../components/State';
import { adminApi, toPlainError } from '../services/api';
import { useAdminResource } from '../hooks/useAdminResource';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../hooks/useLanguage';
import { localizedField } from '../utils/localized';

export function FaqAdminPage() {
  const { t } = useTranslation();
  const language = useLanguage();
  const toast = useToast();
  const items = useAdminResource(adminApi.getFaq);
  const [form, setForm] = useState({ open: false, item: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function handleSaved(saved) {
    items.setItems((current) => {
      const exists = current.some((item) => item.id === saved.id);
      const result = exists ? current.map((item) => (item.id === saved.id ? saved : item)) : [...current, saved];
      return result.sort((a, b) => a.order - b.order || a.id - b.id);
    });
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await adminApi.deleteFaq(deleteTarget.id);
      items.setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
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
        title={t('admin.faq.title')}
        subtitle={t('admin.faq.subtitle')}
        actions={
          <button type="button" className="button button--primary" onClick={() => setForm({ open: true, item: null })}>
            <Plus size={17} aria-hidden="true" />
            {t('admin.faq.add')}
          </button>
        }
      />

      <section className="admin-card">
        {items.status === 'loading' ? <LoadingState /> : null}
        {items.status === 'failed' ? (
          <ErrorState message={t(`errors.${items.error}`, { defaultValue: t('admin.common.loadError') })} onRetry={items.reload} />
        ) : null}
        {items.status === 'succeeded' && items.items.length ? (
          <div className="admin-faq-list">
            {items.items.map((item) => (
              <article key={item.id} className="admin-faq-item">
                <span className="admin-faq-item__order">{item.order}</span>
                <div>
                  <h3>{localizedField(item, 'question', language)}</h3>
                  <p>{localizedField(item, 'answer', language)}</p>
                </div>
                <div className="table-actions">
                  <button type="button" className="icon-button" onClick={() => setForm({ open: true, item })} aria-label={t('admin.common.edit')} title={t('admin.common.edit')}>
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button type="button" className="icon-button icon-button--danger" onClick={() => setDeleteTarget(item)} aria-label={t('admin.common.delete')} title={t('admin.common.delete')}>
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
        {items.status === 'succeeded' && !items.items.length ? (
          <EmptyState title={t('admin.faq.noItems')} icon={HelpCircle} />
        ) : null}
      </section>

      {form.open ? (
        <FaqForm item={form.item} onClose={() => setForm({ open: false, item: null })} onSaved={handleSaved} />
      ) : null}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('admin.common.confirmDeleteTitle')}
        message={t('admin.faq.deleteConfirm')}
        confirmLabel={t('admin.common.deleteConfirm')}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
