import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Invoice } from '../types';

interface InvoicesState {
  savedInvoices: Invoice[];
}

const initialState: InvoicesState = {
  savedInvoices: [],
};

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    saveInvoice: (state, action: PayloadAction<Invoice>) => {
      const existingIndex = state.savedInvoices.findIndex(
        invoice => invoice.id === action.payload.id
      );
      
      if (existingIndex !== -1) {
        state.savedInvoices[existingIndex] = action.payload;
      } else {
        state.savedInvoices.push(action.payload);
      }
    },
    deleteInvoice: (state, action: PayloadAction<string>) => {
      state.savedInvoices = state.savedInvoices.filter(
        invoice => invoice.id !== action.payload
      );
    },
    loadInvoices: (state, action: PayloadAction<Invoice[]>) => {
      state.savedInvoices = action.payload;
    },
  },
});

export const { saveInvoice, deleteInvoice, loadInvoices } = invoicesSlice.actions;
export default invoicesSlice.reducer;