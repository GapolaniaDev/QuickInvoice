import React from 'react';
import { NativeBaseProvider, extendTheme } from 'native-base';
import { Provider } from 'react-redux';
import { BackHandler } from 'react-native';
import { store } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

// Polyfill for BackHandler removeEventListener compatibility
if (!BackHandler.removeEventListener) {
  BackHandler.removeEventListener = (eventName: string, handler: () => void) => {
    // In newer React Native versions, addEventListener returns a function to remove the listener
    // This is a basic polyfill for backward compatibility
    console.warn('BackHandler.removeEventListener is deprecated. Using polyfill.');
  };
}

// Create theme with light and dark mode support
const createTheme = (isDarkMode: boolean) => extendTheme({
  colors: {
    primary: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#2196F3',
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
    },
    // Custom colors for light/dark theme
    surface: {
      50: isDarkMode ? '#1A1A1A' : '#FFFFFF',
      100: isDarkMode ? '#2D2D2D' : '#F8F9FA',
      200: isDarkMode ? '#404040' : '#E9ECEF',
      300: isDarkMode ? '#525252' : '#DEE2E6',
      400: isDarkMode ? '#666666' : '#CED4DA',
      500: isDarkMode ? '#7A7A7A' : '#ADB5BD',
      600: isDarkMode ? '#8E8E8E' : '#6C757D',
      700: isDarkMode ? '#A2A2A2' : '#495057',
      800: isDarkMode ? '#B6B6B6' : '#343A40',
      900: isDarkMode ? '#CCCCCC' : '#212529',
    },
    text: {
      50: isDarkMode ? '#F8F9FA' : '#212529',
      100: isDarkMode ? '#E9ECEF' : '#343A40',
      200: isDarkMode ? '#DEE2E6' : '#495057',
      300: isDarkMode ? '#CED4DA' : '#6C757D',
      400: isDarkMode ? '#ADB5BD' : '#ADB5BD',
      500: isDarkMode ? '#6C757D' : '#CED4DA',
      600: isDarkMode ? '#495057' : '#DEE2E6',
      700: isDarkMode ? '#343A40' : '#E9ECEF',
      800: isDarkMode ? '#212529' : '#F8F9FA',
      900: isDarkMode ? '#000000' : '#FFFFFF',
    },
  },
  config: {
    initialColorMode: isDarkMode ? 'dark' : 'light',
    useSystemColorMode: false,
  },
  components: {
    Modal: {
      baseStyle: {
        content: {
          bg: isDarkMode ? 'surface.50' : 'surface.50',
        },
      },
    },
    Text: {
      baseStyle: {
        color: isDarkMode ? 'text.50' : 'text.50',
      },
    },
  },
});

// App component that uses theme
const AppContent: React.FC = () => {
  const { isDarkMode } = useTheme();
  const theme = createTheme(isDarkMode);

  return (
    <NativeBaseProvider theme={theme}>
      <AppNavigator />
    </NativeBaseProvider>
  );
};

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;