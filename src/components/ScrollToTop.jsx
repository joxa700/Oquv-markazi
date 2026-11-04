import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

function withoutLanguage(pathname) {
  return pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '');
}

export function ScrollToTop() {
  const { pathname } = useLocation();
  const previousPath = useRef(withoutLanguage(pathname));

  useEffect(() => {
    const current = withoutLanguage(pathname);
    if (previousPath.current !== current) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      previousPath.current = current;
    }
  }, [pathname]);

  return null;
}
