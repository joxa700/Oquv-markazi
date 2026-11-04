import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_LANGUAGE, isSupportedLanguage } from '../../../shared/languages';

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    language: DEFAULT_LANGUAGE,
    theme: 'light',
  },
  reducers: {
    setLanguage(state, action) {
      if (isSupportedLanguage(action.payload)) {
        state.language = action.payload;
      }
    },
    setTheme(state, action) {
      state.theme = action.payload === 'dark' ? 'dark' : 'light';
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
  },
});

export const { setLanguage, setTheme, toggleTheme } = settingsSlice.actions;
export default settingsSlice.reducer;
