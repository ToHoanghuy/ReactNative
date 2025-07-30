import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import Modal from '../../components/Modal';
const Icon = require('react-native-vector-icons/Feather').default;
import LinearGradient from 'react-native-linear-gradient';

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { login, loginWithCredentials } = useAuth();
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'info'>('info');
  const [modalButtons, setModalButtons] = useState<{
    text: string;
    onPress: () => void;
    type?: 'default' | 'primary' | 'danger';
  }[]>([]);

  // Show modal helper function
  const showModal = (
    title: string, 
    message: string, 
    type: 'success' | 'error' | 'info' = 'info',
    buttons = [{ text: 'OK', onPress: () => setModalVisible(false) }]
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalButtons(buttons);
    setModalVisible(true);
  };

  const handleLogin = async () => {
    // Reset any previous loading state
    setIsLoading(true);
    
    // Form validation - improved with detailed error messages
    if (!email.trim()) {
      setIsLoading(false);
      showModal(t('Error'), t('Email không được để trống'), 'error');
      return;
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setIsLoading(false);
      showModal(t('Error'), t('Email không đúng định dạng'), 'error');
      return;
    }
    
    if (!password.trim()) {
      setIsLoading(false);
      showModal(t('Error'), t('Mật khẩu không được để trống'), 'error');
      return;
    }
    
    // Password length validation
    if (password.trim().length < 6) {
      setIsLoading(false);
      showModal(t('Error'), t('Mật khẩu phải có ít nhất 6 ký tự'), 'error');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Call the API login method
      const result = await loginWithCredentials(email, password);
      
      if (result.success) {
        // Login successful - Redux and AsyncStorage are already updated
        setIsLoading(false);
      } else {
        // Login failed - show error message
        setIsLoading(false);
        showModal(t('Error'), t(result.error || 'Đăng nhập thất bại. Vui lòng thử lại.'), 'error');
      }
    } catch (error) {
      setIsLoading(false);
      showModal(t('Error'), t('Đăng nhập thất bại. Vui lòng thử lại.'), 'error');
      console.error('Login error:', error);
    }
  };

  const handleForgotPassword = () => {
    try {
      navigation.navigate('ForgotPassword');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback if navigation fails
      showModal('Error', 'Unable to navigate to forgot password screen', 'error');
    }
  };

  const handleRegister = () => {
    try {
      navigation.navigate('Register');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback if navigation fails
      showModal('Error', 'Unable to navigate to register screen', 'error');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar backgroundColor="#2196F3" barStyle="light-content" />
      <View style={styles.backgroundContainer}>
        <Image style = {styles.logo} source={require('../../assets/images/logo.png')}  />

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
            style={[
              styles.loginButton,
              (!email.trim() || !password.trim()) && styles.loginButtonDisabled
            ]}
            onPress={handleLogin}
            disabled={isLoading || !email.trim() || !password.trim()}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>{t('Đăng nhập')}</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.otherSignInContainer}
            onPress={() => Linking.openURL('https://jbabrands.com/app-login-page/?redirect_uri=jbaai://login')}
          >
            <View style={styles.circleLogo}>
              {/* <Text style={styles.jbaLogoSmall}>Health Care</Text> */}
              <Image style = {{width: 30, height: 30, borderRadius: 15}} source={require('../../assets/images/logo.png')}></Image>
            </View>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.noAccountText}>{t('Chưa có tài khoản?')}</Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerText}>{t('Đăng ký')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Custom Modal */}
      <Modal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        buttons={modalButtons}
        onClose={() => setModalVisible(false)}
      />
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
  loginButtonDisabled: {
    backgroundColor: '#FFB74D', // Lighter orange for disabled state
    opacity: 0.7,
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
