import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { saveHistoryData } from '../../utils/storage';

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
  bloodPressure?: string;
  bloodPressureUnit?: string;
  oxygenSaturation?: number;
  oxygenSaturationUnit?: string;
  stress?: number;
  stressUnit?: string;
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
      // Persist to AsyncStorage
      saveHistoryData(state.items);
    },
    addHistoryItem: (state, action: PayloadAction<HistoryItem>) => {
      // Kiểm tra xem item đã tồn tại chưa dựa trên ID
      const existingIndex = state.items.findIndex(item => item.id === action.payload.id);
      if (existingIndex === -1) {
        // Chỉ thêm nếu chưa tồn tại
        state.items.unshift(action.payload);
        // Persist to AsyncStorage
        saveHistoryData(state.items);
      }
    },
    setFilterDate: (state, action: PayloadAction<string | null>) => {
      state.filterDate = action.payload;
    },


  },
});

export const {
  setLoading,
  setHistoryItems,
  addHistoryItem,
  setFilterDate,
} = historySlice.actions;
export default historySlice.reducer;
