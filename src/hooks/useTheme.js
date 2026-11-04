import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export function useTheme() {
  const theme = useSelector((state) => state.settings.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
}
