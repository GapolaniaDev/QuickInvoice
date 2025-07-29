import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  ScrollView,
  useToast,
  Modal,
  FormControl,
  Select,
  CheckIcon,
  Fab,
  Icon,
  AlertDialog,
} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootState } from '../store';
import { RootStackParamList } from '../navigation/AppNavigator';
import { addOrUpdateItem, removeItem, calculateTotal } from '../store/invoiceSlice';
import { InvoiceItem } from '../types';
import { getDayOfWeek } from '../utils/invoiceUtils';

type DetailsNavigationProp = NavigationProp<RootStackParamList, 'Details'>;

export const DetailsScreen: React.FC = () => {
  const navigation = useNavigation<DetailsNavigationProp>();
  const dispatch = useDispatch();
  const toast = useToast();
  
  const { invoice } = useSelector((state: RootState) => state);
  
  const [showModal, setShowModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InvoiceItem | null>(null);
  const [editingItem, setEditingItem] = useState<InvoiceItem>({
    id: null,
    date: '',
    room: '',
    type: '1',
    description: '',
    time: '',
    amount: 0,
  });

  const handleItemPress = (item: InvoiceItem) => {
    setSelectedItem(item);
    setEditingItem({ ...item });
    setShowModal(true);
  };

  const handleNewItem = () => {
    setSelectedItem(null);
    setEditingItem({
      id: null,
      date: '',
      room: '',
      type: '1',
      description: '',
      time: '',
      amount: 0,
    });
    setShowModal(true);
  };

  const handleSaveItem = () => {
    if (!editingItem.date || !editingItem.room || !editingItem.description) {
      toast.show({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        status: 'warning',
      });
      return;
    }

    dispatch(addOrUpdateItem(editingItem));
    dispatch(calculateTotal());
    setShowModal(false);
    
    toast.show({
      title: selectedItem ? 'Item updated' : 'Item added',
      status: 'success',
    });
  };

  const handleDeleteItem = () => {
    if (selectedItem && selectedItem.id !== null) {
      dispatch(removeItem(selectedItem.id));
      dispatch(calculateTotal());
      setShowDeleteAlert(false);
      setShowModal(false);
      
      toast.show({
        title: 'Item deleted',
        status: 'success',
      });
    }
  };

  const formatAmount = (amount: number): string => {
    return amount > 0 ? `$${amount}` : '';
  };

  // Navigation functions
  const handleNavigateToHome = () => {
    navigation.navigate('Home');
  };

  const handleNavigateToHistory = () => {
    navigation.navigate('InvoicesHistory');
  };

  const handleNavigateToExport = () => {
    navigation.navigate('Export');
  };

  const handleNavigateToSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <Box flex={1} bg="gray.50">
      <ScrollView flex={1}>
        <VStack space={4} p={4}>
          {/* Header with total */}
          <Box bg="blue.500" rounded="lg" p={4} shadow={2}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text color="white" fontSize="xl" fontWeight="bold">
                Invoice Details
              </Text>
              <Text color="white" fontSize="2xl" fontWeight="bold">
                ${invoice.totalAmount}
              </Text>
            </HStack>
          </Box>

          {/* Items list */}
          {invoice.items.length === 0 ? (
            <Box bg="white" rounded="lg" p={4} shadow={2}>
              <Text textAlign="center" color="gray.500">
                No items yet. Add some items to get started.
              </Text>
            </Box>
          ) : (
            invoice.items.map((item, index) => (
              <Box key={item.id || index} bg="white" rounded="lg" p={4} shadow={2} onTouchEnd={() => handleItemPress(item)}>
                <HStack justifyContent="space-between" alignItems="flex-start">
                  <VStack flex={1} space={1}>
                    <Text fontSize="md" fontWeight="semibold">
                      {item.date} - {getDayOfWeek(item.date)}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {item.room}
                    </Text>
                    <Text fontSize="sm">
                      {item.description}
                    </Text>
                    {item.time && (
                      <Text fontSize="sm" color="gray.500">
                        Time: {item.time}
                      </Text>
                    )}
                  </VStack>
                  <Text fontSize="lg" fontWeight="bold" color="green.600">
                    {formatAmount(item.amount)}
                  </Text>
                </HStack>
              </Box>
            ))
          )}
        </VStack>
      </ScrollView>

      {/* Floating Action Button */}
      <Fab
        renderInPortal={false}
        shadow={2}
        size="sm"
        icon={<Icon color="white" as={MaterialIcons} name="add" size="sm" />}
        onPress={handleNewItem}
      />

      {/* Edit/Add Item Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>
            {selectedItem ? 'Edit Item' : 'Add New Item'}
          </Modal.Header>
          <Modal.Body>
            <VStack space={3}>
              <FormControl>
                <FormControl.Label>Date</FormControl.Label>
                <Input
                  value={editingItem.date}
                  onChangeText={(text) => setEditingItem({...editingItem, date: text})}
                  placeholder="YYYY-MM-DD"
                  autoCorrect={false}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>Room</FormControl.Label>
                <Input
                  value={editingItem.room}
                  onChangeText={(text) => setEditingItem({...editingItem, room: text})}
                  placeholder="Enter room information"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>Type</FormControl.Label>
                <Select
                  selectedValue={editingItem.type}
                  onValueChange={(value) => setEditingItem({...editingItem, type: value})}
                  _selectedItem={{
                    bg: 'teal.600',
                    endIcon: <CheckIcon size="5" />
                  }}
                >
                  <Select.Item label="Kitchen" value="1" />
                  <Select.Item label="Room" value="2" />
                </Select>
              </FormControl>

              <FormControl>
                <FormControl.Label>Description</FormControl.Label>
                <Input
                  value={editingItem.description}
                  onChangeText={(text) => setEditingItem({...editingItem, description: text})}
                  placeholder="Enter description"
                  autoCapitalize="sentences"
                  autoCorrect={false}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>Time (Optional)</FormControl.Label>
                <Input
                  value={editingItem.time}
                  onChangeText={(text) => setEditingItem({...editingItem, time: text})}
                  placeholder="Enter time"
                  autoCorrect={false}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>Amount</FormControl.Label>
                <Input
                  keyboardType="numeric"
                  value={String(editingItem.amount)}
                  onChangeText={(text) => setEditingItem({...editingItem, amount: parseFloat(text) || 0})}
                  placeholder="Enter amount"
                  autoCorrect={false}
                />
              </FormControl>

              {selectedItem && (
                <Button
                  colorScheme="red"
                  variant="outline"
                  onPress={() => setShowDeleteAlert(true)}
                >
                  Delete Item
                </Button>
              )}
            </VStack>
          </Modal.Body>

          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button onPress={handleSaveItem}>
                {selectedItem ? 'Update' : 'Add'}
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Delete Confirmation Alert */}
      <AlertDialog isOpen={showDeleteAlert} onClose={() => setShowDeleteAlert(false)}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Delete Item</AlertDialog.Header>
          <AlertDialog.Body>
            Are you sure you want to delete this item? This action cannot be undone.
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
              <Button colorScheme="danger" onPress={handleDeleteItem}>
                Delete
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>

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
            onPress={() => {}} // Already on details
            leftIcon={<Icon as={MaterialIcons} name="description" size="sm" />}
            _text={{ fontSize: "xs", fontWeight: "bold" }}
            colorScheme="blue"
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