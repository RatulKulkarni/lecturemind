import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  lastUploadedId: string | null;
}

const initialState: UploadState = {
  uploading: false,
  progress: 0,
  error: null,
  lastUploadedId: null,
};

export const uploadSingleLecture = createAsyncThunk<string, { unitId: string; title: string; file: File }>(
  'upload/single',
  async ({ unitId, title, file }, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('unitId', unitId);
      formData.append('title', title);

      const res = await api.post('/video/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
          dispatch(setProgress(pct));
        },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Upload failed');
    }
  }
);

export const uploadSplitLecture = createAsyncThunk<
  string,
  { currentUnitId: string; nextUnitId: string; splitTime: string; titlePart1: string; titlePart2: string; file: File }
>(
  'upload/split',
  async ({ file, ...params }, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(params).forEach(([key, val]) => formData.append(key, val));

      const res = await api.post('/video/upload/split', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
          dispatch(setProgress(pct));
        },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Upload failed');
    }
  }
);

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    setProgress(state, action) {
      state.progress = action.payload;
    },
    resetUpload(state) {
      state.uploading = false;
      state.progress = 0;
      state.error = null;
      state.lastUploadedId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadSingleLecture.pending, (state) => {
        state.uploading = true;
        state.progress = 0;
        state.error = null;
      })
      .addCase(uploadSingleLecture.fulfilled, (state, action) => {
        state.uploading = false;
        state.progress = 100;
        state.lastUploadedId = action.payload;
      })
      .addCase(uploadSingleLecture.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadSplitLecture.pending, (state) => {
        state.uploading = true;
        state.progress = 0;
        state.error = null;
      })
      .addCase(uploadSplitLecture.fulfilled, (state, action) => {
        state.uploading = false;
        state.progress = 100;
        state.lastUploadedId = action.payload;
      })
      .addCase(uploadSplitLecture.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setProgress, resetUpload } = uploadSlice.actions;
export default uploadSlice.reducer;
