import React, { useState, useEffect, useCallback } from 'react';
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
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList, RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { addAccount } from '../../redux/slices/accountsSlice';
import { usePersistentForm } from '../../components/PersistentFormManager';
import Modal from '../../components/Modal';
const Icon = require('react-native-vector-icons/Feather').default;

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

// Keys for storing form data
const REGISTER_FORM_STATE_KEY = 'REGISTER_FORM_STATE';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { login } = useAuth();
  const dispatch = useDispatch();
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [secondaryEmail, setSecondaryEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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

  // Load form data from persistent storage
  const handleFormDataLoaded = useCallback((data: any) => {
    if (data.name) setName(data.name);
    if (data.email) setEmail(data.email);
    if (data.password) setPassword(data.password);
    if (data.confirmPassword) setConfirmPassword(data.confirmPassword);
    if (data.phone) setPhone(data.phone);
    if (data.secondaryEmail) setSecondaryEmail(data.secondaryEmail);
    if (data.referralCode) setReferralCode(data.referralCode);
  }, []);

  const formData = {
    name,
    email,
    password,
    confirmPassword,
    phone,
    secondaryEmail,
    referralCode
  };

  const { clearForm } = usePersistentForm({
    formKey: REGISTER_FORM_STATE_KEY,
    formData,
    onLoad: handleFormDataLoaded,
    clearOnUnmount: false
  });

  // Tell React Navigation that we're on the Register screen when focused
  useFocusEffect(
    useCallback(() => {
      // Disable this to avoid navigation errors
      // AsyncStorage.setItem('AUTH_NAVIGATOR_INITIAL_ROUTE', 'Register');
      return () => {};
    }, [])
  );

  const handleRegister = async () => {
    // Form validation
    if (!name.trim()) {
      showModal(t('Error'), t('Name is required'), 'error');
      return;
    }

    if (!email.trim()) {
      showModal(t('Error'), t('Email is required'), 'error');
      return;
    }
    
    if (!phone.trim()) {
      showModal(t('Error'), t('Phone number is required'), 'error');
      return;
    }
    
    if (!password.trim()) {
      showModal(t('Error'), t('Password is required'), 'error');
      return;
    }

    if (password !== confirmPassword) {
      showModal(t('Error'), t('Passwords do not match'), 'error');
      return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showModal(t('Error'), t('Please enter a valid email address'), 'error');
      return;
    }
    
    // Phone format validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      showModal(t('Error'), t('Please enter a valid 10-digit phone number'), 'error');
      return;
    }
    
    // Password strength validation
    if (password.length < 6) {
      showModal(t('Error'), t('Password must be at least 6 characters long'), 'error');
      return;
    }
    
    // Check if email already exists
    const emailExists = accounts.some(account => account.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      showModal(t('Error'), t('Email already in use'), 'error');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Generate a unique ID
      const newId = (Math.max(0, ...accounts.map(a => parseInt(a.id))) + 1).toString();
      
      // Create new account object
      const newAccount = {
        id: newId,
        email: email.toLowerCase(),
        name: name,
        phone: phone,
        secondaryEmail: secondaryEmail,
        referralCode: referralCode,
        password: password
      };
      
      // Add a slight delay to simulate network request
      setTimeout(() => {
        // Add the new account to the store
        dispatch(addAccount(newAccount));
        
        // Create user object without password for auth
        const user = {
          id: newId,
          email: email.toLowerCase(),
          name: name,
          phone: phone,
          secondaryEmail: secondaryEmail,
          referralCode: referralCode
        };
        
        // Generate a mock token
        const mockToken = 'mock-jwt-token-' + Date.now();
        
        // Login the user
        login(mockToken, user);
        
        // Clear saved form data after successful registration
        clearForm();
        
        setIsLoading(false);
        
        // Show success message and navigate to Main screen
        showModal(
          t('Success'), 
          t('Registration completed successfully'),
          'success',
          [{ 
            text: 'OK', 
            // type: 'primary',
            onPress: () => {
              setModalVisible(false);
              // Navigate to Main screen on successful registration
              const rootNavigation = navigation.getParent();
              if (rootNavigation) {
                rootNavigation.navigate('Main');
              }
            }
          }]
        );
      }, 1500);
    } catch (error: any) {
      setIsLoading(false);
      showModal(t('Error'), t('Registration failed. Please try again.'), 'error');
      console.error('Registration error:', error);
      console.error('Registration error:', error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar backgroundColor="#2196F3" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Icon name="chevron-left" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo tài khoản</Text>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.formContainer}>
          {/* Tên người dùng */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Tên người dùng <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputWrapper}>
              <Icon name="user" size={20} color="#555" style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                placeholder="Tên người dùng"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Số điện thoại */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Số điện thoại <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputWrapper}>
              <Icon name="phone" size={20} color="#555" style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputWrapper}>
              <Icon name="mail" size={20} color="#555" style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Email phụ */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email phụ <Text style={styles.optionalText}>(Tùy chọn)</Text></Text>
            <View style={styles.inputWrapper}>
              <Icon name="mail" size={20} color="#555" style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email phụ"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={secondaryEmail}
                onChangeText={setSecondaryEmail}
              />
            </View>
          </View>

          {/* Mật khẩu */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Mật khẩu <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputWrapper}>
              <Icon name="lock" size={20} color="#555" style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={togglePasswordVisibility}
              >
                <Icon name={showPassword ? "eye" : "eye-off"} size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Xác nhận mật khẩu */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Xác nhận mật khẩu <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputWrapper}>
              <Icon name="lock" size={20} color="#555" style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={toggleConfirmPasswordVisibility}
              >
                <Icon name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Mã giới thiệu */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Mã giới thiệu <Text style={styles.optionalText}>(Tùy chọn)</Text></Text>
            <View style={styles.inputWrapper}>
              <Icon name="users" size={20} color="#555" style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mã giới thiệu"
                placeholderTextColor="#999"
                value={referralCode}
                onChangeText={setReferralCode}
              />
            </View>
          </View>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              Bằng cách tiếp tục bạn chấp nhận{' '}
              <Text style={styles.termsLink}>Chính sách bảo mật</Text>
              {' '}và{' '}
              <Text style={styles.termsLink}>Điều khoản sử dụng</Text>
              {' '}của chúng tôi
            </Text>
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Đăng ký</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formContainer: {
    paddingBottom: 30,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  required: {
    color: 'red',
    fontSize: 16,
  },
  optionalText: {
    color: 'white',
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputWrapper: {
    backgroundColor: 'white',
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#333',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  termsContainer: {
    marginVertical: 20,
  },
  termsText: {
    color: 'white',
    textAlign: 'center',
    lineHeight: 22,
  },
  termsLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  registerButton: {
    backgroundColor: '#FF9800',
    borderRadius: 30,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
