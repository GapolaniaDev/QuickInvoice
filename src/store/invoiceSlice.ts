import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InvoiceItem } from '../types';

interface InvoiceState {
  invoiceNumber: number;
  startDate: string;
  endDate: string;
  items: InvoiceItem[];
  totalAmount: number;
  lastId: number;
}

const initialState: InvoiceState = {
  invoiceNumber: 0,
  startDate: '',
  endDate: '',
  items: [],
  totalAmount: 0,
  lastId: 0,
};

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    setInvoiceNumber: (state, action: PayloadAction<number>) => {
      state.invoiceNumber = action.payload;
    },
    setStartDate: (state, action: PayloadAction<string>) => {
      state.startDate = action.payload;
    },
    setEndDate: (state, action: PayloadAction<string>) => {
      state.endDate = action.payload;
    },
    addOrUpdateItem: (state, action: PayloadAction<InvoiceItem>) => {
      const item = { ...action.payload };
      
      if (item.id === null || item.id === undefined) {
        // Ensure we have a unique ID
        state.lastId = state.lastId + 1;
        item.id = state.lastId;
        
        // Ensure the ID is truly unique (safety check)
        while (state.items.some(existingItem => existingItem.id === item.id)) {
          state.lastId = state.lastId + 1;
          item.id = state.lastId;
        }
        
        state.items.push(item);
        console.log(`Added new item with ID ${item.id}:`, item);
      } else {
        const index = state.items.findIndex(i => i.id === item.id);
        if (index !== -1) {
          state.items[index] = item;
          console.log(`Updated existing item with ID ${item.id}:`, item);
        } else {
          state.items.push(item);
          console.log(`Added item with existing ID ${item.id}:`, item);
        }
      }
    },
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    removeItemsByType: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.type !== action.payload);
    },
    calculateTotal: (state) => {
      state.totalAmount = state.items.reduce((total, item) => total + parseFloat(String(item.amount)), 0);
    },
    clearCurrentInvoice: (state) => {
      // Deep clear all state to prevent reference pollution
      state.invoiceNumber = 0;
      state.startDate = '';
      state.endDate = '';
      state.items = [];
      state.totalAmount = 0;
      state.lastId = 0;
    },
    setItems: (state, action: PayloadAction<InvoiceItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const {
  setInvoiceNumber,
  setStartDate,
  setEndDate,
  addOrUpdateItem,
  removeItem,
  removeItemsByType,
  calculateTotal,
  clearCurrentInvoice,
  setItems,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;