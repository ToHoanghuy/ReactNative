import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../hooks/redux';
import { RootState } from '../../redux/store';
import { AccountStackParamList } from '../../types/navigation';

type NavigationProp = StackNavigationProp<AccountStackParamList, 'AccountMain'>;

const AccountMainScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const userProfile = useAppSelector((state: RootState) => state.user.profile);

  const menuItems = [
    {
      title: t('Personal Information'),
      icon: '👤',
      onPress: () => navigation.navigate('PersonalInfo'),
    },
    {
      title: t('Change Language'),
      icon: '🌐',
      onPress: () => navigation.navigate('ChangeLanguage'),
    },
    {
      title: t('Change Password'),
      icon: '🔒',
      onPress: () => navigation.navigate('ChangePassword'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header with welcome message */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>{t('Chào mừng,')}</Text>
        <Text style={styles.userName}>{userProfile?.name || 'Huyyyy'}</Text>
      </View>

      {/* Menu Items in a Card Layout */}
      <View style={styles.menuCardsContainer}>
        {/* Personal Information */}
        <TouchableOpacity 
          style={styles.menuCard}
          onPress={() => navigation.navigate('PersonalInfo')}>
          <View style={styles.menuCardContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.menuIcon}>📋</Text>
            </View>
            <Text style={styles.menuTitle}>{t('Thông tin cá nhân')}</Text>
          </View>
        </TouchableOpacity>
        
        {/* Notifications */}
        <TouchableOpacity style={styles.menuCard}>
          <View style={styles.menuCardContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.menuIcon}>🔔</Text>
            </View>
            <Text style={styles.menuTitle}>{t('Thông báo')}</Text>
          </View>
          <View style={styles.toggleContainer}>
            <View style={styles.toggle}>
              <View style={styles.toggleCircle} />
            </View>
          </View>
        </TouchableOpacity>
        
        {/* Change Password */}
        <TouchableOpacity 
          style={styles.menuCard}
          onPress={() => navigation.navigate('ChangePassword')}>
          <View style={styles.menuCardContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.menuIcon}>🔑</Text>
            </View>
            <Text style={styles.menuTitle}>{t('Đổi mật khẩu')}</Text>
          </View>
        </TouchableOpacity>
        
        {/* Change Language */}
        <TouchableOpacity 
          style={styles.menuCard}
          onPress={() => navigation.navigate('ChangeLanguage')}>
          <View style={styles.menuCardContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.menuIcon}>🌐</Text>
            </View>
            <Text style={styles.menuTitle}>{t('Ngôn ngữ')}</Text>
          </View>
        </TouchableOpacity>
        
        {/* Package */}
        <TouchableOpacity style={styles.menuCard}>
          <View style={styles.menuCardContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.menuIcon}>🎁</Text>
            </View>
            <Text style={styles.menuTitle}>{t('Gói')}</Text>
          </View>
        </TouchableOpacity>
        
        {/* Contact Us */}
        <TouchableOpacity style={styles.menuCard}>
          <View style={styles.menuCardContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.menuIcon}>📞</Text>
            </View>
            <Text style={styles.menuTitle}>{t('Liên hệ với chúng tôi')}</Text>
          </View>
        </TouchableOpacity>
        
        {/* Privacy Policy */}
        <TouchableOpacity style={styles.menuCard}>
          <View style={styles.menuCardContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.menuIcon}>🔒</Text>
            </View>
            <Text style={styles.menuTitle}>{t('Chính sách bảo mật')}</Text>
          </View>
        </TouchableOpacity>
        
        {/* Health Information Sources */}
        <TouchableOpacity style={styles.menuCard}>
          <View style={styles.menuCardContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.menuIcon}>📚</Text>
            </View>
            <Text style={styles.menuTitle}>{t('Nguồn Thông Tin Sức Khỏe')}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#006D5B',
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  welcomeText: {
    color: 'white',
    fontSize: 22,
    marginBottom: 5,
    fontWeight: '500',
  },
  userName: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  menuCardsContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  menuCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuIcon: {
    fontSize: 24,
  },
  menuTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#666',
    justifyContent: 'center',
    paddingHorizontal: 2,
    alignItems: 'flex-end',
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  appVersion: {
    fontSize: 14,
    color: '#999',
  },
});

export default AccountMainScreen;
