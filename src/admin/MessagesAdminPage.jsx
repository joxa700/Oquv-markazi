import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Mail, MailOpen, Search, Trash2 } from 'lucide-react';
import { AdminPageHeader } from './components/AdminPageHeader';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState, ErrorState, LoadingState } from '../components/State';
import { adminApi, toPlainError } from '../services/api';
import { useAdminResource } from '../hooks/useAdminResource';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../hooks/useLanguage';
import { formatDateTime } from '../utils/format';

export function MessagesAdminPage() {
  const { t } = useTranslation();
  const language = useLanguage();
  const toast = useToast();
  const messages = useAdminResource(adminApi.getMessages);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(language);
    if (!query) return messages.items;
    return messages.items.filter((message) =>
      `${message.name} ${message.phone || ''} ${message.email || ''} ${message.text}`.toLocaleLowerCase(language).includes(query),
    );
  }, [language, messages.items, search]);

  async function markMessage(message, isRead) {
    try {
      const updated = await adminApi.updateMessage(message.id, { isRead });
      messages.setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      if (selected?.id === updated.id) setSelected(updated);
      toast.success(t(isRead ? 'admin.toasts.markedRead' : 'admin.toasts.markedUnread'));
    } catch (error) {
      toast.error(t(`errors.${toPlainError(error).code}`, { defaultValue: t('admin.common.generalError') }));
    }
  }

  function openMessage(message) {
    setSelected(message);
    if (!message.isRead) markMessage(message, true);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await adminApi.deleteMessage(deleteTarget.id);
      messages.setItems((current) => current.filter((message) => message.id !== deleteTarget.id));
      if (selected?.id === deleteTarget.id) setSelected(null);
      toast.success(t('admin.toasts.deleted'));
      setDeleteTarget(null);
    } catch (error) {
      toast.error(t(`errors.${toPlainError(error).code}`, { defaultValue: t('admin.common.generalError') }));
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    if (!selected) return;
    const fresh = messages.items.find((item) => item.id === selected.id);
    if (fresh && fresh !== selected) setSelected(fresh);
  }, [messages.items, selected]);

  return (
    <>
      <AdminPageHeader title={t('admin.messages.title')} subtitle={t('admin.messages.subtitle')} />

      <section className="admin-card">
        <div className="admin-toolbar">
          <label className="search-field">
            <Search size={17} aria-hidden="true" />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('admin.common.searchPlaceholder')} aria-label={t('admin.common.search')} />
          </label>
          <span className="admin-count">{t('admin.common.total')}: {filtered.length}</span>
        </div>

        {messages.status === 'loading' ? <LoadingState /> : null}
        {messages.status === 'failed' ? (
          <ErrorState message={t(`errors.${messages.error}`, { defaultValue: t('admin.common.loadError') })} onRetry={messages.reload} />
        ) : null}

        {messages.status === 'succeeded' && filtered.length ? (
          <div className="message-list">
            {filtered.map((message) => (
              <article key={message.id} className={`message-row ${message.isRead ? '' : 'is-unread'}`.trim()}>
                <span className="message-row__icon">{message.isRead ? <MailOpen size={19} aria-hidden="true" /> : <Mail size={19} aria-hidden="true" />}</span>
                <button type="button" className="message-row__main" onClick={() => openMessage(message)}>
                  <span className="message-row__head">
                    <strong>{message.name}</strong>
                    <span className={`status-pill ${message.isRead ? '' : 'status-pill--new'}`.trim()}>
                      {t(message.isRead ? 'admin.messages.read' : 'admin.messages.unread')}
                    </span>
                  </span>
                  <span className="message-row__contact">
                    {[message.phone, message.email].filter(Boolean).join(' · ') || t('admin.messages.noContact')}
                  </span>
                  <p>{message.text}</p>
                  <small>{formatDateTime(message.createdAt, language)} · {String(message.language || 'uz').toUpperCase()}</small>
                </button>
                <div className="table-actions">
                  <button type="button" className="icon-button" onClick={() => openMessage(message)} aria-label={t('admin.common.view')} title={t('admin.common.view')}>
                    <Eye size={17} aria-hidden="true" />
                  </button>
                  <button type="button" className="icon-button" onClick={() => markMessage(message, !message.isRead)} aria-label={t(message.isRead ? 'admin.common.markUnread' : 'admin.common.markRead')} title={t(message.isRead ? 'admin.common.markUnread' : 'admin.common.markRead')}>
                    {message.isRead ? <Mail size={17} aria-hidden="true" /> : <MailOpen size={17} aria-hidden="true" />}
                  </button>
                  <button type="button" className="icon-button icon-button--danger" onClick={() => setDeleteTarget(message)} aria-label={t('admin.common.delete')} title={t('admin.common.delete')}>
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {messages.status === 'succeeded' && !filtered.length ? (
          <EmptyState title={t('admin.messages.noItems')} icon={Mail} />
        ) : null}
      </section>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={t('admin.messages.detailsTitle')} subtitle={selected ? formatDateTime(selected.createdAt, language) : ''} size="medium">
        {selected ? (
          <div className="message-detail">
            <div className="message-detail__meta">
              <div><span>{t('admin.messages.name')}</span><strong>{selected.name}</strong></div>
              <div><span>{t('admin.messages.language')}</span><strong>{String(selected.language || 'uz').toUpperCase()}</strong></div>
              <div>
                <span>{t('admin.messages.contact')}</span>
                <strong>
                  {selected.phone ? <a href={`tel:${selected.phone}`}>{selected.phone}</a> : null}
                  {selected.phone && selected.email ? ' · ' : null}
                  {selected.email ? <a href={`mailto:${selected.email}`}>{selected.email}</a> : null}
                  {!selected.phone && !selected.email ? t('admin.messages.noContact') : null}
                </strong>
              </div>
            </div>
            <div className="message-detail__body">
              <h3>{t('admin.messages.message')}</h3>
              <p>{selected.text || t('admin.messages.emptyBody')}</p>
            </div>
            <div className="modal__footer-inline">
              <button type="button" className="button button--outline" onClick={() => markMessage(selected, !selected.isRead)}>
                {t(selected.isRead ? 'admin.common.markUnread' : 'admin.common.markRead')}
              </button>
              <button type="button" className="button button--danger" onClick={() => setDeleteTarget(selected)}>
                <Trash2 size={17} aria-hidden="true" />
                {t('admin.common.delete')}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('admin.common.confirmDeleteTitle')}
        message={t('admin.messages.deleteConfirm')}
        confirmLabel={t('admin.common.deleteConfirm')}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
