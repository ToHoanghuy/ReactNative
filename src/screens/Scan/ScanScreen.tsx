import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
// import { RNCamera } from 'react-native-camera';
// import { useDispatch } from 'react-redux';
// import { addHistoryItem } from '../../redux/slices/historySlice';

// const { width: _width, height: _height } = Dimensions.get('window');

const ScanScreen: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [flashMode, setFlashMode] = useState('off');
  // const cameraRef = useRef<RNCamera>(null);
  // const dispatch = useDispatch();

  const handleScan = async () => {
    setIsScanning(true);
    // Simulate face scanning process
    setTimeout(() => {
      const mockResult = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        faceId: `FACE_${Math.random().toString(36).substr(2, 9)}`,
        result: Math.random() > 0.3 ? 'success' : 'failed',
        confidence: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
      };

      setIsScanning(false);
      if (mockResult.result === 'success') {
        Alert.alert('Success', `Face recognized with ${(mockResult.confidence * 100).toFixed(1)}% confidence`);
      } else {
        Alert.alert('Failed', 'Face recognition failed. Please try again.');
      }

      // dispatch(addHistoryItem(mockResult));
    }, 3000);
  };

  const toggleFlash = () => {
    setFlashMode(flashMode === 'off' ? 'on' : 'off');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      {/* Camera View Placeholder */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.cameraText}>Camera View</Text>
          <Text style={styles.instructionText}>
            Position your face within the frame
          </Text>
        </View>

        {/* Face Detection Overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
        </View>

        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
            <Text style={styles.controlText}>
              Flash: {flashMode.toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={[
              styles.scanButton,
              isScanning && styles.scanButtonActive,
            ]}
            onPress={handleScan}
            disabled={isScanning}>
            <Text style={styles.scanButtonText}>
              {isScanning ? 'Scanning...' : 'Scan Face'}
            </Text>
          </TouchableOpacity>
        </View>

        {isScanning && (
          <View style={styles.scanningOverlay}>
            <View style={styles.scanningAnimation}>
              <Text style={styles.scanningText}>Analyzing face...</Text>
            </View>
          </View>
        )}
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Face Scan Instructions:</Text>
        <Text style={styles.instruction}>• Position your face within the frame</Text>
        <Text style={styles.instruction}>• Look directly at the camera</Text>
        <Text style={styles.instruction}>• Ensure good lighting</Text>
        <Text style={styles.instruction}>• Keep your face steady</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  cameraText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  instructionText: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 300,
    borderWidth: 3,
    borderColor: '#2196F3',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  flashButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  controlText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 150,
    alignItems: 'center',
  },
  scanButtonActive: {
    backgroundColor: '#FF9800',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningAnimation: {
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  scanningText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    minHeight: 120,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
});

export default ScanScreen;
