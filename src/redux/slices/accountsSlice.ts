import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Account {
  id: string;
  email: string;
  name: string;
  password: string;
}

interface AccountsState {
  accounts: Account[];
}

const initialState: AccountsState = {
  accounts: [],
};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    setAccounts: (state, action: PayloadAction<Account[]>) => {
      state.accounts = action.payload;
    },
    addAccount: (state, action: PayloadAction<Account>) => {
      state.accounts.push(action.payload);
    },
    updateAccount: (state, action: PayloadAction<{ id: string; updates: Partial<Account> }>) => {
      const index = state.accounts.findIndex(account => account.id === action.payload.id);
      if (index !== -1) {
        state.accounts[index] = { ...state.accounts[index], ...action.payload.updates };
      }
    },
    removeAccount: (state, action: PayloadAction<string>) => {
      state.accounts = state.accounts.filter(account => account.id !== action.payload);
    },
  },
});

export const { setAccounts, addAccount, updateAccount, removeAccount } = accountsSlice.actions;
export default accountsSlice.reducer;
