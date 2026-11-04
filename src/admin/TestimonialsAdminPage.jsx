import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquareQuote, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { AdminPageHeader } from './components/AdminPageHeader';
import { TestimonialForm } from './TestimonialForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState, ErrorState, LoadingState } from '../components/State';
import { adminApi, resolveAssetUrl, toPlainError } from '../services/api';
import { useAdminResource } from '../hooks/useAdminResource';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../hooks/useLanguage';
import { localizedField } from '../utils/localized';

export function TestimonialsAdminPage() {
  const { t } = useTranslation();
  const language = useLanguage();
  const toast = useToast();
  const testimonials = useAdminResource(adminApi.getTestimonials);
  const [form, setForm] = useState({ open: false, testimonial: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function handleSaved(saved) {
    testimonials.setItems((current) => {
      const exists = current.some((item) => item.id === saved.id);
      return exists ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current];
    });
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await adminApi.deleteTestimonial(deleteTarget.id);
      testimonials.setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
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
        title={t('admin.testimonials.title')}
        subtitle={t('admin.testimonials.subtitle')}
        actions={
          <button type="button" className="button button--primary" onClick={() => setForm({ open: true, testimonial: null })}>
            <Plus size={17} aria-hidden="true" />
            {t('admin.testimonials.add')}
          </button>
        }
      />

      <section className="admin-card">
        {testimonials.status === 'loading' ? <LoadingState /> : null}
        {testimonials.status === 'failed' ? (
          <ErrorState
            message={t(`errors.${testimonials.error}`, { defaultValue: t('admin.common.loadError') })}
            onRetry={testimonials.reload}
          />
        ) : null}
        {testimonials.status === 'succeeded' && testimonials.items.length ? (
          <div className="admin-testimonial-grid">
            {testimonials.items.map((testimonial) => (
              <article key={testimonial.id} className="admin-testimonial">
                <div className="admin-testimonial__top">
                  {testimonial.photo ? (
                    <img src={resolveAssetUrl(testimonial.photo)} alt="" />
                  ) : (
                    <span className="admin-testimonial__avatar">{testimonial.author.charAt(0)}</span>
                  )}
                  <div>
                    <strong>{testimonial.author}</strong>
                    <div className="stars">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star key={index} size={14} fill={index < testimonial.rating ? 'currentColor' : 'none'} aria-hidden="true" />
                      ))}
                    </div>
                  </div>
                  <div className="table-actions">
                    <button type="button" className="icon-button" onClick={() => setForm({ open: true, testimonial })} aria-label={t('admin.common.edit')} title={t('admin.common.edit')}>
                      <Pencil size={16} aria-hidden="true" />
                    </button>
                    <button type="button" className="icon-button icon-button--danger" onClick={() => setDeleteTarget(testimonial)} aria-label={t('admin.common.delete')} title={t('admin.common.delete')}>
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <p>{localizedField(testimonial, 'text', language)}</p>
              </article>
            ))}
          </div>
        ) : null}
        {testimonials.status === 'succeeded' && !testimonials.items.length ? (
          <EmptyState title={t('admin.testimonials.noItems')} icon={MessageSquareQuote} />
        ) : null}
      </section>

      {form.open ? (
        <TestimonialForm
          testimonial={form.testimonial}
          onClose={() => setForm({ open: false, testimonial: null })}
          onSaved={handleSaved}
        />
      ) : null}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('admin.common.confirmDeleteTitle')}
        message={t('admin.testimonials.deleteConfirm')}
        confirmLabel={t('admin.common.deleteConfirm')}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
