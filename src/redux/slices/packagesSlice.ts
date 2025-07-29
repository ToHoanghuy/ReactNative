import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Package } from '../../api/packageApi';

export interface PackageItem extends Package {
  backgroundColor: [string, string]; 
  features?: string[]; 
}

interface PackagesState {
  items: PackageItem[];
  loading: boolean;
  error: string | null;
}

const initialState: PackagesState = {
  items: [],
  loading: false,
  error: null,
};

export const extractFeatures = (description: string): string[] => {
  const includesPattern = /(Gói (?:Standard|Premium) Bao Gồm|The (?:Standard|Premium) Package Includes):([\s\S]*?)(?:\n\n|\n[A-Z]|\nVới Gói|With the)/i;
  const match = description.match(includesPattern);
  
  if (match && match[2]) {
    return match[2]
      .split(/\n/)
      .map(line => line.trim())
      .filter(line => line.startsWith('*') || line.startsWith('•') || line.startsWith('-') || /^\d+\./.test(line) || line.startsWith('Huyết áp') || line.startsWith('Blood Pressure'))
      .map(line => line.replace(/^[*•\-]\s*/, '').replace(/^\d+\.\s*/, ''))
      .filter(line => line.length > 0);
  }
  
  return description
    .split(/\n/)
    .map(line => line.trim())
    .filter(line => (line.startsWith('*') || line.startsWith('•') || line.startsWith('-')) && line.length > 3)
    .map(line => line.replace(/^[*•\-]\s*/, ''))
    .filter(line => line.length > 0);
};

export const getBackgroundColors = (type: 'standard' | 'premium'): [string, string] => {
  return type === 'standard' 
    ? ['#4C9EEB', '#2E78E4'] 
    : ['#9B59B6', '#8E44AD'];
};

const packagesSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {
    setPackages: (state, action: PayloadAction<PackageItem[]>) => {
      state.items = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setPackages, setLoading, setError } = packagesSlice.actions;
export default packagesSlice.reducer;
