import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../hooks/redux';
import { RootState } from '../../redux/store';
import { changeLanguage } from '../../redux/slices/userSlice';
import { changeLanguage as changeLanguageAPI } from '../../api/userApi';
import i18n from '../../i18n';
import Modal from '../../components/Modal';

const Icon = require('react-native-vector-icons/Feather').default;

const ChangeLanguageScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const currentLanguage = useAppSelector(
    (state: RootState) => state.user.profile?.language || 'vn'
  );

  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const languages = [
    { code: 'en', flag: '🇺🇸' },
    { code: 'vn', flag: '🇻🇳' },
  ];

  const handleLanguageChange = (languageCode: 'en' | 'vn') => {
    setSelectedLanguage(languageCode);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      // Call API to change language on server
      const response = await changeLanguageAPI(selectedLanguage);
      
      // If API call is successful, update Redux store and change i18n language
      if (response.message === "User information updated successfully") {
        // Lấy ngôn ngữ từ phản hồi API
        const serverLanguage = response.isChangeLanguage?.language || selectedLanguage;
        
        // Update Redux store
        dispatch(changeLanguage(selectedLanguage));
        
        // Change i18n language
        i18n.changeLanguage(selectedLanguage);
        
        // Show success modal
        setModalVisible(true);
      } else {
        // Handle API failure
        setErrorMessage(response.message || t('Thay đổi ngôn ngữ thất bại'));
      }
    } catch (error: any) {
      console.error('Language change error:', error);
      setErrorMessage(error.message || t('Đã xảy ra lỗi khi thay đổi ngôn ngữ'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  const handleErrorClose = () => {
    setErrorMessage('');
  };

  const handleBack = () => navigation.goBack();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('Select Language')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Language List */}
      <View style={styles.languageList}>
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageItem,
              selectedLanguage === language.code && styles.selectedLanguageItem,
            ]}
            onPress={() => handleLanguageChange(language.code as 'en' | 'vn')}
          >
            <View style={styles.languageInfo}>
              <Text style={styles.flag}>{language.flag}</Text>
              <Text
                style={[
                  styles.languageName,
                  selectedLanguage === language.code && styles.selectedLanguageName,
                ]}
              >
                {language.code === 'en' ? t('English') : t('Tiếng Việt')}
              </Text>
            </View>
            {selectedLanguage === language.code && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Save Button */}
      <TouchableOpacity 
        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
        onPress={handleSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.saveButtonText}>{t('Save Changes')}</Text>
        )}
      </TouchableOpacity>

      {/* Success Modal */}
      <Modal
        visible={modalVisible}
        title={t('Success')}
        message={t('Language changed successfully')}
        onClose={handleCloseModal}
        type="success"
        buttons={[
          {
            text: t('OK'),
            onPress: handleCloseModal,
            type: 'primary'
          }
        ]}
      />

      {/* Error Modal */}
      <Modal
        visible={!!errorMessage}
        title={t('Error')}
        message={errorMessage}
        onClose={handleErrorClose}
        type="error"
        buttons={[
          {
            text: t('OK'),
            onPress: handleErrorClose,
            type: 'primary'
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40, // Cân bằng với nút back
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  languageList: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedLanguageItem: {
    backgroundColor: '#e3f2fd',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    color: '#333',
  },
  selectedLanguageName: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  checkmark: {
    fontSize: 20,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
    justifyContent: 'center',
    height: 54,
  },
  saveButtonDisabled: {
    backgroundColor: '#84c0f7',
    opacity: 0.8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangeLanguageScreen;
