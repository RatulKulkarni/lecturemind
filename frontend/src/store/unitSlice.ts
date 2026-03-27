import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';
import type { UnitResponse, UnitRequest, Unit, VideoSequenceChange } from '../types';

interface UnitState {
  current: UnitResponse | null;
  loading: boolean;
  creating: boolean;
  error: string | null;
}

const initialState: UnitState = {
  current: null,
  loading: false,
  creating: false,
  error: null,
};

export const fetchUnit = createAsyncThunk<UnitResponse, string>(
  'unit/fetch',
  async (unitId, { rejectWithValue }) => {
    try {
      const res = await api.get<UnitResponse>(`/unit/getunit/${unitId}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to fetch unit');
    }
  }
);

export const createUnit = createAsyncThunk<Unit, UnitRequest>(
  'unit/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post<Unit>('/unit/create', data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to create unit');
    }
  }
);

export const updateLectureSequence = createAsyncThunk<void, VideoSequenceChange>(
  'unit/updateLectureSequence',
  async (data, { rejectWithValue }) => {
    try {
      await api.put('/unit/update/sequence', data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to update sequence');
    }
  }
);

export const downloadNotes = createAsyncThunk<Blob, string>(
  'unit/downloadNotes',
  async (unitId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/unit/getnotes/${unitId}`, { responseType: 'blob' });
      return res.data;
    } catch (err: any) {
      return rejectWithValue('Failed to download notes');
    }
  }
);

export const downloadQuestionBank = createAsyncThunk<Blob, string>(
  'unit/downloadQuestionBank',
  async (unitId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/unit/getquestionbank/${unitId}`, { responseType: 'blob' });
      return res.data;
    } catch (err: any) {
      return rejectWithValue('Failed to download question bank');
    }
  }
);

const unitSlice = createSlice({
  name: 'unit',
  initialState,
  reducers: {
    clearUnit(state) {
      state.current = null;
    },
    reorderLectures(state, action) {
      if (state.current) {
        state.current.lectures = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnit.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchUnit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createUnit.pending, (state) => {
        state.creating = true;
      })
      .addCase(createUnit.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createUnit.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUnit, reorderLectures } = unitSlice.actions;
export default unitSlice.reducer;
