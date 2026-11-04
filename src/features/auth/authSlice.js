import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi, toPlainError } from '../../services/api';

export const loginAdmin = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    return await authApi.login(credentials);
  } catch (error) {
    return rejectWithValue(toPlainError(error));
  }
});

export const fetchCurrentAdmin = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    return await authApi.me();
  } catch (error) {
    return rejectWithValue(toPlainError(error));
  }
});

export const logoutAdmin = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authApi.logout();
    return true;
  } catch (error) {
    const plain = toPlainError(error);
    if (plain.status === 401) return true;
    return rejectWithValue(plain);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    clearAuth(state) {
      state.user = null;
      state.status = 'anonymous';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload.user;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.status = 'anonymous';
        state.error = action.payload?.code || 'INVALID_CREDENTIALS';
      })
      .addCase(fetchCurrentAdmin.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCurrentAdmin.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload.user;
      })
      .addCase(fetchCurrentAdmin.rejected, (state, action) => {
        state.status = 'anonymous';
        state.user = null;
        state.error = action.payload?.code || null;
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.user = null;
        state.status = 'anonymous';
        state.error = null;
      });
  },
});

export const { clearAuthError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
