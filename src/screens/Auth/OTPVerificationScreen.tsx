import React, { useState, useEffect } from 'react';
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
import { AuthStackParamList } from '../../types/navigation';
import Modal from '../../components/Modal';
import SplashScreen from '../../components/SplashScreen';
const Icon = require('react-native-vector-icons/Feather').default;

type NavigationProp = StackNavigationProp<AuthStackParamList, 'OTPVerification'>;
type OTPVerificationScreenRouteProp = RouteProp<AuthStackParamList, 'OTPVerification'>;

interface Props {
  route: OTPVerificationScreenRouteProp;
}

const OTPVerificationScreen: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { email } = route.params;
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

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

  // Refs for text inputs
  const inputs = React.useRef<Array<TextInput | null>>([]);
  
  // Countdown timer for OTP resend
  useEffect(() => {
    if (timeLeft === 0) {
      setCanResend(true);
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleOtpChange = (text: string, index: number) => {
    // Make sure we only get one character
    const newOtp = [...otp];
    newOtp[index] = text.slice(0, 1);
    setOtp(newOtp);
    
    // Auto focus next input if there's a value
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    // Auto focus previous input on delete
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };
  
  const handleResendOtp = () => {
    if (!canResend) return;
    
    // Reset the timer and resend state
    setTimeLeft(60);
    setCanResend(false);
    
    // Simulate OTP resend
    showModal(t('Success'), t('A new OTP has been sent to your email'), 'success');
  };

  const handleVerifyOtp = () => {
    const otpString = otp.join('');
    
    // Check if OTP is complete
    if (otpString.length !== 6) {
      showModal(t('Error'), t('Please enter the 6-digit OTP'), 'error');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate OTP verification (in a real app, this would be an API call)
    setTimeout(() => {
      setIsLoading(false);
      
      // Successful OTP verification
      navigation.navigate('SetupNewPassword', { email, otp: otpString });
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
        <Text style={styles.title}>{t('OTP Verification')}</Text>
        <Text style={styles.description}>
          {t('Enter the 6-digit code sent to')} {email}
        </Text>
        
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => {
                if (ref) inputs.current[index] = ref;
              }}
              style={styles.otpInput}
              value={digit}
              onChangeText={text => handleOtpChange(text, index)}
              onKeyPress={e => handleOtpKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={index === 0}
            />
          ))}
        </View>
        
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {canResend 
              ? t('Didn\'t receive the code?') 
              : t('Resend code in {{time}}s', { time: timeLeft })}
          </Text>
          {canResend && (
            <TouchableOpacity onPress={handleResendOtp}>
              <Text style={styles.resendButton}>{t('Resend')}</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.verifyButton}
          onPress={handleVerifyOtp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>{t('Verify')}</Text>
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
      
      {/* SplashScreen overlay when loading */}
      <SplashScreen isLoading={isLoading} />
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 45,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    fontSize: 24,
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 14,
    color: 'white',
  },
  resendButton: {
    marginLeft: 5,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  verifyButton: {
    backgroundColor: '#FF9800',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OTPVerificationScreen;
