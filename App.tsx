import React, { useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import DataProvider from './src/components/DataProvider';
import RootNavigator from './src/navigation/RootNavigator';
import { LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Got a component with the name',
  'i18next::pluralResolver'
]);

const App: React.FC = () => {
  const navigationRef = useRef(null);

  // Navigation state persistence
  const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

  return (
    <Provider store={store}>
      <DataProvider>
        <NavigationContainer
          ref={navigationRef}
          onStateChange={(state) => {
            // Disable saving navigation state to prevent issues
            // We'll rely on individual screen-level persistence instead
            // This helps avoid RESET action errors
          }}
          onReady={() => {
            // Reset navigation state instead of trying to restore it
            // This prevents 'RESET' action errors when navigation structure changes
            try {
              // Just clear the saved state to avoid future errors
              AsyncStorage.removeItem(PERSISTENCE_KEY);
            } catch (e) {
              console.warn('Failed to clear navigation state', e);
            }
          }}
        >
          <RootNavigator />
        </NavigationContainer>
      </DataProvider>
    </Provider>
  );
};

export default App;
