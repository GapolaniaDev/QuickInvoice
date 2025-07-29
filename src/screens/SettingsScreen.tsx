import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ScrollView,
  useToast,
  AlertDialog,
  Divider,
  Badge,
} from 'native-base';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { StorageService } from '../services/storageService';
import { clearCurrentInvoice } from '../store/invoiceSlice';
import { loadInvoices } from '../store/invoicesSlice';

export const SettingsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  
  const { employee, company, invoice, invoices } = useSelector((state: RootState) => state);
  
  const [showClearDataAlert, setShowClearDataAlert] = React.useState(false);
  const [showClearCurrentAlert, setShowClearCurrentAlert] = React.useState(false);

  const handleClearCurrentInvoice = () => {
    dispatch(clearCurrentInvoice());
    setShowClearCurrentAlert(false);
    
    toast.show({
      title: 'Current invoice cleared',
      status: 'success',
    });
  };

  const handleClearAllData = async () => {
    try {
      await StorageService.clearAllData();
      dispatch(clearCurrentInvoice());
      dispatch(loadInvoices([]));
      
      setShowClearDataAlert(false);
      
      toast.show({
        title: 'All data cleared',
        description: 'All stored data has been removed',
        status: 'success',
      });
      
    } catch (error) {
      toast.show({
        title: 'Error clearing data',
        status: 'error',
      });
    }
  };

  const getStorageInfo = () => {
    return {
      currentInvoiceItems: invoice.items.length,
      savedInvoices: invoices.savedInvoices.length,
      totalInvoiceValue: invoices.savedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      employeeName: `${employee.name} ${employee.lastname}`,
      companyName: company.name,
    };
  };

  const info = getStorageInfo();

  return (
    <ScrollView flex={1} bg="gray.50">
      <VStack space={4} p={4}>
        {/* App Info */}
        <Box bg="white" rounded="lg" p={4} shadow={2}>
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="bold" color="blue.600">
              Quick Invoice
            </Text>
            <Text fontSize="sm" color="gray.600">
              Version 1.0.0
            </Text>
            <Text fontSize="sm" color="gray.500">
              Invoice generation and management app
            </Text>
          </VStack>
        </Box>

        {/* Storage Summary */}
        <Box bg="white" rounded="lg" p={4} shadow={2}>
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="bold" color="gray.700">
              Data Summary
            </Text>
            
            <VStack space={2}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="sm">Current Invoice Items</Text>
                <Badge colorScheme="blue" rounded="full">
                  {info.currentInvoiceItems}
                </Badge>
              </HStack>
              
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="sm">Saved Invoices</Text>
                <Badge colorScheme="green" rounded="full">
                  {info.savedInvoices}
                </Badge>
              </HStack>
              
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="sm">Total Invoice Value</Text>
                <Badge colorScheme="emerald" rounded="full">
                  ${info.totalInvoiceValue.toFixed(2)}
                </Badge>
              </HStack>
            </VStack>
            
            <Divider />
            
            <VStack space={1}>
              <Text fontSize="sm" color="gray.600">
                Employee: {info.employeeName}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Company: {info.companyName}
              </Text>
            </VStack>
          </VStack>
        </Box>

        {/* Current Invoice Actions */}
        <Box bg="white" rounded="lg" p={4} shadow={2}>
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="bold" color="gray.700">
              Current Invoice
            </Text>
            
            <Text fontSize="sm" color="gray.600">
              Manage your current invoice data
            </Text>
            
            <Button
              colorScheme="orange"
              variant="outline"
              onPress={() => setShowClearCurrentAlert(true)}
              isDisabled={invoice.items.length === 0}
            >
              Clear Current Invoice
            </Button>
            
            {invoice.items.length === 0 && (
              <Text fontSize="xs" color="gray.400" textAlign="center">
                No current invoice to clear
              </Text>
            )}
          </VStack>
        </Box>

        {/* Data Management */}
        <Box bg="white" rounded="lg" p={4} shadow={2}>
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="bold" color="gray.700">
              Data Management
            </Text>
            
            <Text fontSize="sm" color="gray.600">
              Manage all stored application data
            </Text>
            
            <Button
              colorScheme="red"
              variant="outline"
              onPress={() => setShowClearDataAlert(true)}
            >
              Clear All Data
            </Button>
            
            <Text fontSize="xs" color="red.500" textAlign="center">
              ⚠️ This will delete all saved invoices, employee data, and company data
            </Text>
          </VStack>
        </Box>

        {/* Help & Support */}
        <Box bg="white" rounded="lg" p={4} shadow={2}>
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="bold" color="gray.700">
              Help & Support
            </Text>
            
            <VStack space={2}>
              <Text fontSize="sm" color="gray.600">
                • Create invoices by setting dates and selecting cleaning types
              </Text>
              <Text fontSize="sm" color="gray.600">
                • Edit individual invoice items in the Details screen
              </Text>
              <Text fontSize="sm" color="gray.600">
                • Export invoices to Excel format for sharing
              </Text>
              <Text fontSize="sm" color="gray.600">
                • Save invoices to review later in the History screen
              </Text>
              <Text fontSize="sm" color="gray.600">
                • Customize employee and company information
              </Text>
            </VStack>
          </VStack>
        </Box>
      </VStack>

      {/* Clear Current Invoice Alert */}
      <AlertDialog isOpen={showClearCurrentAlert} onClose={() => setShowClearCurrentAlert(false)}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Clear Current Invoice</AlertDialog.Header>
          <AlertDialog.Body>
            Are you sure you want to clear the current invoice? 
            All unsaved items will be lost.
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={() => setShowClearCurrentAlert(false)}
              >
                Cancel
              </Button>
              <Button colorScheme="orange" onPress={handleClearCurrentInvoice}>
                Clear
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>

      {/* Clear All Data Alert */}
      <AlertDialog isOpen={showClearDataAlert} onClose={() => setShowClearDataAlert(false)}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Clear All Data</AlertDialog.Header>
          <AlertDialog.Body>
            ⚠️ This will permanently delete:
            {'\n'}• All saved invoices ({info.savedInvoices})
            {'\n'}• Current invoice items ({info.currentInvoiceItems})
            {'\n'}• Employee and company data
            {'\n'}• All application settings
            {'\n\n'}This action cannot be undone.
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={() => setShowClearDataAlert(false)}
              >
                Cancel
              </Button>
              <Button colorScheme="danger" onPress={handleClearAllData}>
                Delete All
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </ScrollView>
  );
};