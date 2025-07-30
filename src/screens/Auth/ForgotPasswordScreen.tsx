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
  SafeAreaView
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import Modal from '../../components/Modal';
import SplashScreen from '../../components/SplashScreen';
import { requestPasswordReset, resendOtp } from '../../api/authApi';
const Icon = require('react-native-vector-icons/Feather').default;

type NavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
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

  const handleResetPassword = async () => {
    // Form validation
    if (!email.trim()) {
      showModal(t('Error'), t('Email is required'), 'error');
      return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showModal(t('Error'), t('Please enter a valid email address'), 'error');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Call the API to request password reset
      const result = await resendOtp(email);
      
      if (result.success) {
        setIsLoading(false);
        
        // Navigate to OTP verification screen with the email
        navigation.navigate('OTPVerification', { email });
      } else {
        setIsLoading(false);
        showModal(t('Error'), result.message || t('Password reset request failed. Please try again.'), 'error');
      }
    } catch (error) {
      setIsLoading(false);
      showModal(t('Error'), t('Password reset request failed. Please try again.'), 'error');
      console.error('Password reset error:', error);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToLogin}
        >
          <Icon name="chevron-left" size={30} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/images/forgot_password.png')}
          style={styles.forgotImage}
          resizeMode="contain"
        />
      </View>

      <KeyboardAvoidingView
        style={styles.formWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.formContainer}>
          {!isSubmitted ? (
            <>
              
                <Text style={styles.title}>{t('Xác thực')}</Text>
              
              <View style={styles.titleContainer}>
                <View style={styles.inputContainer}>
                  <View style={styles.iconContainer}>
                    <Icon name="mail" size={24} color="#aaa" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={t('Nhập Email của bạn !')}
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.resetButtonText}>{t('Gửi')}</Text>
                  )}
                </TouchableOpacity>
              </View>
              
            </>
          ) : (
            <View style={styles.successContainer}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successTitle}>{t('Email Đã Gửi')}</Text>
              <Text style={styles.successMessage}>
                {t('Hướng dẫn đặt lại mật khẩu đã được gửi đến địa chỉ email của bạn. Vui lòng kiểm tra hộp thư đến.')}
              </Text>
              <TouchableOpacity
                style={styles.backToLoginButton}
                onPress={handleBackToLogin}
              >
                <Text style={styles.backToLoginText}>{t('Quay lại Đăng nhập')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
      
      {/* Custom Modal */}
      <Modal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        buttons={modalButtons}
        onClose={() => setModalVisible(false)}
      />
      
      {/* SplashScreen overlay when loading */}
      <SplashScreen isLoading={isLoading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  backButton: {
    padding: 8,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  forgotImage: {
    width: '80%',
    height: 180,
  },
  formWrapper: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 0,
  },
  titleContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: 'white',
    width: '100%',
    

  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 15,
    textAlign: 'center',
  },
  inputContainer: {
    marginLeft:'5%',
    width: '90%',
    marginTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 30,
    paddingHorizontal: 15,
    marginBottom: 30,
    height: 60,
  },
  iconContainer: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: 60,
  },
  resetButton: {
    backgroundColor: '#FF9800',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
    padding: 20,
  },
  successIcon: {
    fontSize: 50,
    color: '#4CAF50',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  backToLoginButton: {
    backgroundColor: '#FF9800',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  backToLoginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;
