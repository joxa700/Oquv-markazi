import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { siteConfig } from '../config/site';

export function TelegramFloat() {
  const { t } = useTranslation();
  return (
    <a
      className="telegram-float"
      href={siteConfig.telegram}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={t('contact.telegram')}
      title={t('contact.telegram')}
    >
      <Send size={21} aria-hidden="true" />
    </a>
  );
}
