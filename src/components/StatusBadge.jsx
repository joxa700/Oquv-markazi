import { useTranslation } from 'react-i18next';

export function StatusBadge({ status, type = 'group' }) {
  const { t } = useTranslation();
  const prefix = type === 'application' ? 'applicationStatus' : 'groupStatus';
  return <span className={`status-badge status-badge--${status}`}>{t(`${prefix}.${status}`)}</span>;
}
