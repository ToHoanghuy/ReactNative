import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
const Icon = require('react-native-vector-icons/Feather').default;
import LinearGradient from 'react-native-linear-gradient';

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { login } = useAuth();
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // Form validation
    if (!email.trim()) {
      Alert.alert(t('Error'), t('Email is required'));
      return;
    }
    
    if (!password.trim()) {
      Alert.alert(t('Error'), t('Password is required'));
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Find the user account with matching email
      const account = accounts.find(acc => acc.email.toLowerCase() === email.toLowerCase());
      
      // Check if account exists and password matches
      if (account && account.password === password) {
        // Create user object without password
        const user = {
          id: account.id,
          email: account.email,
          name: account.name,
        };
        
        // Generate a mock token
        const mockToken = 'mock-jwt-token-' + Date.now();
        
        // Add a slight delay to simulate network request
        setTimeout(() => {
          // Dispatch login action to Redux
          login(mockToken, user);
          setIsLoading(false);
        }, 1000);
      } else {
        setTimeout(() => {
          setIsLoading(false);
          Alert.alert(t('Error'), t('Invalid email or password'));
        }, 1000);
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert(t('Error'), t('Login failed. Please try again.'));
      console.error('Login error:', error);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar backgroundColor="#2196F3" barStyle="light-content" />
      <View style={styles.backgroundContainer}>
        {/* <Image style = {styles.logo} source={require('../../assets/images/logo.png')}  /> */}

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <View style={styles.iconContainer}>
              <Icon name="mail" size={22} color="#999" />
            </View>
            <TextInput
              style={styles.input}
              placeholder={t('Email')}
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.iconContainer}>
              <Icon name="lock" size={22} color="#999" />
            </View>
            <TextInput
              style={styles.input}
              placeholder={t('Mật khẩu')}
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon 
                name={showPassword ? 'eye' : 'eye-off'} 
                size={22} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.forgotPasswordButton} 
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>{t('Quên mật khẩu?')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>{t('Đăng nhập')}</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.otherSignInContainer}>
            <View style={styles.circleLogo}>
              {/* <Text style={styles.jbaLogoSmall}>Health Care</Text> */}
              {/* <Image style = {{width: 30, height: 30, borderRadius: 15}} source={require('../../assets/images/logo.png')}></Image> */}
            </View>
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.noAccountText}>{t('Chưa có tài khoản?')}</Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerText}>{t('Đăng ký')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2196F3',
  },
  backgroundContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 100,
    paddingBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 30,
    borderRadius: 50,
  },
  heartRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartLine: {
    width: 40,
    height: 2,
    backgroundColor: 'red',
  },
  heartIcon: {
    fontSize: 30,
  },
  formContainer: {
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 30,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 60,
  },
  iconContainer: {
    marginRight: 10,
  },
  inputIcon: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    height: 60,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIconText: {
    fontSize: 18,
    color: '#999',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 5,
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#FF9800',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  otherSignInContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  circleLogo: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  jbaLogoSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00435c',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  noAccountText: {
    color: 'white',
    fontSize: 16,
  },
  registerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
