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
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { RootState } from '../../redux/store';
import { updateUserProfile } from '../../redux/slices/userSlice';
// Import the direct API function with an alias to avoid naming conflicts
import { updateProfile as updateProfileAPI, ProfileUpdateData } from '../../api/accountApi';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../../components/Modal';
const Icon = require('react-native-vector-icons/Feather').default;

const PersonalInfoScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { user, updateUser, updateProfile } = useAuth();
  const navigation = useNavigation();
  const userProfile = useAppSelector((state: RootState) => state.user.profile);
  const authProfile = useAppSelector((state: RootState) => state.auth.profile);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || userProfile?.name || '',
    email: user?.email || userProfile?.email || '',
    phone: userProfile?.phone || '',
    gender: authProfile?.gender || 'male', // Default gender, but use from auth if available
    age: authProfile?.age !== undefined ? authProfile.age.toString() : '0',
    weight: authProfile?.weight !== undefined ? authProfile.weight.toString() : '0',
    height: authProfile?.height !== undefined ? authProfile.height.toString() : '0',
    role: user?.role || '',
    smokingStatus: authProfile?.smokingStatus !== undefined ? authProfile.smokingStatus.toString() : '0'
  });
  
  // Trạng thái cho phép chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);
  
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
    // For numeric fields, validate that input is a number
    if (['age', 'weight', 'height'].includes(field)) {
      // Only allow numeric input (can be empty for backspace)
      if (value === '' || /^\d+$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          [field]: value,
        }));
      }
    } else if (field === 'smokingStatus') {
      // Smoking status can only be 0 or 1
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    } else {
      // For non-numeric fields
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = async () => {
    // Validate numeric fields
    if (formData.age && !/^\d+$/.test(formData.age)) {
      showModal(t('Error'), t('Độ tuổi phải là số'), 'error');
      return;
    }

    if (formData.weight && !/^\d+$/.test(formData.weight)) {
      showModal(t('Error'), t('Cân nặng phải là số'), 'error');
      return;
    }

    if (formData.height && !/^\d+$/.test(formData.height)) {
      showModal(t('Error'), t('Chiều cao phải là số'), 'error');
      return;
    }

    try {
      setIsLoading(true);
      
      // Update local user profile in Redux
      dispatch(updateUserProfile(formData));
      
      // Prepare profile data for API call
      const profileData: ProfileUpdateData = {
        height: parseInt(formData.height) || 0,
        weight: parseInt(formData.weight) || 0,
        age: parseInt(formData.age) || 0,
        gender: formData.gender,
        smokingStatus: parseInt(formData.smokingStatus) || 0,
      };
      
      // Call the API directly to update profile
      if (user?.id) {
        // Log the data being sent to API
        console.log('Sending profile data to API:', profileData);
        
        // Call updateProfile API directly with the renamed function
        const response = await updateProfileAPI(profileData);
        console.log('API response:', response);
        
        if (response.message === "User information updated successfully") {
          // API call was successful - update local profile state with data from API
          const profileUpdates = {
            height: response.data.height,
            weight: response.data.weight,
            age: response.data.age,
            gender: response.data.gender,
            smokingStatus: response.data.smokingStatus
          };
          
          // Update profile data in auth state with the returned data from API
          updateProfile(profileUpdates);
          
          setIsLoading(false);
          setIsEditing(false);
          showModal(t('Success'), t('Cập nhật thông tin người dùng thành công'), 'success');
        } else {
          // API returned a different message
          setIsLoading(false);
          showModal(t('Error'), response.message || t('Failed to update profile'), 'error');
        }
      } else {
        // Fallback if no user ID (should not happen in normal flow)
        setIsLoading(false);
        setIsEditing(false);
        showModal(t('Error'), t('User ID not found. Please log in again.'), 'error');
      }
    } catch (error: any) {
      setIsLoading(false);
      // Get message from error object if available
      const errorMessage = error.message || t('An unexpected error occurred. Please try again.');
      showModal(t('Error'), errorMessage, 'error');
      console.error('Profile update error:', error);
    }
  };

  const selectGender = (gender: 'male' | 'female') => {
    // Only allow gender selection if it hasn't been set before
    // Consider gender as set if authProfile.gender exists and matches formData.gender
    const isGenderAlreadySet = authProfile?.gender && authProfile.gender === formData.gender;
    
    if (!isGenderAlreadySet) {
      setFormData(prev => ({
        ...prev,
        gender
      }));
    } else {
      showModal(
        t('Không thể thay đổi giới tính'), 
        t('Giới tính chỉ được thiết lập một lần và không thể thay đổi sau đó.'), 
        'info'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('Tài khoản')}</Text>
          <TouchableOpacity 
            style={[styles.editButton, isEditing && styles.editButtonActive]} 
            onPress={() => {
              if (isEditing) {
                // If currently editing, call handleSave when pressed
                handleSave();
              } else {
                // If not editing, just toggle edit mode
                setIsEditing(true);
              }
            }}
            disabled={isLoading}
          >
            {isLoading && isEditing ? (
              <ActivityIndicator size="small" color="#2196F3" />
            ) : (
              <Icon name={isEditing ? "check" : "edit-2"} size={20} color={isEditing ? "#2196F3" : "#000"} />
            )}
          </TouchableOpacity>
        </View>
      {/* <StatusBar backgroundColor="#2196F3" barStyle="light-content" /> */}
      <ScrollView>
        
        
        <View style={styles.form}>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{t('Tên người dùng')}:</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.fieldValue}>{formData.name}</Text>
            </View>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{t('Số điện thoại')}:</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.fieldValue}>{formData.phone || '-'}</Text>
            </View>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{t('Email')}:</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.fieldValue}>{formData.email}</Text>
            </View>
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{t('Vai trò')}:</Text>
            <Text style={styles.fieldValue}>{user?.role}</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Giới tính')}</Text>
            {isEditing && (
              <Text style={styles.sectionDescription}>
                {authProfile?.gender 
                  ? t('Giới tính đã được chọn và không thể thay đổi.') 
                  : t('Giới tính chỉ được chọn một lần duy nhất. Bạn không thể thay đổi giới tính của mình sau khi đã chọn.')}
              </Text>
            )}
            
            <View style={styles.genderSelectionContainer}>
              <TouchableOpacity 
                style={[
                  styles.genderOption, 
                  formData.gender === 'male' ? styles.genderOptionSelected : {},
                  authProfile?.gender ? {opacity: 0.7} : {}
                ]}
                onPress={() => isEditing && !authProfile?.gender && selectGender('male')}
                disabled={!isEditing || !!authProfile?.gender}
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
                  formData.gender === 'female' ? styles.genderOptionSelected : {},
                  authProfile?.gender ? {opacity: 0.7} : {}
                ]}
                onPress={() => isEditing && !authProfile?.gender && selectGender('female')}
                disabled={!isEditing || !!authProfile?.gender}
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
              {isEditing ? (
                <TextInput
                  style={styles.valueInput}
                  value={formData.age}
                  onChangeText={(value) => handleInputChange('age', value)}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={[styles.valueInput, styles.readOnlyValue]}>{formData.age}</Text>
              )}
              <Text style={styles.unitText}>y</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Cân nặng')}</Text>
            <View style={styles.valueWithUnitContainer}>
              {isEditing ? (
                <TextInput
                  style={styles.valueInput}
                  value={formData.weight}
                  onChangeText={(value) => handleInputChange('weight', value)}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={[styles.valueInput, styles.readOnlyValue]}>{formData.weight}</Text>
              )}
              <Text style={styles.unitText}>lbs</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Chiều cao')}</Text>
            <View style={styles.valueWithUnitContainer}>
              {isEditing ? (
                <TextInput
                  style={styles.valueInput}
                  value={formData.height}
                  onChangeText={(value) => handleInputChange('height', value)}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={[styles.valueInput, styles.readOnlyValue]}>{formData.height}</Text>
              )}
              <Text style={styles.unitText}>ft</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Smoking Status')}</Text>
            <View style={styles.valueWithUnitContainer}>
              {isEditing ? (
                <View style={{flexDirection: 'row', justifyContent: 'space-around', width: '100%'}}>
                  <TouchableOpacity 
                    style={[
                      styles.smokingOption, 
                      formData.smokingStatus === '0' ? styles.smokingOptionSelected : {}
                    ]}
                    onPress={() => handleInputChange('smokingStatus', '0')}
                  >
                    <Text style={[
                      styles.smokingOptionText, 
                      formData.smokingStatus === '0' ? styles.smokingOptionTextSelected : {}
                    ]}>
                      {t('Không')}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.smokingOption, 
                      formData.smokingStatus !== '0' ? styles.smokingOptionSelected : {}
                    ]}
                    onPress={() => handleInputChange('smokingStatus', '1')}
                  >
                    <Text style={[
                      styles.smokingOptionText, 
                      formData.smokingStatus !== '0' ? styles.smokingOptionTextSelected : {}
                    ]}>
                      {t('Có')}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={styles.fieldValue}>
                    {parseInt(formData.smokingStatus) === 0 
                      ? t('Không hút thuốc') 
                      : t('Có hút thuốc')}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Remove the save button as saving is now handled by the check button in the header */}
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
  editButtonActive: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 20,
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
  readOnlyValue: {
    borderBottomWidth: 0,
    padding: 0,
    color: '#000',
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
  smokingOption: {
    width: '40%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  smokingOptionSelected: {
    borderColor: '#2196F3',
    borderWidth: 2,
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
  },
  smokingOptionText: {
    fontSize: 18,
    color: '#666',
  },
  smokingOptionTextSelected: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
});

export default PersonalInfoScreen;
