import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { publicApi, toPlainError } from '../../services/api';

export const submitApplication = createAsyncThunk(
  'applications/submit',
  async (data, { rejectWithValue }) => {
    try {
      return await publicApi.createApplication(data);
    } catch (error) {
      return rejectWithValue(toPlainError(error));
    }
  },
);

const applicationsSlice = createSlice({
  name: 'applications',
  initialState: {
    status: 'idle',
    error: null,
    fieldErrors: {},
    lastSubmitted: null,
  },
  reducers: {
    resetApplicationState(state) {
      state.status = 'idle';
      state.error = null;
      state.fieldErrors = {};
      state.lastSubmitted = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitApplication.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.fieldErrors = {};
      })
      .addCase(submitApplication.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastSubmitted = action.payload;
      })
      .addCase(submitApplication.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.code || 'UNKNOWN';
        state.fieldErrors = action.payload?.fields || {};
      });
  },
});

export const { resetApplicationState } = applicationsSlice.actions;
export default applicationsSlice.reducer;
