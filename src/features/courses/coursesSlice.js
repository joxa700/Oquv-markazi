import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { publicApi, toPlainError } from '../../services/api';

export const fetchCourses = createAsyncThunk(
  'courses/fetchAll',
  async (lang, { rejectWithValue }) => {
    try {
      return { lang, items: await publicApi.getCourses(lang) };
    } catch (error) {
      return rejectWithValue(toPlainError(error));
    }
  },
);

export const fetchCourse = createAsyncThunk(
  'courses/fetchOne',
  async ({ slug, lang }, { rejectWithValue }) => {
    try {
      return { lang, course: await publicApi.getCourse(slug, lang) };
    } catch (error) {
      return rejectWithValue(toPlainError(error));
    }
  },
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState: {
    items: [],
    lang: null,
    status: 'idle',
    error: null,
    current: null,
    currentSlug: null,
    detailStatus: 'idle',
    detailError: null,
  },
  reducers: {
    resetCourseDetail(state) {
      state.current = null;
      state.currentSlug = null;
      state.detailStatus = 'idle';
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.lang = action.payload.lang;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.code || 'UNKNOWN';
      })
      .addCase(fetchCourse.pending, (state, action) => {
        state.detailStatus = 'loading';
        state.detailError = null;
        state.current = null;
        state.currentSlug = action.meta.arg.slug;
      })
      .addCase(fetchCourse.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.current = action.payload.course;
        state.currentSlug = action.payload.course.slug;
      })
      .addCase(fetchCourse.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.detailError = action.payload?.code || 'UNKNOWN';
        state.current = null;
      });
  },
});

export const { resetCourseDetail } = coursesSlice.actions;
export default coursesSlice.reducer;
