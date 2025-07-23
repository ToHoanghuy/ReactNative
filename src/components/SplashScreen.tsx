import React from 'react';
import { View, StyleSheet, ActivityIndicator, Image, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

interface SplashScreenProps {
  isLoading: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isLoading }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* <Image
        source={require('../assets/images/healthcare.jpg')}
        style={styles.logo}
        resizeMode="contain"
      /> */}
      <Text style={styles.appName}>{t('Health Monitor')}</Text>
      {isLoading && (
        <ActivityIndicator 
          size="large" 
          color="#2196F3" 
          style={styles.loader}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;
