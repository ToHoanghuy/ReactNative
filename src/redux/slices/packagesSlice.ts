import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PackageItem {
  id: string;
  name: string;
  price: string;
  duration: string;
  description: string;
  features: string[];
  backgroundColor: [string, string]; // At least two colors required for LinearGradient
  type: 'standard' | 'premium'; // Add type to distinguish between standard and premium packages
}

interface PackagesState {
  items: PackageItem[];
}

const initialState: PackagesState = {
  items: [],
};

const packagesSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {
    setPackages: (state, action: PayloadAction<PackageItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const { setPackages } = packagesSlice.actions;
export default packagesSlice.reducer;
