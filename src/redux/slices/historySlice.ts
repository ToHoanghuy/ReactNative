import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HistoryItem {
  id: string;
  date: string;
  faceId: string;
  result: 'success' | 'failed';
  confidence: number;
  image?: string;
  wellnessScore?: number;
  breathingRate?: number;
  breathingRateUnit?: string;
  heartRate?: number;
  heartRateUnit?: string;
  stressLevel?: number;
  stressCategory?: string;
  heartRateVariability?: number;
  hrvUnit?: string;
}

interface HistoryState {
  items: HistoryItem[];
  filterDate: string | null;
  isLoading: boolean;
}

const initialState: HistoryState = {
  items: [],
  filterDate: null,
  isLoading: false,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setHistoryItems: (state, action: PayloadAction<HistoryItem[]>) => {
      state.items = action.payload;
    },
    addHistoryItem: (state, action: PayloadAction<HistoryItem>) => {
      state.items.unshift(action.payload);
    },
    setFilterDate: (state, action: PayloadAction<string | null>) => {
      state.filterDate = action.payload;
    },
    clearHistory: (state) => {
      state.items = [];
    },
  },
});

export const {
  setLoading,
  setHistoryItems,
  addHistoryItem,
  setFilterDate,
  clearHistory,
} = historySlice.actions;
export default historySlice.reducer;
