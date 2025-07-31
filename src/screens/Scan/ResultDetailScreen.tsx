import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import { ScanStackParamList } from '../../types/navigation';
import { addHistoryItem } from '../../redux/slices/historySlice';
import SplashScreen from '../../components/SplashScreen';
import Modal from '../../components/Modal';
import Svg, { Circle } from 'react-native-svg';
const Icon = require('react-native-vector-icons/Feather').default;
const MaterialIcons = require('react-native-vector-icons/MaterialIcons').default;
const MaterialCommunityIcons = require('react-native-vector-icons/MaterialCommunityIcons').default;

type NavigationProp = StackNavigationProp<ScanStackParamList, 'ResultDetail'>;
type ResultDetailScreenRouteProp = RouteProp<ScanStackParamList, 'ResultDetail'>;

interface Props {
    route: ResultDetailScreenRouteProp;
}

const ResultDetailScreen: React.FC<Props> = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<NavigationProp>();
    const dispatch = useDispatch();
    const route = useRoute<any>();
    const { scanResult } = route.params || {};
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalInfo, setModalInfo] = useState({
        title: '',
        message: ''
    });

    // Descriptions for health metrics
    const metricDescriptions: Record<string, { title: string; message: string }> = {
        breathingRate: {
            title: t('Breathing Rate'),
            message: t('Breathing rate is the number of breaths you take per minute. Normal adult breathing rate is between 12 and 20 breaths per minute. Your breathing rate changes based on your activity level, emotional state, and overall health.')
        },
        heartRate: {
            title: t('Heart Rate'),
            message: t('Heart rate is the number of times your heart beats per minute. A normal resting heart rate for adults ranges from 60 to 100 beats per minute. A lower heart rate at rest generally implies more efficient heart function and better cardiovascular fitness.')
        },
        stressLevel: {
            title: t('Stress Level'),
            message: t('The stress level indicates your current stress state based on heart rate variability and other physiological indicators. Low stress levels (1-2) are optimal, while high levels (4-5) may indicate you need rest or relaxation techniques.')
        },
        heartRateVariability: {
            title: t('Heart Rate Variability'),
            message: t('Heart Rate Variability (HRV) measures the variation in time between consecutive heartbeats. Higher HRV typically indicates better cardiovascular health and resilience to stress, while lower HRV may suggest increased stress or potential health issues.')
        }
    };

    // Handle showing the modal with appropriate information
    const handleInfoPress = (metricType: string) => {
        const info = metricDescriptions[metricType];
        if (info) {
            setModalInfo({
                title: info.title,
                message: info.message
            });
            setIsModalVisible(true);
        }
    };

    // Lưu kết quả vào Redux khi component mount - chỉ một lần
    useEffect(() => {
        if (scanResult && scanResult.id) {
            const historyItem = {
                _id: scanResult._id || scanResult.id || '', // fallback if _id is not present
                id: scanResult.id,
                createdAt: scanResult.createdAt,
                faceId: scanResult.faceId,
                result: scanResult.result,
                confidence: scanResult.confidence,
                wellnessScore: scanResult.wellnessScore || 8,
                heartRate: scanResult.heartRate || 72,
                heartRateUnit: 'bpm',
                breathingRate: scanResult.breathingRate || 16,
                breathingRateUnit: 'bpm',
                bloodPressure: scanResult.bloodPressure || '120/80',
                bloodPressureUnit: 'mmHg',
                oxygenSaturation: scanResult.oxygenSaturation || 98,
                oxygenSaturationUnit: '%',
                stress: Math.floor(Math.random() * 30) + 20, // Mock data
                stressUnit: '%',
                count: scanResult.count || 1,
                data: scanResult.data || {},
            };

            dispatch(addHistoryItem(historyItem));
        }
    }, []); // Chỉ chạy một lần khi component mount

    const handleBackToScan = () => {
        // Quay về màn hình trước đó
        navigation.goBack();
    };

    const handleDelete = () => {
        Alert.alert(
            t('Delete Result'),
            t('Are you sure you want to delete this scan result?'),
            [
                {
                    text: t('Cancel'),
                    style: 'cancel',
                },
                {
                    text: t('Delete'),
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        // Simulate delete processing
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        setIsLoading(false);
                        // TODO: Implement delete functionality
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    // Component để vẽ circular progress
    const CircularProgress = ({ score, maxScore }: { score: number; maxScore: number }) => {
        const percentage = (score / maxScore) * 100;
        const strokeDasharray = 2 * Math.PI * 45; // radius = 45
        const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

        return (
            <View style={styles.circularProgressContainer}>
                <Svg width={120} height={120} style={styles.circularSvg}>
                    {/* Background circle */}
                    <Circle
                        key="background-circle"
                        cx={60}
                        cy={60}
                        r={45}
                        stroke="#e0e0e0"
                        strokeWidth={12}
                        fill="transparent"
                    />
                    {/* Progress circle */}
                    <Circle
                        key="progress-circle"
                        cx={60}
                        cy={60}
                        r={45}
                        stroke="#2196F3"
                        strokeWidth={11}
                        fill="transparent"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform={`rotate(-90 60 60)`}
                    />
                </Svg>
                <View style={styles.scoreTextContainer}>
                    <Text style={styles.scoreNumber}>{score}</Text>
                    <Text style={styles.scoreMax}>/{maxScore}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleBackToScan}>
                    <Icon name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Scan Results')}</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Circular Score Display */}
                <View style={styles.scoreSection}>
                    <CircularProgress score={scanResult.wellnessScore || 8} maxScore={10} />
                    <Text style={styles.dateText}>
                        {new Date(scanResult.date).toLocaleDateString('en-GB')} {new Date(scanResult.date).toLocaleTimeString('en-GB')}
                    </Text>
                </View>

                {/* Health Metrics Grid */}
                <View style={styles.metricsGrid}>
                    {/* Breathing Rate */}
                    <View key="breathing-rate-card" style={styles.metricCard}>
                        <View style={styles.metricHeader}>
                            <View style={[styles.metricIcon, { backgroundColor: '#e6f7ff' }]}>
                                <MaterialCommunityIcons name="lungs" size={22} color="#0099cc" />
                            </View>
                            <TouchableOpacity onPress={() => handleInfoPress('breathingRate')}>
                                <Icon name="info" size={20} color="#2196F3" style={styles.infoIcon} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.metricLabel}>{t('Breathing Rate')}</Text>
                        <Text style={styles.metricValue}>{scanResult.breathingRate || 14}</Text>
                        <Text style={styles.metricUnit}>{t('/minutes')}</Text>
                    </View>

                    {/* Heart Rate */}
                    <View key="heart-rate-card" style={styles.metricCard}>
                        <View style={styles.metricHeader}>
                            <View style={[styles.metricIcon, { backgroundColor: '#ffe6e6' }]}>
                                <MaterialCommunityIcons name="heart-pulse" size={22} color="#ff5c5c" />
                            </View>
                            {/* <MaterialIcons name="favorite" size={24} color="#F44336" /> */}
                            <TouchableOpacity onPress={() => handleInfoPress('heartRate')}>
                                <Icon name="info" size={20} color="#2196F3" style={styles.infoIcon} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.metricLabel}>{t('Heart Rate')}</Text>
                        <Text style={styles.metricValue}>{scanResult.heartRate || 52}</Text>
                        <Text style={styles.metricUnit}>{t('bpm')}</Text>
                    </View>

                    {/* Stress Level */}
                    <View key="stress-level-card" style={styles.metricCard}>
                        <View style={styles.metricHeader}>
                            <View style={[styles.metricIcon, { backgroundColor: '#fff2e6' }]}>
                                <MaterialCommunityIcons name="brain" size={22} color="#ff9933" />
                            </View>
                            <TouchableOpacity onPress={() => handleInfoPress('stressLevel')}>
                                <Icon name="info" size={20} color="#2196F3" style={styles.infoIcon} />
                            </TouchableOpacity>

                        </View>
                        <Text style={styles.metricLabel}>{t('Stress Level')}</Text>
                        <Text style={styles.metricValue}>2</Text>
                        <Text style={styles.metricUnit}>{t('Moderate')}</Text>
                    </View>

                    {/* Heart Rate Variability */}
                    <View key="hrv-card" style={styles.metricCard}>
                        <View style={styles.metricHeader}>
                            <View style={[styles.metricIcon, { backgroundColor: '#e6ffe6' }]}>
                                <MaterialCommunityIcons name="chart-line-variant" size={22} color="#33cc33" />
                            </View>

                            <TouchableOpacity onPress={() => handleInfoPress('heartRateVariability')}>
                                <Icon name="info" size={20} color="#2196F3" style={styles.infoIcon} />
                            </TouchableOpacity>

                        </View>
                        <Text style={styles.metricLabel}>{t('Heart Rate Variability')}</Text>
                        <Text style={styles.metricValue}>42</Text>
                        <Text style={styles.metricUnit}>{t('Milliseconds')}</Text>
                    </View>
                </View>

                {/* Warning Button */}
                <TouchableOpacity style={styles.warningButton}>
                    <Icon name="alert-triangle" size={20} color="#FF9800" />
                    <Text style={styles.warningText}>{t('View abnormal results')}</Text>
                </TouchableOpacity>

                {/* Delete Button */}
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Text style={styles.deleteButtonText}>{t('Delete')}</Text>
                </TouchableOpacity>
            </ScrollView>
            
            {/* SplashScreen overlay */}
            <SplashScreen isLoading={isLoading} />

            {/* Info Modal */}
            <Modal
                visible={isModalVisible}
                title={modalInfo.title}
                message={modalInfo.message}
                onClose={() => setIsModalVisible(false)}
                type="info"
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    // Circular Progress styles
    scoreSection: {
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    circularProgressContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    circularSvg: {
        transform: [{ rotate: '-90deg' }],
    },
    scoreTextContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    scoreNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    scoreMax: {
        fontSize: 18,
        color: '#666',
        marginTop: 8,
    },
    dateText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    // Metrics Grid styles
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    metricCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        width: '48%',
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    metricIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f2f7ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoIcon: {
        opacity: 0.8,
    },
    metricLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    metricUnit: {
        fontSize: 12,
        color: '#999',
    },
    // Button styles
    warningButton: {
        backgroundColor: '#FFF3E0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    warningText: {
        color: '#FF9800',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
    deleteButton: {
        backgroundColor: '#FFEBEE',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFCDD2',
        marginBottom: 24,
    },
    deleteButtonText: {
        color: '#F44336',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default ResultDetailScreen;
