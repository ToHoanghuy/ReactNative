export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OTPVerification: { email: string };
  SetupNewPassword: { email: string; otp: string };
};

export type BottomTabParamList = {
  History: undefined;
  Scan: undefined;
  Account: undefined;
};

export type ScanStackParamList = {
  ScanMain: undefined;
  ResultDetail: {
    scanResult: {
      id: string;
      date: string;
      faceId: string;
      result: 'success' | 'failed';
      confidence: number;
      wellnessScore?: number;
      heartRate?: number;
      breathingRate?: number;
      bloodPressure?: string;
      oxygenSaturation?: number;
    };
  };
};

export type HistoryStackParamList = {
  HistoryList: undefined;
  HistoryCalendar: undefined;
  HistoryChart: undefined;
  ResultDetail: {
    scanResult: {
      id: string;
      date: string;
      faceId: string;
      result: 'success' | 'failed';
      confidence: number;
      wellnessScore?: number;
      heartRate?: number;
      breathingRate?: number;
      bloodPressure?: string;
      oxygenSaturation?: number;
    };
  };
};

export type AccountStackParamList = {
  AccountMain: undefined;
  PersonalInfo: undefined;
  ChangeLanguage: undefined;
  ChangePassword: undefined;
  Package: undefined;
};
