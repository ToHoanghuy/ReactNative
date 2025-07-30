// src/api/healthDataApi.ts
import axios from './axiosInstance';

// Define the health data interface according to the expected structure
export interface HealthData {
  ascvdRisk?: { type: number; value: number };
  bpValue?: { diastolic: number; systolic: number };
  heartAge?: { type: number; value: number };
  hemoglobin?: { type: number; value: number };
  hemoglobinA1c?: { type: number; value: number };
  highBloodPressureRisk?: { type: number; value: number };
  highFastingGlucoseRisk?: { type: number; value: number };
  highHemoglobinA1cRisk?: { type: number; value: number };
  highTotalCholesterolRisk?: { type: number; value: number };
  lfhf?: { type: number; value: number };
  lowHemoglobinRisk?: { type: number; value: number };
  meanRRi?: { confidence: { level: number }; type: number; value: number };
  normalizedStressIndex?: { type: number; value: number };
  oxygenSaturation?: { type: number; value: number };
  pnsIndex?: { type: number; value: number };
  pnsZone?: { type: number; value: number };
  prq?: { confidence: { level: number }; type: number; value: number };
  pulseRate?: { confidence: { level: number }; type: number; value: number };
  respirationRate?: { confidence: { level: number }; type: number; value: number };
  rmssd?: { type: number; value: number };
  rri?: { confidence: { level: number }; type: number; value: any[] };
  sd1?: { type: number; value: number };
  sd2?: { type: number; value: number };
  sdnn?: { confidence: { level: number }; type: number; value: number };
  snsIndex?: { type: number; value: number };
  snsZone?: { type: number; value: number };
  stressIndex?: { type: number; value: number };
  stressLevel?: { type: number; value: number };
  wellnessIndex?: { type: number; value: number };
  wellnessLevel?: { type: number; value: number };
}

// Define the response interface
export interface HealthDataResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Get health data for a specific date
 * @param date The date for which to fetch health data (format: DD-MM-YYYY)
 * @returns Response with success status, message and health data
 */
export const getHealthDataByDate = async (date: string): Promise<HealthDataResponse> => {
  try {
    console.log('Fetching health data for date:', date);
    
    const response = await axios.post('/api/v1/health-data', { 
      params: { createdAt: date } 
    });
    
    // Format the response
    let formattedResponse: HealthDataResponse;
    
    if (response.data) {
      if (response.data.success !== undefined) {
        // API already has success field
        formattedResponse = response.data;
      } else {
        // Need to create success field based on message or status
        formattedResponse = {
          success: true,
          message: response.data.message || 'Health data retrieved successfully',
          data: response.data.data
        };
      }
    } else {
      formattedResponse = {
        success: false,
        message: 'Invalid response format from server'
      };
    }
    
    console.log('Health data response:', formattedResponse);
    return formattedResponse;
    
  } catch (error: any) {
    console.error('Get Health Data API error:', error);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Failed to retrieve health data',
        data: error.response.data
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'No response from server. Check your internet connection.'
      };
    } else {
      return {
        success: false,
        message: error.message || 'An unknown error occurred'
      };
    }
  }
};

/**
 * Update health data by sending it to the server
 * @param healthData The health data to update
 * @returns Response with success status and message
 */
export const updateHealthData = async (healthData: HealthData): Promise<HealthDataResponse> => {
  try {
    console.log('Sending health data to API:', healthData);
    
    const response = await axios.post('/api/v1/health-data/update', { healthData });
    
    // Add success field for consistency if needed
    let formattedResponse: HealthDataResponse;
    
    if (response.data) {
      if (response.data.success !== undefined) {
        // API already has success field
        formattedResponse = response.data;
      } else {
        // Need to create success field based on message or status
        formattedResponse = {
          success: true,
          message: response.data.message || 'Health data updated successfully',
          data: response.data.data
        };
      }
    } else {
      formattedResponse = {
        success: false,
        message: 'Invalid response format from server'
      };
    }
    
    console.log('Health data update response:', formattedResponse);
    return formattedResponse;
    
  } catch (error: any) {
    console.error('Update Health Data API error:', error);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Failed to update health data',
        data: error.response.data
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'No response from server. Check your internet connection.'
      };
    } else {
      return {
        success: false,
        message: error.message || 'An unknown error occurred'
      };
    }
  }
};
