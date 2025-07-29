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
} from 'native-base';
import { TextInput, StyleSheet } from 'react-native';
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

type HomeScreenNavigationProp = NavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useDispatch();
  const toast = useToast();
  
  const { employee, company, invoice } = useSelector((state: RootState) => state);
  
  const [startDate, setStartDateLocal] = useState('');
  const [endDate, setEndDateLocal] = useState('');
  const [kitchenCleaningEnabled, setKitchenCleaningEnabled] = useState(false);
  const [nightCleaningEnabled, setNightCleaningEnabled] = useState(true);

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

    // Limpiar items existentes
    dispatch(removeItemsByType('1'));

    // Calcular kitchen cleaning si está habilitado
    if (kitchenCleaningEnabled) {
      const kitchenItems = getKitchenCleaningDays(start, end);
      kitchenItems.forEach((item) => {
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
      nightItems.forEach((item) => {
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

  return (
    <ScrollView flex={1} bg="gray.50">
      <VStack space={4} p={4}>
        {/* Header with navigation buttons */}
        <HStack space={2} justifyContent="space-between">
          <Button
            flex={1}
            onPress={handleNavigateToHistory}
            variant="outline"
            colorScheme="blue"
          >
            History
          </Button>
          <Button
            flex={1}
            onPress={handleNavigateToSettings}
            variant="outline"
            colorScheme="blue"
          >
            Settings
          </Button>
        </HStack>

        {/* Employee Information */}
        <Box bg="white" rounded="lg" p={4} shadow={2}>
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
        <Box bg="white" rounded="lg" p={4} shadow={2}>
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="bold" color="blue.600">
              Invoice Period
            </Text>
              
              <HStack space={2}>
                <FormControl flex={1}>
                  <FormControl.Label>Start Date</FormControl.Label>
                  <TextInput
                    style={styles.input}
                    value={startDate}
                    onChangeText={setStartDateLocal}
                    onBlur={handleDateChange}
                    placeholder="2025-01-01"
                    autoCorrect={false}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Format: YYYY-MM-DD (e.g., 2025-01-01)
                  </Text>
                </FormControl>
                
                <FormControl flex={1}>
                  <FormControl.Label>End Date</FormControl.Label>
                  <TextInput
                    style={styles.input}
                    value={endDate}
                    onChangeText={setEndDateLocal}
                    onBlur={handleDateChange}
                    placeholder="2025-01-31"
                    autoCorrect={false}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Format: YYYY-MM-DD (e.g., 2025-01-31)
                  </Text>
                </FormControl>
            </HStack>
          </VStack>
        </Box>

        {/* Cleaning Options */}
        <Box bg="white" rounded="lg" p={4} shadow={2}>
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
        <Box bg="white" rounded="lg" p={4} shadow={2}>
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
            View Details ({invoice.items.length} items)
          </Button>
          
          <Button
            onPress={handleNavigateToExport}
            colorScheme="green"
            size="lg"
            isDisabled={invoice.items.length === 0}
          >
            Export Invoice (${invoice.totalAmount})
          </Button>
        </VStack>
      </VStack>
    </ScrollView>
  );
};