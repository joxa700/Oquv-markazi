import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../features/ui/uiSlice';

export function useToast() {
  const dispatch = useDispatch();
  return useMemo(
    () => ({
      success: (message) => dispatch(addToast({ message, type: 'success' })),
      error: (message) => dispatch(addToast({ message, type: 'error' })),
      info: (message) => dispatch(addToast({ message, type: 'info' })),
    }),
    [dispatch],
  );
}
