import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistReducer, persistStore } from 'redux-persist';
import settingsReducer from '../features/settings/settingsSlice';
import favoritesReducer from '../features/favorites/favoritesSlice';
import uiReducer from '../features/ui/uiSlice';
import authReducer from '../features/auth/authSlice';
import coursesReducer from '../features/courses/coursesSlice';
import contentReducer from '../features/content/contentSlice';
import applicationsReducer from '../features/applications/applicationsSlice';

const storage = {
  getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(window.localStorage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(window.localStorage.removeItem(key)),
};

const rootReducer = combineReducers({
  settings: settingsReducer,
  favorites: favoritesReducer,
  ui: uiReducer,
  auth: authReducer,
  courses: coursesReducer,
  content: contentReducer,
  applications: applicationsReducer,
});

const persistedReducer = persistReducer(
  {
    key: 'nurtalim-root',
    version: 1,
    storage,
    whitelist: ['settings', 'favorites'],
  },
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
