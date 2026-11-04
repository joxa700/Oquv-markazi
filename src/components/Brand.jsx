import { Link } from 'react-router-dom';
import { getSiteText } from '../config/site';
import { useLanguage } from '../hooks/useLanguage';

export function Brand({ compact = false, className = '' }) {
  const lang = useLanguage();
  return (
    <Link to={`/${lang}`} className={`brand ${className}`.trim()} aria-label={getSiteText('name', lang)}>
      <img src="/logo.svg" alt="" width="46" height="46" className="brand__mark" />
      {!compact ? (
        <span className="brand__text">
          <strong>{getSiteText('logoText', lang)}</strong>
          <small>{getSiteText('tagline', lang)}</small>
        </span>
      ) : null}
    </Link>
  );
}
