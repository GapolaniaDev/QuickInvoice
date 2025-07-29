import AsyncStorage from '@react-native-async-storage/async-storage';
import { Employee, Company, Invoice } from '../types';

const KEYS = {
  EMPLOYEE: 'employee_data',
  COMPANY: 'company_data',
  INVOICES: 'saved_invoices',
  CLEANING_SELECTIONS: 'cleaning_selections',
};

export const StorageService = {
  // Employee data
  async saveEmployeeData(employee: Employee): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.EMPLOYEE, JSON.stringify(employee));
    } catch (error) {
      console.error('Error saving employee data:', error);
      throw error;
    }
  },

  async getEmployeeData(): Promise<Employee | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.EMPLOYEE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting employee data:', error);
      return null;
    }
  },

  // Company data
  async saveCompanyData(company: Company): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.COMPANY, JSON.stringify(company));
    } catch (error) {
      console.error('Error saving company data:', error);
      throw error;
    }
  },

  async getCompanyData(): Promise<Company | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.COMPANY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting company data:', error);
      return null;
    }
  },

  // Invoices
  async saveInvoices(invoices: Invoice[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
    } catch (error) {
      console.error('Error saving invoices:', error);
      throw error;
    }
  },

  async getInvoices(): Promise<Invoice[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.INVOICES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting invoices:', error);
      return [];
    }
  },

  // Cleaning selections
  async saveCleaningSelections(selections: { kitchen: boolean; night: boolean }): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.CLEANING_SELECTIONS, JSON.stringify(selections));
    } catch (error) {
      console.error('Error saving cleaning selections:', error);
      throw error;
    }
  },

  async getCleaningSelections(): Promise<{ kitchen: boolean; night: boolean }> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CLEANING_SELECTIONS);
      return data ? JSON.parse(data) : { kitchen: false, night: true };
    } catch (error) {
      console.error('Error getting cleaning selections:', error);
      return { kitchen: false, night: true };
    }
  },

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  },
};