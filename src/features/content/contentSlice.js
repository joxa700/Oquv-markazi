import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { publicApi, toPlainError } from '../../services/api';

const createPublicThunk = (type, apiCall) =>
  createAsyncThunk(type, async (lang, { rejectWithValue }) => {
    try {
      return { lang, items: await apiCall(lang) };
    } catch (error) {
      return rejectWithValue(toPlainError(error));
    }
  });

export const fetchTeachers = createPublicThunk('content/teachers', publicApi.getTeachers);
export const fetchGroups = createPublicThunk('content/groups', publicApi.getGroups);
export const fetchTestimonials = createPublicThunk('content/testimonials', publicApi.getTestimonials);
export const fetchFaq = createPublicThunk('content/faq', publicApi.getFaq);

export const fetchStats = createAsyncThunk('content/stats', async (_, { rejectWithValue }) => {
  try {
    return await publicApi.getStats();
  } catch (error) {
    return rejectWithValue(toPlainError(error));
  }
});

const createCollection = () => ({
  items: [],
  status: 'idle',
  error: null,
  lang: null,
});

const applyCollectionReducers = (builder, thunk, key) => {
  builder
    .addCase(thunk.pending, (state) => {
      state[key].status = 'loading';
      state[key].error = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state[key].status = 'succeeded';
      state[key].items = action.payload.items;
      state[key].lang = action.payload.lang;
    })
    .addCase(thunk.rejected, (state, action) => {
      state[key].status = 'failed';
      state[key].error = action.payload?.code || 'UNKNOWN';
    });
};

const contentSlice = createSlice({
  name: 'content',
  initialState: {
    teachers: createCollection(),
    groups: createCollection(),
    testimonials: createCollection(),
    faq: createCollection(),
    stats: { data: null, status: 'idle', error: null },
  },
  reducers: {},
  extraReducers: (builder) => {
    applyCollectionReducers(builder, fetchTeachers, 'teachers');
    applyCollectionReducers(builder, fetchGroups, 'groups');
    applyCollectionReducers(builder, fetchTestimonials, 'testimonials');
    applyCollectionReducers(builder, fetchFaq, 'faq');
    builder
      .addCase(fetchStats.pending, (state) => {
        state.stats.status = 'loading';
        state.stats.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats.status = 'succeeded';
        state.stats.data = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.stats.status = 'failed';
        state.stats.error = action.payload?.code || 'UNKNOWN';
      });
  },
});

export default contentSlice.reducer;
