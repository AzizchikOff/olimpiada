import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from './api';

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectIdState] = useState(() => Number(localStorage.getItem('subjectId')) || 0);

  const setSubjectId = useCallback((id) => {
    setSubjectIdState(id);
    localStorage.setItem('subjectId', id);
  }, []);

  const refreshSubjects = useCallback(() => {
    api.get('/api/subjects').then((list) => {
      setSubjects(list);
      setSubjectIdState((cur) => {
        if (!list.length) {
          localStorage.removeItem('subjectId');
          return 0;
        }
        if (!list.some((s) => s.id === cur)) {
          localStorage.setItem('subjectId', list[0].id);
          return list[0].id;
        }
        return cur;
      });
    });
  }, []);

  useEffect(() => { refreshSubjects(); }, [refreshSubjects]);

  return (
    <Ctx.Provider value={{ subjects, refreshSubjects, subjectId, setSubjectId }}>
      {children}
    </Ctx.Provider>
  );
}

export const useStore = () => useContext(Ctx);
