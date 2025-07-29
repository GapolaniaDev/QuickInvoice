import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Switch,
  FormControl,
  ScrollView,
  useToast,
  Pressable,
  Modal,
  Center,
  Icon,
} from 'native-base';
import { TextInput, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootState } from '../store';
import { setEmployeeField } from '../store/employeeSlice';
import { setCompanyField } from '../store/companySlice';
import { 
  setStartDate, 
  setEndDate, 
  setInvoiceNumber, 
  addOrUpdateItem, 
  removeItemsByType, 
  calculateTotal 
} from '../store/invoiceSlice';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StorageService } from '../services/storageService';
import { getKitchenCleaningDays, getNightCleaningDays, getInvoiceNumber } from '../utils/invoiceUtils';
import { useTheme } from '../contexts/ThemeContext';

// Create theme-aware styles
const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  input: {
    backgroundColor: isDarkMode ? '#2D2D2D' : '#FFFFFF',
    borderWidth: 1,
    borderColor: isDarkMode ? '#525252' : '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    minHeight: 40,
    color: isDarkMode ? '#F8F9FA' : '#000000',
  },
});

type HomeScreenNavigationProp = NavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useDispatch();
  const toast = useToast();
  const { isDarkMode } = useTheme();
  
  const { employee, company, invoice } = useSelector((state: RootState) => state);
  
  const [startDate, setStartDateLocal] = useState('');
  const [endDate, setEndDateLocal] = useState('');
  const [kitchenCleaningEnabled, setKitchenCleaningEnabled] = useState(false);
  const [nightCleaningEnabled, setNightCleaningEnabled] = useState(true);
  
  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDateObj, setStartDateObj] = useState(new Date());
  const [endDateObj, setEndDateObj] = useState(new Date());

  // Utility function to format date as YYYY-MM-DD
  const formatDateToString = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const loadStoredData = useCallback(async () => {
    try {
      // Cargar datos del empleado
      const storedEmployee = await StorageService.getEmployeeData();
      if (storedEmployee) {
        Object.entries(storedEmployee).forEach(([key, value]) => {
          dispatch(setEmployeeField({ field: key as keyof typeof employee, value }));
        });
      }

      // Cargar datos de la empresa
      const storedCompany = await StorageService.getCompanyData();
      if (storedCompany) {
        Object.entries(storedCompany).forEach(([key, value]) => {
          dispatch(setCompanyField({ field: key as keyof typeof company, value }));
        });
      }

      // Cargar selecciones de limpieza
      const selections = await StorageService.getCleaningSelections();
      setKitchenCleaningEnabled(selections.kitchen);
      setNightCleaningEnabled(selections.night);
      
    } catch (error) {
      toast.show({
        title: 'Error loading data',
      });
    }
  }, [dispatch, toast]);

  useEffect(() => {
    loadStoredData();
  }, [loadStoredData]);

  // Initialize default dates on component mount
  useEffect(() => {
    const today = new Date();
    if (!startDate) {
      const formattedToday = formatDateToString(today);
      setStartDateLocal(formattedToday);
      setStartDateObj(today);
    }
    if (!endDate) {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      const formattedNextWeek = formatDateToString(nextWeek);
      setEndDateLocal(formattedNextWeek);
      setEndDateObj(nextWeek);
    }
  }, []); // Only run once on mount

  const saveEmployeeData = useCallback(async () => {
    try {
      await StorageService.saveEmployeeData(employee);
      toast.show({
        title: 'Employee data saved',
      });
    } catch (error) {
      toast.show({
        title: 'Error saving employee data',
      });
    }
  }, [employee, toast]);

  const saveCompanyData = useCallback(async () => {
    try {
      await StorageService.saveCompanyData(company);
      toast.show({
        title: 'Company data saved',
      });
    } catch (error) {
      toast.show({
        title: 'Error saving company data',
      });
    }
  }, [company, toast]);

  const calculateItems = useCallback(() => {
    if (!startDate || !endDate) return;
    
    // Validar que al menos uno esté seleccionado
    if (!kitchenCleaningEnabled && !nightCleaningEnabled) {
      toast.show({
        title: 'Selection required',
        description: 'Select at least one cleaning type',
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    console.log('=== CALCULATING ITEMS ===');
    console.log('Date range:', startDate, 'to', endDate);
    console.log('Kitchen enabled:', kitchenCleaningEnabled);
    console.log('Night enabled:', nightCleaningEnabled);
    console.log('Current items before clear:', invoice.items.length);

    // Limpiar items existentes
    dispatch(removeItemsByType('1'));
    console.log('Items after clearing type 1:', invoice.items.length);

    // Calcular kitchen cleaning si está habilitado
    if (kitchenCleaningEnabled) {
      const kitchenItems = getKitchenCleaningDays(start, end);
      console.log('Generated kitchen items:', kitchenItems.length);
      kitchenItems.forEach((item, index) => {
        console.log(`Adding kitchen item ${index + 1}:`, item);
        dispatch(addOrUpdateItem({
          id: null,
          date: item.date,
          room: item.room,
          type: '1',
          description: item.description,
          time: '',
          amount: item.amount,
        }));
      });
    }

    // Calcular night cleaning si está habilitado
    if (nightCleaningEnabled) {
      const nightItems = getNightCleaningDays(start, end);
      console.log('Generated night items:', nightItems.length);
      nightItems.forEach((item, index) => {
        console.log(`Adding night item ${index + 1}:`, item);
        dispatch(addOrUpdateItem({
          id: null,
          date: item.date,
          room: item.room,
          type: '1',
          description: item.description,
          time: '',
          amount: item.amount,
        }));
      });
    }

    dispatch(calculateTotal());
    console.log('Final items count after calculation:', invoice.items.length);
  }, [startDate, endDate, kitchenCleaningEnabled, nightCleaningEnabled, dispatch, toast]);

  const handleDateChange = useCallback(() => {
    if (!startDate || !endDate) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      toast.show({
        title: 'Invalid dates',
        description: 'Start date must be before end date',
      });
      return;
    }

    dispatch(setStartDate(startDate));
    dispatch(setEndDate(endDate));
    dispatch(setInvoiceNumber(getInvoiceNumber(start)));
    
    calculateItems();
  }, [startDate, endDate, dispatch, toast, calculateItems]);

  // Date picker handlers
  const handleStartDateChange = useCallback((event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    
    if (selectedDate) {
      // Validate that start date is not after end date
      if (endDate && selectedDate >= new Date(endDate)) {
        toast.show({
          title: 'Invalid date',
          description: 'Start date must be before end date',
        });
        return;
      }
      
      setStartDateObj(selectedDate);
      const formattedDate = formatDateToString(selectedDate);
      setStartDateLocal(formattedDate);
      
      // Auto-trigger calculation if both dates are set
      if (endDate) {
        setTimeout(() => handleDateChange(), 100);
      }
    }
  }, [endDate, formatDateToString, handleDateChange, toast]);

  const handleEndDateChange = useCallback((event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }
    
    if (selectedDate) {
      // Validate that end date is not before start date
      if (startDate && selectedDate <= new Date(startDate)) {
        toast.show({
          title: 'Invalid date',
          description: 'End date must be after start date',
        });
        return;
      }
      
      setEndDateObj(selectedDate);
      const formattedDate = formatDateToString(selectedDate);
      setEndDateLocal(formattedDate);
      
      // Auto-trigger calculation if both dates are set
      if (startDate) {
        setTimeout(() => handleDateChange(), 100);
      }
    }
  }, [startDate, formatDateToString, handleDateChange, toast]);

  const closeStartDatePicker = useCallback(() => {
    setShowStartDatePicker(false);
  }, []);

  const closeEndDatePicker = useCallback(() => {
    setShowEndDatePicker(false);
  }, []);

  const showStartDatePickerModal = useCallback(() => {
    setShowStartDatePicker(true);
  }, []);

  const showEndDatePickerModal = useCallback(() => {
    setShowEndDatePicker(true);
  }, []);

  // Handlers para employee fields
  const handleEmployeeName = useCallback((text: string) => {
    dispatch(setEmployeeField({ field: 'name', value: text }));
  }, [dispatch]);

  const handleEmployeeLastname = useCallback((text: string) => {
    dispatch(setEmployeeField({ field: 'lastname', value: text }));
  }, [dispatch]);

  const handleEmployeeAbn = useCallback((text: string) => {
    dispatch(setEmployeeField({ field: 'abn', value: text }));
  }, [dispatch]);

  const handleEmployeeBsb = useCallback((text: string) => {
    dispatch(setEmployeeField({ field: 'bsb', value: text }));
  }, [dispatch]);

  const handleEmployeeAcc = useCallback((text: string) => {
    dispatch(setEmployeeField({ field: 'acc', value: text }));
  }, [dispatch]);

  // Handlers para company fields
  const handleCompanyName = useCallback((text: string) => {
    dispatch(setCompanyField({ field: 'name', value: text }));
  }, [dispatch]);

  const handleCompanyAddress = useCallback((text: string) => {
    dispatch(setCompanyField({ field: 'address', value: text }));
  }, [dispatch]);

  const handleCompanyCity = useCallback((text: string) => {
    dispatch(setCompanyField({ field: 'city', value: text }));
  }, [dispatch]);

  const handleCompanyState = useCallback((text: string) => {
    dispatch(setCompanyField({ field: 'stateA', value: text }));
  }, [dispatch]);

  const handleCompanyPostcode = useCallback((text: string) => {
    dispatch(setCompanyField({ field: 'postcode', value: text }));
  }, [dispatch]);

  // Navigation handlers
  const handleNavigateToHistory = useCallback(() => {
    navigation.navigate('InvoicesHistory');
  }, [navigation]);

  const handleNavigateToSettings = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const handleNavigateToDetails = useCallback(() => {
    navigation.navigate('Details');
  }, [navigation]);

  const handleNavigateToExport = useCallback(() => {
    navigation.navigate('Export');
  }, [navigation]);

  useEffect(() => {
    if (startDate && endDate) {
      calculateItems();
    }
  }, [kitchenCleaningEnabled, nightCleaningEnabled, calculateItems]);

  // Create styles based on current theme
  const styles = createStyles(isDarkMode);

  return (
    <Box flex={1} bg="surface.100">
      <ScrollView flex={1}>
        <VStack space={4} p={4}>
        {/* Header */}
        <Box bg="blue.500" rounded="lg" p={4} shadow={2}>
          <VStack space={2} alignItems="center">
            <Text color="white" fontSize="2xl" fontWeight="bold">
              QuickInvoice
            </Text>
            <Text color="blue.100" fontSize="sm" textAlign="center">
              Create professional invoices quickly and easily
            </Text>
          </VStack>
        </Box>

        {/* Employee Information */}
        <Box bg="surface.50" rounded="lg" p={4} shadow={2}>
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="bold" color="blue.600">
              Employee Information
            </Text>
              
              <FormControl>
                <FormControl.Label>Name</FormControl.Label>
                <TextInput
                  style={styles.input}
                  value={employee.name}
                  onChangeText={handleEmployeeName}
                  placeholder="Enter your name"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </FormControl>
              
              <FormControl>
                <FormControl.Label>Last Name</FormControl.Label>
                <TextInput
                  style={styles.input}
                  value={employee.lastname}
                  onChangeText={handleEmployeeLastname}
                  placeholder="Enter your last name"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </FormControl>
              
              <FormControl>
                <FormControl.Label>ABN</FormControl.Label>
                <TextInput
                  style={styles.input}
                  value={employee.abn}
                  onChangeText={handleEmployeeAbn}
                  placeholder="Enter ABN"
                  keyboardType="numeric"
                  autoCorrect={false}
                />
              </FormControl>
              
              <HStack space={2}>
                <FormControl flex={1}>
                  <FormControl.Label>BSB</FormControl.Label>
                  <TextInput
                    style={styles.input}
                    value={employee.bsb}
                    onChangeText={handleEmployeeBsb}
                    placeholder="BSB"
                    keyboardType="numeric"
                    maxLength={6}
                    autoCorrect={false}
                  />
                </FormControl>
                
                <FormControl flex={1}>
                  <FormControl.Label>ACC</FormControl.Label>
                  <TextInput
                    style={styles.input}
                    value={employee.acc}
                    onChangeText={handleEmployeeAcc}
                    placeholder="Account"
                    keyboardType="numeric"
                    autoCorrect={false}
                  />
                </FormControl>
              </HStack>

            <Button onPress={saveEmployeeData} colorScheme="green" size="sm">
              Save Employee Data
            </Button>
          </VStack>
        </Box>

        {/* Date Selection */}
        <Box bg="surface.50" rounded="lg" p={4} shadow={2}>
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="bold" color="blue.600">
              Invoice Period
            </Text>
              
              <HStack space={2}>
                <FormControl flex={1}>
                  <FormControl.Label>Start Date</FormControl.Label>
                  <Pressable onPress={showStartDatePickerModal}>
                    <Box style={styles.input}>
                      <Text color={startDate ? "text.50" : "gray.400"}>
                        {startDate || "Select start date"}
                      </Text>
                    </Box>
                  </Pressable>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Tap to select date
                  </Text>
                </FormControl>
                
                <FormControl flex={1}>
                  <FormControl.Label>End Date</FormControl.Label>
                  <Pressable onPress={showEndDatePickerModal}>
                    <Box style={styles.input}>
                      <Text color={endDate ? "text.50" : "gray.400"}>
                        {endDate || "Select end date"}
                      </Text>
                    </Box>
                  </Pressable>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Tap to select date
                  </Text>
                </FormControl>
            </HStack>
          </VStack>
        </Box>

        {/* Start Date Picker Modal */}
        <Modal isOpen={showStartDatePicker} onClose={closeStartDatePicker}>
          <Modal.Content maxWidth="400px">
            <Modal.CloseButton />
            <Modal.Header>Select Start Date</Modal.Header>
            <Modal.Body>
              <Center>
                <DateTimePicker
                  value={startDateObj}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleStartDateChange}
                />
              </Center>
            </Modal.Body>
            <Modal.Footer>
              <Button.Group space={2}>
                <Button variant="ghost" colorScheme="blueGray" onPress={closeStartDatePicker}>
                  Cancel
                </Button>
                <Button onPress={closeStartDatePicker}>
                  Done
                </Button>
              </Button.Group>
            </Modal.Footer>
          </Modal.Content>
        </Modal>

        {/* End Date Picker Modal */}
        <Modal isOpen={showEndDatePicker} onClose={closeEndDatePicker}>
          <Modal.Content maxWidth="400px">
            <Modal.CloseButton />
            <Modal.Header>Select End Date</Modal.Header>
            <Modal.Body>
              <Center>
                <DateTimePicker
                  value={endDateObj}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleEndDateChange}
                />
              </Center>
            </Modal.Body>
            <Modal.Footer>
              <Button.Group space={2}>
                <Button variant="ghost" colorScheme="blueGray" onPress={closeEndDatePicker}>
                  Cancel
                </Button>
                <Button onPress={closeEndDatePicker}>
                  Done
                </Button>
              </Button.Group>
            </Modal.Footer>
          </Modal.Content>
        </Modal>

        {/* Cleaning Options */}
        <Box bg="surface.50" rounded="lg" p={4} shadow={2}>
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="bold" color="blue.600">
              Cleaning Options
            </Text>
              
              <HStack justifyContent="space-between" alignItems="center">
                <Text>Kitchen Cleaning</Text>
                <Switch
                  isChecked={kitchenCleaningEnabled}
                  onToggle={setKitchenCleaningEnabled}
                  colorScheme="blue"
                />
              </HStack>
              
              <HStack justifyContent="space-between" alignItems="center">
                <Text>Night Cleaning</Text>
                <Switch
                  isChecked={nightCleaningEnabled}
                  onToggle={setNightCleaningEnabled}
                  colorScheme="blue"
                />
            </HStack>
          </VStack>
        </Box>

        {/* Company Information */}
        <Box bg="surface.50" rounded="lg" p={4} shadow={2}>
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="bold" color="blue.600">
              Company Information
            </Text>
              
              <FormControl>
                <FormControl.Label>Company Name</FormControl.Label>
                <TextInput
                  style={styles.input}
                  value={company.name}
                  onChangeText={handleCompanyName}
                  placeholder="Enter company name"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </FormControl>
              
              <FormControl>
                <FormControl.Label>Address</FormControl.Label>
                <TextInput
                  style={styles.input}
                  value={company.address}
                  onChangeText={handleCompanyAddress}
                  placeholder="Enter address"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </FormControl>
              
              <HStack space={2}>
                <FormControl flex={1}>
                  <FormControl.Label>City</FormControl.Label>
                  <TextInput
                    style={styles.input}
                    value={company.city}
                    onChangeText={handleCompanyCity}
                    placeholder="City"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </FormControl>
                
                <FormControl flex={1}>
                  <FormControl.Label>State</FormControl.Label>
                  <TextInput
                    style={styles.input}
                    value={company.stateA}
                    onChangeText={handleCompanyState}
                    placeholder="State"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={3}
                  />
                </FormControl>
              </HStack>
              
              <FormControl>
                <FormControl.Label>Postcode</FormControl.Label>
                <TextInput
                  style={styles.input}
                  value={company.postcode}
                  onChangeText={handleCompanyPostcode}
                  placeholder="Postcode"
                  keyboardType="numeric"
                  maxLength={4}
                  autoCorrect={false}
                />
              </FormControl>

            <Button onPress={saveCompanyData} colorScheme="green" size="sm">
              Save Company Data
            </Button>
          </VStack>
        </Box>

        {/* Navigation Buttons */}
        <VStack space={2}>
          <Button
            onPress={handleNavigateToDetails}
            colorScheme="blue"
            size="lg"
            isDisabled={invoice.items.length === 0}
          >
            {invoice.items.length === 0 ? 'Generate Items First' : `Review Invoice • ${invoice.items.length} ${invoice.items.length === 1 ? 'item' : 'items'}`}
          </Button>
          
          <Button
            onPress={handleNavigateToExport}
            colorScheme="green"
            size="lg"
            isDisabled={invoice.items.length === 0}
          >
            {invoice.items.length === 0 ? 'No Items to Export' : `Export & Save • $${invoice.totalAmount.toFixed(2)}`}
          </Button>
        </VStack>
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
          onPress={() => {}} // Already on home
          leftIcon={<Icon as={MaterialIcons} name="home" size="sm" />}
          _text={{ fontSize: "xs", fontWeight: "bold" }}
          colorScheme="blue"
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