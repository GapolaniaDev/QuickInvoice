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
import { RootState } from '../store';
import { loadInvoices, deleteInvoice } from '../store/invoicesSlice';
import { StorageService } from '../services/storageService';
import { generateAndShareExcel } from '../utils/excelUtils';
import { Invoice } from '../types';
import { getDayOfWeek } from '../utils/invoiceUtils';

export const InvoicesHistoryScreen: React.FC = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  
  const { savedInvoices } = useSelector((state: RootState) => state.invoices);
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadSavedInvoices();
  }, []);

  const loadSavedInvoices = async () => {
    try {
      setIsLoading(true);
      const invoices = await StorageService.getInvoices();
      dispatch(loadInvoices(invoices));
    } catch (error) {
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const getInvoiceTypesSummary = (items: any[]): string => {
    const hasKitchen = items.some(item => item.description.includes('Kitchen'));
    const hasNight = items.some(item => item.description.includes('Night'));
    
    if (hasKitchen && hasNight) return 'Kitchen & Night';
    if (hasKitchen) return 'Kitchen';
    if (hasNight) return 'Night';
    return 'Other';
  };

  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text>Loading invoices...</Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="gray.50">
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
            <Box bg="white" rounded="lg" p={4} shadow={2}>
              <VStack space={3} alignItems="center">
                <Icon as={MaterialIcons} name="receipt-long" size="3xl" color="gray.400" />
                <Text textAlign="center" color="gray.500" fontSize="lg">
                  No saved invoices yet
                </Text>
                <Text textAlign="center" color="gray.400" fontSize="sm">
                  Create and save your first invoice to see it here
                </Text>
              </VStack>
            </Box>
          ) : (
            savedInvoices
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((invoice) => (
                <Box key={invoice.id} bg="white" rounded="lg" p={4} shadow={2} onTouchEnd={() => handleInvoicePress(invoice)}>
                  <VStack space={2}>
                    <HStack justifyContent="space-between" alignItems="flex-start">
                      <VStack flex={1} space={1}>
                        <HStack alignItems="center" space={2}>
                          <Text fontSize="lg" fontWeight="bold">
                            Invoice #{invoice.invoiceNumber}
                          </Text>
                          <Badge
                            colorScheme="blue"
                            variant="subtle"
                            rounded="full"
                          >
                            {getInvoiceTypesSummary(invoice.items)}
                          </Badge>
                        </HStack>
                        
                        <Text fontSize="sm" color="gray.600">
                          {invoice.employee.name} {invoice.employee.lastname}
                        </Text>
                        
                        <Text fontSize="sm" color="gray.500">
                          {formatDate(invoice.startDate)} - {formatDate(invoice.endDate)}
                        </Text>
                        
                        <Text fontSize="xs" color="gray.400">
                          {invoice.items.length} items • Created {formatDate(invoice.createdAt)}
                        </Text>
                      </VStack>
                      
                      <VStack alignItems="flex-end" space={1}>
                        <Text fontSize="xl" fontWeight="bold" color="green.600">
                          {formatAmount(invoice.totalAmount)}
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
              ))
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
    </Box>
  );
};