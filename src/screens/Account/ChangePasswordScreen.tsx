import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../../components/Modal';
const Icon = require('react-native-vector-icons/Feather').default;

type NavigationProp = StackNavigationProp<any>;

const ChangePasswordScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Show/hide password states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'info'>('info');
  const [modalButtons, setModalButtons] = useState<{
    text: string;
    onPress: () => void;
  }[]>([]);

  const showModal = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info',
    buttons: { text: string; onPress: () => void }[]
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalButtons(buttons);
    setModalVisible(true);
  };

  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangePassword = async () => {
    if (!formData.currentPassword.trim()) {
      showModal(
        t('Error'),
        t('Current password is required'),
        'error',
        [{ text: t('OK'), onPress: () => setModalVisible(false) }]
      );
      return;
    }

    if (!formData.newPassword.trim()) {
      showModal(
        t('Error'),
        t('New password is required'),
        'error',
        [{ text: t('OK'), onPress: () => setModalVisible(false) }]
      );
      return;
    }

    if (formData.newPassword.length < 6) {
      showModal(
        t('Error'),
        t('Password must be at least 6 characters'),
        'error',
        [{ text: t('OK'), onPress: () => setModalVisible(false) }]
      );
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showModal(
        t('Error'),
        t('Passwords do not match'),
        'error',
        [{ text: t('OK'), onPress: () => setModalVisible(false) }]
      );
      return;
    }

    try {
      setIsLoading(true);
      
      // Here you would typically call an API to change the password
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success
      showModal(
        t('Success'),
        t('Password changed successfully'),
        'success',
        [{ 
          text: t('OK'), 
          onPress: () => {
            setModalVisible(false);
            setFormData({
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            });
          }
        }]
      );
    } catch (error) {
      showModal(
        t('Error'),
        t('Failed to change password. Please try again.'),
        'error',
        [{ text: t('OK'), onPress: () => setModalVisible(false) }]
      );
      console.error('Password change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={30} color="#2196F3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Change Password')}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <Text style={styles.description}>
              {t('Enter your current password and create a new one')}
            </Text>

            {/* Current Password */}
            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <Icon name="lock" size={24} color="#aaa" />
              </View>
              <TextInput
                style={styles.input}
                value={formData.currentPassword}
                onChangeText={(value) => handleInputChange('currentPassword', value)}
                placeholder={t('Current Password')}
                placeholderTextColor="#aaa"
                secureTextEntry={!showCurrentPassword}
              />
              <TouchableOpacity 
                style={styles.visibilityIcon}
                onPress={toggleCurrentPasswordVisibility}
              >
                <Icon name={showCurrentPassword ? 'eye-off' : 'eye'} size={24} color="#aaa" />
              </TouchableOpacity>
            </View>

            {/* New Password */}
            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <Icon name="lock" size={24} color="#aaa" />
              </View>
              <TextInput
                style={styles.input}
                value={formData.newPassword}
                onChangeText={(value) => handleInputChange('newPassword', value)}
                placeholder={t('New Password')}
                placeholderTextColor="#aaa"
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity 
                style={styles.visibilityIcon}
                onPress={toggleNewPasswordVisibility}
              >
                <Icon name={showNewPassword ? 'eye-off' : 'eye'} size={24} color="#aaa" />
              </TouchableOpacity>
            </View>

            {/* Confirm New Password */}
            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <Icon name="lock" size={24} color="#aaa" />
              </View>
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                placeholder={t('Confirm New Password')}
                placeholderTextColor="#aaa"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity 
                style={styles.visibilityIcon}
                onPress={toggleConfirmPasswordVisibility}
              >
                <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} color="#aaa" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.changeButton} 
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.changeButtonText}>{t('Change Password')}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>{t('Password Requirements:')}</Text>
              <Text style={styles.requirement}>• {t('At least 6 characters long')}</Text>
              <Text style={styles.requirement}>• {t('Must contain letters and numbers')}</Text>
              <Text style={styles.requirement}>• {t('Cannot be the same as current password')}</Text>
            </View>
          </View>
        </ScrollView>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerPlaceholder: {
    width: 46, // Same width as back button to center the title
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  form: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#fafafa',
    paddingHorizontal: 4,
  },
  iconContainer: {
    padding: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  visibilityIcon: {
    padding: 12,
  },
  changeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    elevation: 2,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  changeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  passwordRequirements: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  requirement: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
});

export default ChangePasswordScreen;
