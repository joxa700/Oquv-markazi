import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { adminApi, resolveAssetUrl, toPlainError } from '../../services/api';
import { useToast } from '../../hooks/useToast';

export function MediaField({ value, onChange, label, accept = 'image/*' }) {
  const { t } = useTranslation();
  const toast = useToast();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const result = await adminApi.upload(file);
      onChange(result.url);
      toast.success(t('admin.toasts.uploaded'));
    } catch (error) {
      const plain = toPlainError(error);
      toast.error(t(`errors.${plain.code}`, { defaultValue: t('admin.common.generalError') }));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="media-field">
      <span className="media-field__label">{label || t('admin.common.uploadImage')}</span>
      <div className="media-field__body">
        <div className="media-field__preview">
          {value ? (
            <img src={resolveAssetUrl(value)} alt="" />
          ) : (
            <ImagePlus size={28} aria-hidden="true" />
          )}
        </div>
        <div className="media-field__controls">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFile}
            hidden
            aria-label={t('admin.common.chooseImage')}
          />
          <button type="button" className="button button--outline button--small" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="spinner" size={16} aria-hidden="true" /> : <ImagePlus size={16} aria-hidden="true" />}
            {uploading ? t('admin.common.uploading') : t('admin.common.chooseImage')}
          </button>
          {value ? (
            <button type="button" className="button button--ghost button--small" onClick={() => onChange('')}>
              <Trash2 size={16} aria-hidden="true" />
              {t('admin.common.removeImage')}
            </button>
          ) : null}
          <p>{t('admin.common.imageHint')}</p>
        </div>
      </div>
    </div>
  );
}
