import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList, RootStackParamList } from '../../types/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import Modal from '../../components/Modal';
const Icon = require('react-native-vector-icons/Feather').default;

type NavigationProp = StackNavigationProp<AuthStackParamList, 'SetupNewPassword'>;
type RootNavigationProp = StackNavigationProp<RootStackParamList>;
type SetupNewPasswordScreenRouteProp = RouteProp<AuthStackParamList, 'SetupNewPassword'>;

interface Props {
  route: SetupNewPasswordScreenRouteProp;
}

const SetupNewPasswordScreen: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation<NavigationProp>();
  const rootNavigation = useNavigation<RootNavigationProp>();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { email, otp } = route.params;
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleResetPassword = () => {
    // Form validation
    if (!newPassword.trim()) {
      showModal(t('Error'), t('New password is required'), 'error');
      return;
    }

    if (newPassword.length < 6) {
      showModal(t('Error'), t('Password must be at least 6 characters'), 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showModal(t('Error'), t('Passwords do not match'), 'error');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate password reset process (in a real app, this would be an API call)
    setTimeout(() => {
      setIsLoading(false);
      
      // Show success message
      showModal(
        t('Success'),
        t('Your password has been reset successfully.'),
        'success',
        [
          {
            text: 'OK',
            // type: 'primary',
            onPress: () => {
              setModalVisible(false);
              // Navigate to login screen
              navigation.navigate('Login');
            }
          }
        ]
      );
    }, 1500);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2196F3" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.contentContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.title}>{t('Setup New Password')}</Text>
        <Text style={styles.description}>
          {t('Create a new password for your account')}
        </Text>
        
        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Icon name="lock" size={24} color="#aaa" />
          </View>
          <TextInput
            style={styles.input}
            placeholder={t('New Password')}
            secureTextEntry={!showNewPassword}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity 
            style={styles.visibilityIcon}
            onPress={toggleNewPasswordVisibility}
          >
            <Icon name={showNewPassword ? 'eye-off' : 'eye'} size={24} color="#aaa" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Icon name="lock" size={24} color="#aaa" />
          </View>
          <TextInput
            style={styles.input}
            placeholder={t('Confirm New Password')}
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity 
            style={styles.visibilityIcon}
            onPress={toggleConfirmPasswordVisibility}
          >
            <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} color="#aaa" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={handleResetPassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.resetButtonText}>{t('Reset Password')}</Text>
          )}
        </TouchableOpacity>
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
    backgroundColor: '#2196F3',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#2196F3',
  },
  backButton: {
    padding: 10,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    backgroundColor: '#2196F3',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'white',
  },
  description: {
    fontSize: 16,
    color: 'white',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
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
  input: {
    flex: 1,
    height: 60,
    fontSize: 16,
    color: '#333',
  },
  visibilityIcon: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#FF9800',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SetupNewPasswordScreen;
