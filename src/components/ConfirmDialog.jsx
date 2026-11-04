import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';

export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel, loading = false, danger = true }) {
  const { t } = useTranslation();
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="small"
      footer={
        <>
          <button type="button" className="button button--ghost" onClick={onCancel} disabled={loading}>
            {t('common.cancel')}
          </button>
          <button
            type="button"
            className={`button ${danger ? 'button--danger' : 'button--primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? t('common.saving') : confirmLabel || t('common.delete')}
          </button>
        </>
      }
    >
      <p className="modal__message">{message}</p>
    </Modal>
  );
}
