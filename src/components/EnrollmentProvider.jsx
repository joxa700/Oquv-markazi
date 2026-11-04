import { createContext, useContext, useMemo, useState } from 'react';
import { EnrollmentModal } from './EnrollmentModal';

const EnrollmentContext = createContext(null);

export function EnrollmentProvider({ children }) {
  const [request, setRequest] = useState(null);

  const value = useMemo(
    () => ({
      openEnrollment: (options = {}) => setRequest({ courseId: options.courseId || '', groupId: options.groupId || '' }),
      closeEnrollment: () => setRequest(null),
    }),
    [],
  );

  return (
    <EnrollmentContext.Provider value={value}>
      {children}
      <EnrollmentModal request={request} onClose={value.closeEnrollment} />
    </EnrollmentContext.Provider>
  );
}

export function useEnrollment() {
  const context = useContext(EnrollmentContext);
  if (!context) throw new Error('useEnrollment must be used inside EnrollmentProvider');
  return context;
}
