import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ScrollView,
  useToast,
  Modal,
  AlertDialog,
  Badge,
  Divider,
  Fab,
  Icon,
} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootState } from '../store';
import { RootStackParamList } from '../navigation/AppNavigator';
import { loadInvoices, deleteInvoice } from '../store/invoicesSlice';
import { StorageService } from '../services/storageService';
import { generateAndShareExcel } from '../utils/excelUtils';
import { Invoice } from '../types';
import { getDayOfWeek } from '../utils/invoiceUtils';
import { useTheme } from '../contexts/ThemeContext';

type InvoicesHistoryNavigationProp = NavigationProp<RootStackParamList, 'InvoicesHistory'>;

export const InvoicesHistoryScreen: React.FC = () => {
  const navigation = useNavigation<InvoicesHistoryNavigationProp>();
  const dispatch = useDispatch();
  const toast = useToast();
  const { isDarkMode } = useTheme();
  
  const { savedInvoices } = useSelector((state: RootState) => state.invoices);
  const { invoice } = useSelector((state: RootState) => state);
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadSavedInvoices();
  }, []);

  // Debug: Log Redux state changes
  useEffect(() => {
    console.log('Redux savedInvoices updated:', savedInvoices.length, savedInvoices);
  }, [savedInvoices]);

  const loadSavedInvoices = async () => {
    try {
      setIsLoading(true);
      const invoices = await StorageService.getInvoices();
      console.log('Loaded invoices from storage:', invoices.length);
      dispatch(loadInvoices(invoices));
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.show({
        title: 'Error loading invoices',
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvoicePress = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  const handleDeleteInvoice = async () => {
    if (!selectedInvoice) return;

    try {
      // Remove from Redux store
      dispatch(deleteInvoice(selectedInvoice.id));
      
      // Remove from AsyncStorage
      const updatedInvoices = savedInvoices.filter(inv => inv.id !== selectedInvoice.id);
      await StorageService.saveInvoices(updatedInvoices);
      
      toast.show({
        title: 'Invoice deleted',
        status: 'success',
      });
      
      setShowDeleteAlert(false);
      setShowDetailsModal(false);
      setSelectedInvoice(null);
      
    } catch (error) {
      toast.show({
        title: 'Error deleting invoice',
        status: 'error',
      });
    }
  };

  const handleExportInvoice = async (invoice: Invoice) => {
    try {
      setIsExporting(true);
      
      await generateAndShareExcel(
        invoice.employee,
        invoice.company,
        invoice.items,
        invoice.startDate,
        invoice.endDate,
        invoice.invoiceNumber,
        invoice.totalAmount
      );
      
      toast.show({
        title: 'Excel exported successfully',
        status: 'success',
      });
      
    } catch (error) {
      toast.show({
        title: 'Export failed',
        status: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      if (!dateString) return 'Invalid date';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid date';
    }
  };

  const formatAmount = (amount: number): string => {
    try {
      const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount));
      if (isNaN(numAmount)) return '$0.00';
      return `$${numAmount.toFixed(2)}`;
    } catch (error) {
      console.error('Error formatting amount:', amount, error);
      return '$0.00';
    }
  };

  const getInvoiceTypesSummary = (items: any[]): string => {
    try {
      if (!Array.isArray(items) || items.length === 0) return 'No items';
      
      const hasKitchen = items.some(item => item && item.description && item.description.includes('Kitchen'));
      const hasNight = items.some(item => item && item.description && item.description.includes('Night'));
      
      if (hasKitchen && hasNight) return 'Kitchen & Night';
      if (hasKitchen) return 'Kitchen';
      if (hasNight) return 'Night';
      return 'Other';
    } catch (error) {
      console.error('Error getting invoice types summary:', error);
      return 'Unknown';
    }
  };

  // Navigation functions
  const handleNavigateToHome = () => {
    navigation.navigate('Home');
  };

  const handleNavigateToDetails = () => {
    navigation.navigate('Details');
  };

  const handleNavigateToExport = () => {
    navigation.navigate('Export');
  };

  const handleNavigateToSettings = () => {
    navigation.navigate('Settings');
  };

  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="surface.100">
        <Text color="text.50">Loading invoices...</Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="surface.100">
      <ScrollView flex={1}>
        <VStack space={4} p={4}>
          {/* Header Stats */}
          <Box bg="blue.500" rounded="lg" p={4} shadow={2}>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text color="white" fontSize="xl" fontWeight="bold">
                  Saved Invoices
                </Text>
                <Text color="blue.100" fontSize="sm">
                  {savedInvoices.length} invoices total
                </Text>
              </VStack>
              <VStack alignItems="flex-end">
                <Text color="white" fontSize="2xl" fontWeight="bold">
                  {formatAmount(savedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0))}
                </Text>
                <Text color="blue.100" fontSize="sm">
                  Total value
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* Invoices List */}
          {savedInvoices.length === 0 ? (
            <Box bg="surface.50" rounded="lg" p={4} shadow={2}>
              <VStack space={3} alignItems="center">
                <Icon as={MaterialIcons} name="receipt-long" size="3xl" color="gray.400" />
                <Text textAlign="center" color="text.300" fontSize="lg">
                  No saved invoices yet
                </Text>
                <Text textAlign="center" color="text.400" fontSize="sm">
                  Create and save your first invoice to see it here
                </Text>
              </VStack>
            </Box>
          ) : (
            savedInvoices
              .sort((a, b) => {
                try {
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                } catch (error) {
                  console.error('Error sorting invoices:', error);
                  return 0;
                }
              })
              .map((invoice, index) => {
                // Add safety checks to prevent rendering errors
                if (!invoice || !invoice.id) {
                  console.error('Invalid invoice at index:', index, invoice);
                  return null;
                }
                
                const safeItems = invoice.items || [];
                const safeEmployee = invoice.employee || { name: 'Unknown', lastname: 'User' };
                const safeInvoiceNumber = invoice.invoiceNumber || 0;
                const safeTotalAmount = invoice.totalAmount || 0;
                const safeStartDate = invoice.startDate || '';
                const safeEndDate = invoice.endDate || '';
                const safeCreatedAt = invoice.createdAt || new Date().toISOString();
                
                return (
                  <Box key={`${invoice.id}-${index}`} bg="surface.50" rounded="lg" p={4} shadow={2} onTouchEnd={() => handleInvoicePress(invoice)}>
                    <VStack space={2}>
                      <HStack justifyContent="space-between" alignItems="flex-start">
                        <VStack flex={1} space={1}>
                          <HStack alignItems="center" space={2}>
                            <Text fontSize="lg" fontWeight="bold" color="text.50">
                              Invoice #{safeInvoiceNumber}
                            </Text>
                            <Badge
                              colorScheme="blue"
                              variant="subtle"
                              rounded="full"
                            >
                              {getInvoiceTypesSummary(safeItems)}
                            </Badge>
                          </HStack>
                          
                          <Text fontSize="sm" color="text.200">
                            {safeEmployee.name} {safeEmployee.lastname}
                          </Text>
                          
                          <Text fontSize="sm" color="text.300">
                            {safeStartDate && safeEndDate ? `${formatDate(safeStartDate)} - ${formatDate(safeEndDate)}` : 'No dates available'}
                          </Text>
                          
                          <Text fontSize="xs" color="text.400">
                            {safeItems.length} items • Created {formatDate(safeCreatedAt)}
                          </Text>
                        </VStack>
                        
                        <VStack alignItems="flex-end" space={1}>
                          <Text fontSize="xl" fontWeight="bold" color="green.600">
                            {formatAmount(safeTotalAmount)}
                          </Text>
                          <Button
                            size="xs"
                            variant="outline"
                            colorScheme="blue"
                            onPress={() => handleExportInvoice(invoice)}
                            isLoading={isExporting}
                          >
                            Export
                          </Button>
                        </VStack>
                      </HStack>
                    </VStack>
                  </Box>
                );
              })
              .filter(Boolean) // Remove null elements
          )}
        </VStack>
      </ScrollView>

      {/* Invoice Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} size="lg">
        <Modal.Content maxWidth="90%">
          <Modal.CloseButton />
          <Modal.Header>
            Invoice #{selectedInvoice?.invoiceNumber}
          </Modal.Header>
          <Modal.Body>
            {selectedInvoice && (
              <VStack space={4}>
                {/* Invoice Info */}
                <VStack space={2}>
                  <Text fontSize="md" fontWeight="bold">Invoice Information</Text>
                  <Text fontSize="sm">
                    Period: {formatDate(selectedInvoice.startDate)} - {formatDate(selectedInvoice.endDate)}
                  </Text>
                  <Text fontSize="sm">
                    Total: {formatAmount(selectedInvoice.totalAmount)}
                  </Text>
                  <Text fontSize="sm">
                    Created: {formatDate(selectedInvoice.createdAt)}
                  </Text>
                </VStack>

                <Divider />

                {/* Employee Info */}
                <VStack space={2}>
                  <Text fontSize="md" fontWeight="bold">Employee</Text>
                  <Text fontSize="sm">
                    {selectedInvoice.employee.name} {selectedInvoice.employee.lastname}
                  </Text>
                  <Text fontSize="sm">ABN: {selectedInvoice.employee.abn}</Text>
                </VStack>

                <Divider />

                {/* Items */}
                <VStack space={2}>
                  <Text fontSize="md" fontWeight="bold">
                    Items ({selectedInvoice.items.length})
                  </Text>
                  <ScrollView maxHeight="200">
                    <VStack space={2}>
                      {selectedInvoice.items.map((item, index) => (
                        <HStack key={item.id || index} justifyContent="space-between">
                          <VStack flex={1}>
                            <Text fontSize="sm">
                              {item.date} - {getDayOfWeek(item.date)}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {item.description}
                            </Text>
                          </VStack>
                          <Text fontSize="sm" fontWeight="bold">
                            ${item.amount}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </ScrollView>
                </VStack>
              </VStack>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
              <Button
                colorScheme="red"
                variant="outline"
                onPress={() => setShowDeleteAlert(true)}
              >
                Delete
              </Button>
              <Button
                colorScheme="blue"
                onPress={() => selectedInvoice && handleExportInvoice(selectedInvoice)}
                isLoading={isExporting}
              >
                Export
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Delete Confirmation Alert */}
      <AlertDialog isOpen={showDeleteAlert} onClose={() => setShowDeleteAlert(false)}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Delete Invoice</AlertDialog.Header>
          <AlertDialog.Body>
            Are you sure you want to delete Invoice #{selectedInvoice?.invoiceNumber}? 
            This action cannot be undone.
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={() => setShowDeleteAlert(false)}
              >
                Cancel
              </Button>
              <Button colorScheme="danger" onPress={handleDeleteInvoice}>
                Delete
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>

      {/* Refresh FAB */}
      <Fab
        renderInPortal={false}
        shadow={2}
        size="sm"
        icon={<Icon color="white" as={MaterialIcons} name="refresh" size="sm" />}
        onPress={loadSavedInvoices}
      />

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
            onPress={() => {}} // Already on history
            leftIcon={<Icon as={MaterialIcons} name="history" size="sm" />}
            _text={{ fontSize: "xs", fontWeight: "bold" }}
            colorScheme="blue"
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
            isDisabled={invoice.items.length === 0}
          >
            Details
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            flex={1}
            onPress={handleNavigateToExport}
            leftIcon={<Icon as={MaterialIcons} name="file-download" size="sm" />}
            _text={{ fontSize: "xs" }}
            isDisabled={invoice.items.length === 0}
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