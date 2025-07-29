import React from 'react';
import { NativeBaseProvider, extendTheme } from 'native-base';
import { Provider } from 'react-redux';
import { BackHandler } from 'react-native';
import { store } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';

// Polyfill for BackHandler removeEventListener compatibility
if (!BackHandler.removeEventListener) {
  BackHandler.removeEventListener = (eventName: string, handler: () => void) => {
    // In newer React Native versions, addEventListener returns a function to remove the listener
    // This is a basic polyfill for backward compatibility
    console.warn('BackHandler.removeEventListener is deprecated. Using polyfill.');
  };
}

// Extend the theme to include custom colors, fonts, etc
const theme = extendTheme({
  colors: {
    // Add custom color palette here
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
  },
  config: {
    // Changing initialColorMode to 'light'
    initialColorMode: 'light',
  },
});

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <NativeBaseProvider theme={theme}>
        <AppNavigator />
      </NativeBaseProvider>
    </Provider>
  );
}

export default App;