import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal as RNModal,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  Image
} from 'react-native';
const Icon = require('react-native-vector-icons/Feather').default;

interface ModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  buttons?: {
    text: string;
    onPress: () => void;
    type?: 'default' | 'primary' | 'danger';
    customStyle?: any;
  }[];
  type?: 'success' | 'error' | 'info' | 'scan-tips';
  customIcon?: React.ReactNode;
  footerMessage?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  visible, 
  title, 
  message, 
  onClose, 
  buttons = [{ text: 'OK', onPress: onClose }],
  type = 'info',
  customIcon,
  footerMessage
}) => {
  // Get icon based on type
  const getIcon = () => {
    if (customIcon) {
      return customIcon;
    }
    
    switch (type) {
      case 'success':
        return <Icon name="check-circle" size={50} color="#4CAF50" />;
      case 'error':
        return <Icon name="alert-circle" size={50} color="#F44336" />;
      default:
        return <Icon name="info" size={50} color="#2196F3" />;
    }
  };

  return (
    <RNModal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[
              styles.modalContainer,
              type === 'scan-tips' && styles.scanTipsContainer
            ]}>
              <View style={styles.iconContainer}>
                {getIcon()}
              </View>
              
              <Text style={[
                styles.title,
                type === 'scan-tips' && styles.scanTipsTitle
              ]}>{title}</Text>
              
              <Text style={[
                styles.message,
                type === 'scan-tips' && styles.scanTipsMessage
              ]}>{message}</Text>
              
              {footerMessage && (
                <View style={styles.footerContainer}>
                  <Icon name="lock" size={16} color="#666" style={styles.footerIcon} />
                  <Text style={styles.footerMessage}>{footerMessage}</Text>
                </View>
              )}
              
              <View style={styles.buttonContainer}>
                {buttons.map((button, index) => {
                  let buttonStyle = styles.defaultButton;
                  let textStyle = styles.defaultButtonText;
                  
                  if (button.type === 'primary') {
                    buttonStyle = styles.primaryButton;
                    textStyle = styles.primaryButtonText;
                  } else if (button.type === 'danger') {
                    buttonStyle = styles.dangerButton;
                    textStyle = styles.dangerButtonText;
                  }
                  
                  // Apply custom styles if provided
                  if (button.customStyle) {
                    buttonStyle = { ...buttonStyle, ...button.customStyle };
                  }
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        buttonStyle, 
                        index !== 0 && styles.buttonMargin,
                        type === 'scan-tips' && styles.scanTipsButton
                      ]}
                      onPress={button.onPress}
                    >
                      <Text style={textStyle}>{button.text}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconContainer: {
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  defaultButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
    minWidth: 100,
    alignItems: 'center',
  },
  primaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#2196F3',
    minWidth: 100,
    alignItems: 'center',
  },
  dangerButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#F44336',
    minWidth: 100,
    alignItems: 'center',
  },
  defaultButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  dangerButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  buttonMargin: {
    marginLeft: 10,
  },
  
  // Styles for scan tips modal
  scanTipsContainer: {
    width: width * 0.9,
    backgroundColor: 'black',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxHeight: height * 0.9,
  },
  scanTipsTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  scanTipsMessage: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  footerIcon: {
    marginRight: 8,
  },
  footerMessage: {
    color: '#8f8f8f',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  scanTipsButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
  }
});

export default Modal;
