import AsyncStorage from '@react-native-async-storage/async-storage';
import { Employee, Company, Invoice } from '../types';
import { 
  DEFAULT_EMPLOYEE_DATA, 
  DEFAULT_COMPANY_DATA, 
  DEFAULT_CLEANING_SELECTIONS 
} from '../config/defaultData';

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
      return data ? JSON.parse(data) : DEFAULT_EMPLOYEE_DATA;
    } catch (error) {
      console.error('Error getting employee data:', error);
      return DEFAULT_EMPLOYEE_DATA;
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
      return data ? JSON.parse(data) : DEFAULT_COMPANY_DATA;
    } catch (error) {
      console.error('Error getting company data:', error);
      return DEFAULT_COMPANY_DATA;
    }
  },

  // Invoices
  async saveInvoices(invoices: Invoice[]): Promise<void> {
    try {
      console.log('=== STORAGE SERVICE SAVE ===');
      console.log('Saving invoices count:', invoices.length);
      console.log('Invoice summaries being saved:', invoices.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        itemCount: inv.items.length,
        totalAmount: inv.totalAmount,
        itemSummary: inv.items.map(item => ({ id: item.id, date: item.date, description: item.description, amount: item.amount }))
      })));
      
      const jsonData = JSON.stringify(invoices);
      await AsyncStorage.setItem(KEYS.INVOICES, jsonData);
      console.log('Successfully saved to AsyncStorage');
    } catch (error) {
      console.error('Error saving invoices:', error);
      throw error;
    }
  },

  async getInvoices(): Promise<Invoice[]> {
    try {
      console.log('=== STORAGE SERVICE LOAD ===');
      const data = await AsyncStorage.getItem(KEYS.INVOICES);
      
      if (!data) {
        console.log('No saved invoices found');
        return [];
      }
      
      const invoices = JSON.parse(data);
      console.log('Loaded invoices count:', invoices.length);
      console.log('Invoice summaries loaded:', invoices.map((inv: Invoice) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        itemCount: inv.items.length,
        totalAmount: inv.totalAmount,
        itemSummary: inv.items.map((item: any) => ({ id: item.id, date: item.date, description: item.description, amount: item.amount }))
      })));
      
      return invoices;
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
      return data ? JSON.parse(data) : DEFAULT_CLEANING_SELECTIONS;
    } catch (error) {
      console.error('Error getting cleaning selections:', error);
      return DEFAULT_CLEANING_SELECTIONS;
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