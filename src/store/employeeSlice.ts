import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Employee } from '../types';

const initialState: Employee = {
  id: 1,
  email: '',
  name: 'Angie Katherine',
  lastname: 'Fierro Rojas',
  birthdate: '',
  address: '128 Gorge RD Newton',
  phone: '',
  abn: '34632148828',
  tax: '',
  bsb: '062033',
  acc: '010999518',
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    setEmployee: (state, action: PayloadAction<Partial<Employee>>) => {
      return { ...state, ...action.payload };
    },
    setEmployeeField: (state, action: PayloadAction<{ field: keyof Employee; value: string | number }>) => {
      const { field, value } = action.payload;
      (state as any)[field] = value;
    },
  },
});

export const { setEmployee, setEmployeeField } = employeeSlice.actions;
export default employeeSlice.reducer;