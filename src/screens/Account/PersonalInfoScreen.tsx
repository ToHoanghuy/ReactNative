import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../hooks/redux';
import { RootState } from '../../redux/store';
import { updateUserProfile } from '../../redux/slices/userSlice';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../../components/Modal';
const Icon = require('react-native-vector-icons/Feather').default;

const PersonalInfoScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const userProfile = useAppSelector((state: RootState) => state.user.profile);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || userProfile?.name || '',
    email: user?.email || userProfile?.email || '',
    phone: userProfile?.phone || '',
    gender: 'male', // Default gender
    age: '0',
    weight: 'lbs',
    height: 'ft',
  });
  
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

  // Update form data when user info changes
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        name: user.name || prevData.name,
        email: user.email || prevData.email,
      }));
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showModal(t('Error'), t('Name is required'), 'error');
      return;
    }

    if (!formData.email.trim()) {
      showModal(t('Error'), t('Email is required'), 'error');
      return;
    }

    try {
      setIsLoading(true);
      
      // Update local user profile in Redux
      dispatch(updateUserProfile(formData));
      
      // Update auth user info in Redux and storage
      if (user) {
        updateUser({
          name: formData.name,
          email: formData.email,
        });
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showModal(t('Success'), t('Profile updated successfully'), 'success');
    } catch (error) {
      showModal(t('Error'), t('Failed to update profile. Please try again.'), 'error');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectGender = (gender: 'male' | 'female') => {
    setFormData(prev => ({
      ...prev,
      gender
    }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar backgroundColor="#2196F3" barStyle="light-content" />
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Icon name="chevron-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('Tài khoản')}</Text>
          <TouchableOpacity style={styles.editButton}>
            <Icon name="edit-2" size={20} color="#000" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.form}>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{t('Tên người dùng')}:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder={t('Nhập tên của bạn')}
                placeholderTextColor="#999"
              />
            </View>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{t('Số điện thoại')}:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder={t('Nhập số điện thoại')}
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{t('Email')}:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder={t('Nhập email')}
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{t('Vai trò')}:</Text>
            <Text style={styles.fieldValue}>user</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Giới tính')}</Text>
            <Text style={styles.sectionDescription}>{t('Giới tính chỉ được chọn một lần duy nhất. Bạn không thể thay đổi giới tính của mình sau khi đã chọn.')}</Text>
            
            <View style={styles.genderSelectionContainer}>
              <TouchableOpacity 
                style={[
                  styles.genderOption, 
                  formData.gender === 'male' ? styles.genderOptionSelected : {}
                ]}
                onPress={() => selectGender('male')}
              >
                <Image 
                  source={require('../../assets/images/gender-male.png')} 
                  style={styles.genderImage} 
                  resizeMode="contain"
                />
                <Text style={styles.genderLabel}>{t('Nam')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.genderOption, 
                  formData.gender === 'female' ? styles.genderOptionSelected : {}
                ]}
                onPress={() => selectGender('female')}
              >
                <Image 
                  source={require('../../assets/images/gender-female.png')} 
                  style={styles.genderImage} 
                  resizeMode="contain"
                />
                <Text style={styles.genderLabel}>{t('Nữ')}</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Độ tuổi')}</Text>
            <View style={styles.valueWithUnitContainer}>
              <TextInput
                style={styles.valueInput}
                value={formData.age}
                onChangeText={(value) => handleInputChange('age', value)}
                keyboardType="numeric"
              />
              <Text style={styles.unitText}>y</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Cân nặng')}</Text>
            <View style={styles.valueWithUnitContainer}>
              <TextInput
                style={styles.valueInput}
                value={formData.weight}
                onChangeText={(value) => handleInputChange('weight', value)}
                keyboardType="numeric"
              />
              <Text style={styles.unitText}>lbs</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Chiều cao')}</Text>
            <View style={styles.valueWithUnitContainer}>
              <TextInput
                style={styles.valueInput}
                value={formData.height}
                onChangeText={(value) => handleInputChange('height', value)}
                keyboardType="numeric"
              />
              <Text style={styles.unitText}>ft</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.saveButtonText}>{t('Nâng cấp')}</Text>
              <Icon name="arrow-up" size={18} color="#fff" style={{marginLeft: 5}} />
            </View>
           
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 30,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    backgroundColor: '#f5f5f5',
  },
  fieldContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  fieldLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  fieldValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  inputContainer: {
    flex: 2,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: '#000',
    textAlign: 'right',
    paddingVertical: 4,
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  genderSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  genderOption: {
    width: '48%',
    height: 180,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
  },
  genderOptionSelected: {
    borderColor: '#2196F3',
    borderWidth: 2,
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
  },
  genderImage: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  genderLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  valueWithUnitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  valueInput: {
    fontSize: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 8,
    width: '20%',
    textAlign: 'right',
    color: '#000',
  },
  unitText: {
    marginLeft: 8,
    fontSize: 20,
    color: '#2196F3',
    fontWeight: 'bold',
    width: 50,
    textAlign: 'right',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 40,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PersonalInfoScreen;
