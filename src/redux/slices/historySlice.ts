import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { saveHistoryData } from '../../utils/storage';

export interface ScanItem {
  id: string;
  createdAt: string;
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

export interface HistoryItem {
  _id: string; // Date in format YYYY-MM-DD
  count: number;
  data: ScanItem[];
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
      // Check if an item with the same date (_id) exists
      const existingIndex = state.items.findIndex(item => item._id === action.payload._id);
      if (existingIndex === -1) {
        // Add new item if no item exists for this day
        state.items.unshift(action.payload);
      } else {
        // Update existing item with new data
        state.items[existingIndex] = action.payload;
      }
      
      // Persist to AsyncStorage
      saveHistoryData(state.items);
    },
    // Add a scan item to a specific date
    addScanToDate: (state, action: PayloadAction<{dateId: string, scans: ScanItem[]}>) => {
      const { dateId, scans } = action.payload;
      const existingIndex = state.items.findIndex(item => item._id === dateId);
      
      if (existingIndex === -1) {
        // Create new history item if no item exists for this day
        state.items.unshift({
          _id: dateId,
          count: scans.length,
          data: scans
        });
      } else {
        // Update existing date entry with all scans
        state.items[existingIndex].data = scans;
        state.items[existingIndex].count = scans.length;
      }
      
      // Persist to AsyncStorage
      saveHistoryData(state.items);
    },
    updateHistoryItem: (state, action: PayloadAction<HistoryItem>) => {
      // Check if an item with the same date (_id) exists
      const existingIndex = state.items.findIndex(item => item._id === action.payload._id);
      
      if (existingIndex === -1) {
        // Add new item if no item exists for this day
        state.items.unshift(action.payload);
      } else {
        // Update the existing item
        state.items[existingIndex] = action.payload;
      }
      
      // Persist to AsyncStorage
      saveHistoryData(state.items);
    },
    setFilterDate: (state, action: PayloadAction<string | null>) => {
      state.filterDate = action.payload;
    },
    clearHistory: (state) => {
      state.items = [];
      state.filterDate = null;
      state.isLoading = false;
    },

  },
});

export const {
  setLoading,
  setHistoryItems,
  addHistoryItem,
  addScanToDate,
  updateHistoryItem,
  setFilterDate,
  clearHistory,
} = historySlice.actions;
export default historySlice.reducer;
