import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { EventRegister } from 'react-native-event-listeners';

const TokenRefreshModal: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    // Listen for token refresh event
    const tokenRefreshListener = EventRegister.addEventListener('TOKEN_REFRESHED', (data: { newToken: string }) => {
      console.log('Token refreshed event received', data);
      setModalMessage('Phiên làm việc của bạn đã được tự động gia hạn để đảm bảo bạn không bị gián đoạn khi sử dụng ứng dụng.');
      setVisible(true);
    });
    
    // Listen for token refresh failure event
    const tokenRefreshFailedListener = EventRegister.addEventListener('TOKEN_REFRESH_FAILED', (data: { reason: string }) => {
      console.log('Token refresh failed event received', data);
      setModalMessage('Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ.');
      setVisible(true);
    });
    
    // Cleanup listeners on unmount
    return () => {
      EventRegister.removeEventListener(tokenRefreshListener as string);
      EventRegister.removeEventListener(tokenRefreshFailedListener as string);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    // If it was a token refresh failure, emit the AUTH_LOGOUT event
    if (modalMessage.includes('hết hạn')) {
      EventRegister.emit('AUTH_LOGOUT', { reason: 'token_expired' });
    }
  };

  return (
    <Modal
      visible={visible}
      title="Thông báo phiên làm việc"
      message={modalMessage}
      type="info"
      onClose={handleClose}
      buttons={[
        {
          text: 'Xác nhận',
          onPress: handleClose,
          type: 'primary',
        },
      ]}
    />
  );
};

export default TokenRefreshModal;
