import * as XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { Employee, Company, InvoiceItem } from '../types';
import { formatDateForExcel } from './invoiceUtils';

export interface ExcelConfig {
  INFO_COMPANY_START: number;
  TITTLE_START: number;
  TABLE_HEADER_START_NUMBER: number;
  TABLE_HEADER_COLUMNS_START_NUMBER: number;
  TABLE_BODY_START_NUMBER: number;
}

export const EXCEL_CONFIG: ExcelConfig = {
  INFO_COMPANY_START: 10,
  TITTLE_START: 8,
  TABLE_HEADER_START_NUMBER: 15,
  TABLE_HEADER_COLUMNS_START_NUMBER: 16,
  TABLE_BODY_START_NUMBER: 17,
};

export async function generateAndShareExcel(
  employee: Employee,
  company: Company,
  items: InvoiceItem[],
  startDate: string,
  endDate: string,
  invoiceNumber: number,
  totalAmount: number
): Promise<void> {
  try {
    // Crear workbook
    const workbook = XLSX.utils.book_new();
    
    // Crear worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([]);
    
    // Agregar datos del empleado
    XLSX.utils.sheet_add_aoa(worksheet, [
      [`Name: ${employee.name} ${employee.lastname}`, '', '', '', '', '', '', `Invoice: ${invoiceNumber}`],
      [`ABN: ${employee.abn}`, '', '', '', '', '', '', `Date: ${startDate} to ${endDate}`],
      [`BSB: ${employee.bsb}`, '', '', '', '', '', '', ''],
      [`ACC: ${employee.acc}`, '', '', '', '', '', '', ''],
      [`Address: ${employee.address}`, '', '', '', '', '', '', ''],
      ['', '', '', '', '', 'Tax Invoice', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      [company.name, '', '', '', '', '', company.address],
      [company.address, '', '', '', '', '', ''],
      [company.city, '', '', '', '', '', ''],
      [company.stateA, '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['Unilodge', '', '', '', '', '', company.address],
      ['DATE', '', 'ROOM NUMBER AND TYPE', '', '', '', '', 'DESCRIPTION', '', '', '', 'TIME', 'AMOUNT']
    ], { origin: 'A1' });

    // Agregar items
    const startRow = EXCEL_CONFIG.TABLE_BODY_START_NUMBER;
    items.forEach((item, index) => {
      const row = startRow + index;
      XLSX.utils.sheet_add_aoa(worksheet, [
        [item.date, '', item.room, '', '', '', '', item.description, '', '', '', '', item.amount]
      ], { origin: `A${row}` });
    });

    // Agregar total
    const totalRow = startRow + items.length;
    XLSX.utils.sheet_add_aoa(worksheet, [
      ['', '', '', '', '', '', '', '', '', '', '', 'Total', totalAmount]
    ], { origin: `A${totalRow}` });

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, `Invoice ${invoiceNumber}`);

    // Convertir a base64 (compatible con React Native)
    const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
    
    // Crear archivo temporal
    const { formattedStartDate, formattedEndDate } = formatDateForExcel(startDate, endDate);
    const fileName = `Invoice_${employee.name}_${employee.lastname}_${formattedStartDate}_to_${formattedEndDate}.xlsx`;
    const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    
    // Escribir archivo en base64
    await RNFS.writeFile(filePath, wbout, 'base64');
    
    // Compartir archivo
    const shareOptions = {
      title: 'Share Invoice',
      url: `file://${filePath}`,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    
    await Share.open(shareOptions);
    
  } catch (error) {
    console.error('Error generating Excel:', error);
    throw error;
  }
}