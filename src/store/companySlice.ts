import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Company } from '../types';

const initialState: Company = {
  id: null,
  name: 'Corporate Clean Property Services',
  address: '128 Waymouth St',
  phone: '',
  postcode: '5000',
  city: 'Adelaide',
  stateA: 'SA',
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCompany: (state, action: PayloadAction<Partial<Company>>) => {
      return { ...state, ...action.payload };
    },
    setCompanyField: (state, action: PayloadAction<{ field: keyof Company; value: string | number | null }>) => {
      const { field, value } = action.payload;
      (state as any)[field] = value;
    },
  },
});

export const { setCompany, setCompanyField } = companySlice.actions;
export default companySlice.reducer;