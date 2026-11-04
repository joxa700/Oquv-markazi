import { useTranslation } from 'react-i18next';

export function AdminFormActions({ onCancel, loading, label }) {
  const { t } = useTranslation();
  return (
    <div className="admin-form-actions">
      <button type="button" className="button button--ghost" onClick={onCancel} disabled={loading}>
        {t('admin.common.cancel')}
      </button>
      <button type="submit" className="button button--primary" disabled={loading}>
        {loading ? t('admin.common.saving') : label || t('admin.common.save')}
      </button>
    </div>
  );
}
