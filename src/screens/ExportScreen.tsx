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
  Icon,
} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { TextInput, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootState } from '../store';
import { RootStackParamList } from '../navigation/AppNavigator';
import { saveInvoice } from '../store/invoicesSlice';
import { clearCurrentInvoice } from '../store/invoiceSlice';
import { StorageService } from '../services/storageService';
import { generateAndShareExcel } from '../utils/excelUtils';
import { generateInvoiceTitle } from '../utils/invoiceUtils';
import { Invoice } from '../types';
import { useTheme } from '../contexts/ThemeContext';

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

type ExportNavigationProp = NavigationProp<RootStackParamList, 'Export'>;

export const ExportScreen: React.FC = () => {
  const navigation = useNavigation<ExportNavigationProp>();
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
      
      // Generate a more unique ID to avoid collisions
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${invoice.invoiceNumber}`;
      
      // Deep copy all data to prevent reference pollution
      const invoiceToSave: Invoice = {
        id: uniqueId,
        invoiceNumber: invoice.invoiceNumber,
        employee: JSON.parse(JSON.stringify(employee)),
        company: JSON.parse(JSON.stringify(company)),
        startDate: invoice.startDate,
        endDate: invoice.endDate,
        items: JSON.parse(JSON.stringify(invoice.items)),
        totalAmount: invoice.totalAmount,
        createdAt: new Date().toISOString(),
      };

      console.log('=== SAVING INVOICE ===');
      console.log('Invoice ID:', uniqueId);
      console.log('Invoice Number:', invoice.invoiceNumber);
      console.log('Items count:', invoice.items.length);
      console.log('Items data:', JSON.stringify(invoice.items, null, 2));
      console.log('Current Redux state before save:', JSON.stringify({
        invoiceNumber: invoice.invoiceNumber,
        startDate: invoice.startDate,
        endDate: invoice.endDate,
        totalAmount: invoice.totalAmount,
        lastId: invoice.lastId
      }));

      // Save to Redux store
      dispatch(saveInvoice(invoiceToSave));
      
      // Save to AsyncStorage
      const currentInvoices = await StorageService.getInvoices();
      console.log('Current invoices count before saving:', currentInvoices.length);
      
      const updatedInvoices = [...currentInvoices, invoiceToSave];
      console.log('Updated invoices count after adding new:', updatedInvoices.length);
      
      await StorageService.saveInvoices(updatedInvoices);
      console.log('Invoice successfully saved to AsyncStorage');
      console.log('All saved invoices after save:', JSON.stringify(updatedInvoices.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        itemCount: inv.items.length,
        items: inv.items.map(item => ({ id: item.id, date: item.date, description: item.description, amount: item.amount }))
      })), null, 2));
      
      toast.show({
        title: 'Invoice saved',
        description: `"${invoiceTitle}" has been saved successfully`,
        status: 'success',
      });
      
      // Clear current invoice state completely
      console.log('=== CLEARING CURRENT INVOICE ===');
      console.log('Redux state before clear:', JSON.stringify({
        invoiceNumber: invoice.invoiceNumber,
        itemCount: invoice.items.length,
        lastId: invoice.lastId
      }));
      
      dispatch(clearCurrentInvoice());
      setInvoiceTitle('');
      
      console.log('Invoice cleared successfully');
      
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

  // Navigation functions
  const handleNavigateToHome = () => {
    navigation.navigate('Home');
  };

  const handleNavigateToHistory = () => {
    navigation.navigate('InvoicesHistory');
  };

  const handleNavigateToDetails = () => {
    navigation.navigate('Details');
  };

  const handleNavigateToSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <Box flex={1} bg="gray.50">
      <ScrollView flex={1}>
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

      {/* Bottom Navigation Bar */}
    <Box
      bg="surface.50"
      shadow={5}
      safeAreaBottom
      borderTopWidth={1}
      borderTopColor="gray.200"
    >
      <HStack justifyContent="space-around" alignItems="center" py={2}>
        <Button
          variant="ghost"
          size="sm"
          flex={1}
          onPress={handleNavigateToHistory}
          leftIcon={<Icon as={MaterialIcons} name="history" size="sm" />}
          _text={{ fontSize: "xs" }}
        >
          History
        </Button>
        
        <Button
          variant="ghost" 
          size="sm"
          flex={1}
          onPress={handleNavigateToHome}
          leftIcon={<Icon as={MaterialIcons} name="home" size="sm" />}
          _text={{ fontSize: "xs" }}
        >
          Home
        </Button>
        
        <Button
          variant="ghost"
          size="sm" 
          flex={1}
          onPress={handleNavigateToDetails}
          leftIcon={<Icon as={MaterialIcons} name="description" size="sm" />}
          _text={{ fontSize: "xs" }}
        >
          Details
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          flex={1}
          onPress={() => {}} // Already on export
          leftIcon={<Icon as={MaterialIcons} name="file-download" size="sm" />}
          _text={{ fontSize: "xs", fontWeight: "bold" }}
          colorScheme="blue"
        >
          Export
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          flex={1}
          onPress={handleNavigateToSettings}
          leftIcon={<Icon as={MaterialIcons} name="settings" size="sm" />}
          _text={{ fontSize: "xs" }}
        >
          Settings
        </Button>
      </HStack>
      </Box>
    </Box>
  );
};