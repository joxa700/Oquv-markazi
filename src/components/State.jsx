import { AlertTriangle, Inbox, Loader2, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function LoadingState({ label }) {
  const { t } = useTranslation();
  return (
    <div className="state" role="status" aria-live="polite">
      <Loader2 className="spinner" size={28} aria-hidden="true" />
      <p>{label || t('common.loading')}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  const { t } = useTranslation();
  return (
    <div className="state state--error" role="alert">
      <AlertTriangle size={28} aria-hidden="true" />
      <p>{message || t('errors.generic')}</p>
      {onRetry ? (
        <button type="button" className="button button--outline button--small" onClick={onRetry}>
          <RotateCcw size={16} aria-hidden="true" />
          {t('common.retry')}
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, text, action, icon: Icon = Inbox }) {
  return (
    <div className="state state--empty">
      <Icon size={30} aria-hidden="true" />
      <h3>{title}</h3>
      {text ? <p>{text}</p> : null}
      {action}
    </div>
  );
}
