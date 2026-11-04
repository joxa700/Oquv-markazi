import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { clearAuth } from '../features/auth/authSlice';
import { toPlainError } from '../services/api';

export function useAdminResource(loader, dependencyKey = '') {
  const dispatch = useDispatch();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const load = useCallback(async () => {
    void dependencyKey;
    setStatus('loading');
    setError(null);
    try {
      const data = await loaderRef.current();
      setItems(data);
      setStatus('succeeded');
      return data;
    } catch (err) {
      const plain = toPlainError(err);
      if (plain.status === 401) dispatch(clearAuth());
      setError(plain.code);
      setStatus('failed');
      return [];
    }
  }, [dependencyKey, dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, setItems, status, error, reload: load };
}
