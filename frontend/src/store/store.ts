import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import authReducer from './authSlice';
import semesterReducer from './semesterSlice';
import unitReducer from './unitSlice';
import uploadReducer from './uploadSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    semester: semesterReducer,
    unit: unitReducer,
    upload: uploadReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export function useAppDispatch() {
  return useDispatch<AppDispatch>();
}

export function useAppSelector<T>(selector: (state: RootState) => T): T {
  return useSelector(selector);
}
