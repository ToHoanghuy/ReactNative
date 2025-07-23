/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Enable hot reload tracking
if (__DEV__) {
  const originConsoleError = console.error;
  console.error = (...args) => {
    // Ignore specific hot reload related warnings
    const errorMessage = args[0]?.toString() || '';
    if (
      errorMessage.includes('Warning: ...') ||
      errorMessage.includes('Warning: Failed prop type') ||
      errorMessage.includes('Non-serializable values were found in the navigation state') ||
      errorMessage.includes('The action \'RESET\'') ||
      errorMessage.includes('was not handled by any navigator')
    ) {
      // Still log these issues but in a less prominent way for debugging
      console.log('Suppressed error:', errorMessage.substring(0, 150) + '...');
      return;
    }
    originConsoleError(...args);
  };
}

AppRegistry.registerComponent(appName, () => App);
