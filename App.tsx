import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import DataProvider from './src/components/DataProvider';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <DataProvider>
        <NavigationContainer>
          <BottomTabNavigator />
        </NavigationContainer>
      </DataProvider>
    </Provider>
  );
};

export default App;
