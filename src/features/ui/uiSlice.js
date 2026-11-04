import { createSlice } from '@reduxjs/toolkit';

let toastSequence = 0;

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    toasts: [],
  },
  reducers: {
    addToast: {
      reducer(state, action) {
        state.toasts.push(action.payload);
      },
      prepare({ message, type = 'success' }) {
        toastSequence += 1;
        return {
          payload: {
            id: `toast-${Date.now()}-${toastSequence}`,
            message,
            type,
          },
        };
      },
    },
    removeToast(state, action) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
  },
});

export const { addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
