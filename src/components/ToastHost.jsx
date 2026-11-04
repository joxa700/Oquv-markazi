import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { removeToast } from '../features/ui/uiSlice';

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

function Toast({ toast }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const Icon = icons[toast.type] || Info;

  useEffect(() => {
    const timeout = window.setTimeout(() => dispatch(removeToast(toast.id)), 4800);
    return () => window.clearTimeout(timeout);
  }, [dispatch, toast.id]);

  return (
    <div className={`toast toast--${toast.type}`} role="status">
      <Icon size={20} aria-hidden="true" />
      <p>{toast.message}</p>
      <button
        type="button"
        className="icon-button toast__close"
        onClick={() => dispatch(removeToast(toast.id))}
        aria-label={t('common.close')}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastHost() {
  const toasts = useSelector((state) => state.ui.toasts);
  return (
    <div className="toast-host" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
