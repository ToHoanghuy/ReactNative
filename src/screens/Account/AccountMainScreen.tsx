import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { RootState } from '../../redux/store';
import { AccountStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/useAuth';
import { switchNotification } from '../../api/accountApi';
import { updateNotificationSettings } from '../../redux/slices/userSlice';
import ToggleSwitch from '../../components/ToggleSwitch';

type NavigationProp = StackNavigationProp<AccountStackParamList, 'AccountMain'>;

const AccountMainScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const userProfile = useAppSelector((state: RootState) => state.user.profile);
  const { user, logout } = useAuth();
  const [isLoadingNotification, setIsLoadingNotification] = useState(false);

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

  const handleToggleNotification = async () => {
    try {
      setIsLoadingNotification(true);
      
      // Gọi API để thay đổi trạng thái thông báo
      const newNotificationState = !(userProfile?.emailNotificationsEnabled ?? false);
      const response = await switchNotification(newNotificationState);
      
      if (response.message === "User information updated successfully") {
        // Cập nhật redux store với trạng thái mới từ phản hồi API
        const notificationEnabled = response.isSubscription.emailNotificationsEnabled;
        dispatch(updateNotificationSettings(notificationEnabled));
        
        // Hiển thị thông báo thành công nếu cần
        console.log(`Notifications ${notificationEnabled ? 'enabled' : 'disabled'} successfully`);
      } else {
        // Xử lý khi không thành công
        Alert.alert(
          t('Error'),
          t('Failed to update notification settings. Please try again later.')
        );
      }
    } catch (error) {
      console.error('Toggle notification error:', error);
      Alert.alert(
        t('Error'),
        t('An error occurred while updating notification settings.')
      );
    } finally {
      setIsLoadingNotification(false);
    }
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
      isEnabled: userProfile?.emailNotificationsEnabled ?? false,
      onPress: handleToggleNotification,
      isLoading: isLoadingNotification,
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
      onPress: () => navigation.navigate('Package'),
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
            disabled={!item.onPress || (item.toggle && item.isLoading)}
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
                {/* {item.isLoading ? (
                  <ActivityIndicator size="small" color="#2196F3" />
                ) : ( */}
                  <ToggleSwitch
                    isEnabled={item.isEnabled}
                    onToggle={item.onPress}
                    disabled={item.isLoading}
                  />
                {/* )} */}
              </View>
            )}
          </TouchableOpacity>
        ))}
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
