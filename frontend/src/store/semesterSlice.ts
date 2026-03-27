import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';
import type { SemesterResponse, SemesterRequest, Semester, UnitSequenceChange } from '../types';

interface SemesterState {
  current: SemesterResponse | null;
  loading: boolean;
  creating: boolean;
  error: string | null;
}

const initialState: SemesterState = {
  current: null,
  loading: false,
  creating: false,
  error: null,
};

export const fetchSemester = createAsyncThunk<SemesterResponse>(
  'semester/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<SemesterResponse>('/semester/getsemester');
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to fetch semester');
    }
  }
);

export const createSemester = createAsyncThunk<Semester, SemesterRequest>(
  'semester/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post<Semester>('/semester/create', data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to create semester');
    }
  }
);

export const updateUnitSequence = createAsyncThunk<void, UnitSequenceChange>(
  'semester/updateUnitSequence',
  async (data, { rejectWithValue }) => {
    try {
      await api.put('/semester/update/sequence', data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to update sequence');
    }
  }
);

const semesterSlice = createSlice({
  name: 'semester',
  initialState,
  reducers: {
    clearSemester(state) {
      state.current = null;
    },
    reorderUnits(state, action) {
      if (state.current) {
        state.current.units = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSemester.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSemester.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchSemester.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createSemester.pending, (state) => {
        state.creating = true;
      })
      .addCase(createSemester.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createSemester.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSemester, reorderUnits } = semesterSlice.actions;
export default semesterSlice.reducer;
