export interface Employee {
  id: number;
  email: string;
  name: string;
  lastname: string;
  birthdate: string;
  address: string;
  phone: string;
  abn: string;
  tax: string;
  bsb: string;
  acc: string;
}

export interface Company {
  id: number | null;
  name: string;
  address: string;
  phone: string;
  postcode: string;
  city: string;
  stateA: string;
}

export interface InvoiceItem {
  id: number | null;
  date: string;
  room: string;
  type: string;
  description: string;
  time: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: number;
  employee: Employee;
  company: Company;
  startDate: string;
  endDate: string;
  items: InvoiceItem[];
  totalAmount: number;
  createdAt: string;
}

export interface AppState {
  employee: Employee;
  company: Company;
  currentInvoice: {
    invoiceNumber: number;
    startDate: string;
    endDate: string;
    items: InvoiceItem[];
    totalAmount: number;
    lastId: number;
  };
  savedInvoices: Invoice[];
}