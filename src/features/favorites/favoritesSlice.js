import { createSlice } from '@reduxjs/toolkit';

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    courseIds: [],
  },
  reducers: {
    toggleFavorite(state, action) {
      const id = Number(action.payload);
      if (!Number.isFinite(id)) return;
      if (state.courseIds.includes(id)) {
        state.courseIds = state.courseIds.filter((courseId) => courseId !== id);
      } else {
        state.courseIds.push(id);
      }
    },
    removeFavorite(state, action) {
      const id = Number(action.payload);
      state.courseIds = state.courseIds.filter((courseId) => courseId !== id);
    },
    clearFavorites(state) {
      state.courseIds = [];
    },
  },
});

export const { toggleFavorite, removeFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
