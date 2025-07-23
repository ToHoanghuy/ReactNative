import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../hooks/redux';
import { RootState } from '../../redux/store';
import { AccountStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/useAuth';

type NavigationProp = StackNavigationProp<AccountStackParamList, 'AccountMain'>;

const AccountMainScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const userProfile = useAppSelector((state: RootState) => state.user.profile);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      t('Logout'),
      t('Are you sure you want to logout?'),
      [
        {
          text: t('Cancel'),
          style: 'cancel',
        },
        {
          text: t('Logout'),
          onPress: () => logout(),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const menuItems = [
    {
      title: t('Personal Information'),
      icon: '👤',
      onPress: () => navigation.navigate('PersonalInfo'),
    },
    {
      title: t('Notifications'),
      icon: '🔔',
      toggle: true,
    },
    {
      title: t('Change Password'),
      icon: '🔑',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      title: t('Change Language'),
      icon: '🌐',
      onPress: () => navigation.navigate('ChangeLanguage'),
    },
    {
      title: t('Package'),
      icon: '🎁',
    },
    {
      title: t('Contact Us'),
      icon: '📞',
    },
    {
      title: t('Privacy Policy'),
      icon: '🔒',
    },
    {
      title: t('Logout'),
      icon: '🚪',
      onPress: handleLogout,
      color: '#FF5252',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header with welcome message */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>{t('Chào mừng,')}</Text>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
      </View>

      {/* Menu Items in a Card Layout */}
      <View style={styles.menuCardsContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuCard, 
              item.color ? { borderColor: item.color + '20', borderWidth: 1 } : null
            ]}
            onPress={item.onPress}
            disabled={!item.onPress}
          >
            <View style={styles.menuCardContent}>
              <View style={[
                styles.iconContainer,
                item.color ? { backgroundColor: item.color + '20' } : null
              ]}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <Text style={[
                styles.menuTitle, 
                item.color ? { color: item.color } : null
              ]}>
                {item.title}
              </Text>
            </View>
            
            {item.toggle && (
              <View style={styles.toggleContainer}>
                <View style={styles.toggle}>
                  <View style={styles.toggleCircle} />
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
        
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
        
        {/* Logout */}
        <TouchableOpacity 
          style={[styles.menuCard, { borderColor: '#ffebee', borderWidth: 1 }]}
          onPress={handleLogout}>
          <View style={styles.menuCardContent}>
            <View style={[styles.iconContainer, { backgroundColor: '#ffebee' }]}>
              <Text style={styles.menuIcon}>�</Text>
            </View>
            <Text style={[styles.menuTitle, { color: '#F44336' }]}>{t('Logout')}</Text>
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
    backgroundColor: '#2196F3',
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
