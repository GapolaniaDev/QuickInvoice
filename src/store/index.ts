import { configureStore } from '@reduxjs/toolkit';
import employeeReducer from './employeeSlice';
import companyReducer from './companySlice';
import invoiceReducer from './invoiceSlice';
import invoicesReducer from './invoicesSlice';

export const store = configureStore({
  reducer: {
    employee: employeeReducer,
    company: companyReducer,
    invoice: invoiceReducer,
    invoices: invoicesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;