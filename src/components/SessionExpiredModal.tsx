import React, { useEffect, useState } from 'react';
import { Modal, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { EventRegister } from 'react-native-event-listeners';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

/**
 * A modal component that shows when the session has expired
 * and the user needs to log in again
 */
const SessionExpiredModal = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  const navigation = useNavigation();
  const { logout } = useAuth();

  useEffect(() => {
    // Listen for session expired events
    const sessionExpiredListener = EventRegister.addEventListener(
      'SESSION_EXPIRED',
      (data: any) => {
        console.log('SESSION_EXPIRED event received:', data);
        if (data?.message) {
          setMessage(data.message);
        }
        setVisible(true);
      }
    );

    return () => {
      // Clean up listener when component unmounts
      EventRegister.removeEventListener(sessionExpiredListener as string);
    };
  }, []);

  const handleOkPress = async () => {
    setVisible(false);
    
    // Log the user out and navigate to login screen
    await logout();
    
    // Navigate to login screen
    // Use setTimeout to allow the modal to close before navigation
    setTimeout(() => {
      // @ts-ignore - TypeScript might complain about the navigation type
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' as never }],
      });
    }, 100);
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.title}>Thông báo</Text>
          <Text style={styles.message}>{message}</Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={handleOkPress}
          >
            <Text style={styles.buttonText}>Đăng nhập lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  message: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#555',
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    elevation: 2,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SessionExpiredModal;
