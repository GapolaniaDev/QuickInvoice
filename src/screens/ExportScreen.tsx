import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ScrollView,
  useToast,
  FormControl,
  Divider,
  Spinner,
} from 'native-base';
import { TextInput, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { saveInvoice } from '../store/invoicesSlice';
import { clearCurrentInvoice } from '../store/invoiceSlice';
import { StorageService } from '../services/storageService';
import { generateAndShareExcel } from '../utils/excelUtils';
import { generateInvoiceTitle } from '../utils/invoiceUtils';
import { Invoice } from '../types';

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    minHeight: 40,
    color: '#000000',
  },
});

export const ExportScreen: React.FC = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  
  const { employee, company, invoice } = useSelector((state: RootState) => state);
  
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [invoiceTitle, setInvoiceTitle] = useState('');

  // Auto-generate invoice title when component mounts or data changes
  useEffect(() => {
    if (employee.name && employee.lastname && invoice.startDate && invoice.endDate) {
      const autoTitle = generateInvoiceTitle(
        employee.name,
        employee.lastname,
        invoice.startDate,
        invoice.endDate
      );
      setInvoiceTitle(autoTitle);
    }
  }, [employee.name, employee.lastname, invoice.startDate, invoice.endDate]);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      
      await generateAndShareExcel(
        employee,
        company,
        invoice.items,
        invoice.startDate,
        invoice.endDate,
        invoice.invoiceNumber,
        invoice.totalAmount
      );
      
      toast.show({
        title: 'Excel generated successfully',
        status: 'success',
      });
      
    } catch (error) {
      console.error('Export error:', error);
      toast.show({
        title: 'Export failed',
        description: 'Failed to generate Excel file',
        status: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveInvoice = async () => {
    if (!invoiceTitle.trim()) {
      toast.show({
        title: 'Title required',
        description: 'Please enter a title for this invoice',
        status: 'warning',
      });
      return;
    }

    try {
      setIsSaving(true);
      
      const invoiceToSave: Invoice = {
        id: `${Date.now()}-${invoice.invoiceNumber}`,
        invoiceNumber: invoice.invoiceNumber,
        employee: { ...employee },
        company: { ...company },
        startDate: invoice.startDate,
        endDate: invoice.endDate,
        items: [...invoice.items],
        totalAmount: invoice.totalAmount,
        createdAt: new Date().toISOString(),
      };

      // Save to Redux store
      dispatch(saveInvoice(invoiceToSave));
      
      // Save to AsyncStorage
      const currentInvoices = await StorageService.getInvoices();
      const updatedInvoices = [...currentInvoices, invoiceToSave];
      await StorageService.saveInvoices(updatedInvoices);
      
      toast.show({
        title: 'Invoice saved',
        description: `"${invoiceTitle}" has been saved successfully`,
        status: 'success',
      });
      
      // Clear current invoice
      dispatch(clearCurrentInvoice());
      setInvoiceTitle('');
      
    } catch (error) {
      console.error('Save error:', error);
      toast.show({
        title: 'Save failed',
        description: 'Failed to save invoice',
        status: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView flex={1} bg="gray.50">
      <VStack space={4} p={4}>
        {/* Invoice Summary */}
        <Box bg="blue.500" rounded="lg" p={4} shadow={2}>
          <VStack space={2}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text color="white" fontSize="xl" fontWeight="bold">
                Invoice #{invoice.invoiceNumber}
              </Text>
              <Text color="white" fontSize="2xl" fontWeight="bold">
                ${invoice.totalAmount}
              </Text>
            </HStack>
            
            <Text color="blue.100" fontSize="md">
              {invoice.startDate && invoice.endDate && 
                `${formatDate(invoice.startDate)} - ${formatDate(invoice.endDate)}`
              }
            </Text>
            
            <Text color="blue.100" fontSize="sm">
              {invoice.items.length} items
            </Text>
          </VStack>
        </Box>

        {/* Employee Information */}
        <Box bg="white" rounded="lg" p={4} shadow={2}>
          <VStack space={2}>
            <Text fontSize="lg" fontWeight="bold" color="gray.700">
              From
            </Text>
            <Text fontSize="md">{employee.name} {employee.lastname}</Text>
            <Text fontSize="sm" color="gray.600">ABN: {employee.abn}</Text>
            <Text fontSize="sm" color="gray.600">BSB: {employee.bsb} | ACC: {employee.acc}</Text>
            <Text fontSize="sm" color="gray.600">{employee.address}</Text>
          </VStack>
        </Box>

        {/* Company Information */}
        <Box bg="white" rounded="lg" p={4} shadow={2}>
          <VStack space={2}>
            <Text fontSize="lg" fontWeight="bold" color="gray.700">
              To
            </Text>
            <Text fontSize="md">{company.name}</Text>
            <Text fontSize="sm" color="gray.600">{company.address}</Text>
            <Text fontSize="sm" color="gray.600">
              {company.city}, {company.stateA} {company.postcode}
            </Text>
          </VStack>
        </Box>

        {/* Items Preview */}
        <Box bg="white" rounded="lg" p={4} shadow={2}>
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="bold" color="gray.700">
              Items ({invoice.items.length})
            </Text>
            
            {invoice.items.slice(0, 3).map((item, index) => (
              <VStack key={item.id || index} space={1}>
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack flex={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      {item.date} - {item.description}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {item.room}
                    </Text>
                  </VStack>
                  <Text fontSize="sm" fontWeight="bold" color="green.600">
                    ${item.amount}
                  </Text>
                </HStack>
                {index < Math.min(invoice.items.length, 3) - 1 && <Divider />}
              </VStack>
            ))}
            
            {invoice.items.length > 3 && (
              <Text fontSize="sm" color="gray.500" textAlign="center">
                ... and {invoice.items.length - 3} more items
              </Text>
            )}
          </VStack>
        </Box>

        {/* Save Invoice Section */}
        <Box bg="white" rounded="lg" p={4} shadow={2}>
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="bold" color="gray.700">
              Save Invoice
            </Text>
            
            <FormControl>
              <FormControl.Label>Invoice Title</FormControl.Label>
              <VStack space={2}>
                <TextInput
                  style={styles.input}
                  value={invoiceTitle}
                  onChangeText={setInvoiceTitle}
                  placeholder="Enter a title for this invoice"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  onPress={() => {
                    if (employee.name && employee.lastname && invoice.startDate && invoice.endDate) {
                      const autoTitle = generateInvoiceTitle(
                        employee.name,
                        employee.lastname,
                        invoice.startDate,
                        invoice.endDate
                      );
                      setInvoiceTitle(autoTitle);
                    }
                  }}
                  isDisabled={!employee.name || !employee.lastname || !invoice.startDate || !invoice.endDate}
                >
                  Auto-generate Title
                </Button>
              </VStack>
            </FormControl>
            
            <Button
              colorScheme="green"
              size="lg"
              onPress={handleSaveInvoice}
              isDisabled={isSaving || !invoiceTitle.trim()}
              isLoading={isSaving}
              loadingText="Saving..."
            >
              Save Invoice
            </Button>
          </VStack>
        </Box>

        {/* Export Section */}
        <Box bg="white" rounded="lg" p={4} shadow={2}>
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="bold" color="gray.700">
              Export Options
            </Text>
            
            <Button
              colorScheme="blue"
              size="lg"
              onPress={handleExportExcel}
              isDisabled={isExporting || invoice.items.length === 0}
              isLoading={isExporting}
              loadingText="Generating Excel..."
            >
              Export to Excel
            </Button>
            
            {invoice.items.length === 0 && (
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Add items to enable export
              </Text>
            )}
          </VStack>
        </Box>
      </VStack>
    </ScrollView>
  );
};