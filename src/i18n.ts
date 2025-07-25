import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      'Monthly Scan Activity': 'Monthly Scan Activity',
      'Daily Usage': 'Daily Usage',
      '7 Days': '7 Days',
      '30 Days': '30 Days', 
      '3 Months': '3 Months',
      'Success Rate': 'Success Rate',
      'Result Distribution': 'Result Distribution',
      'Total Scans': 'Total Scans',
      'Today': 'Today',
      'Success': 'Success',
      'Failed': 'Failed',
      // Strings for ChangeLanguageScreen
      'Select Language': 'Select Language',
      'Save Changes': 'Save Changes',
      'Language changed successfully': 'Language changed successfully',
      'English': 'English',
      'Tiếng Việt': 'Vietnamese',
      // Strings for HistoryCalendarScreen
      'Select Date Range': 'Select Date Range',
      'Cancel': 'Cancel',
      'Apply Filter': 'Apply Filter',
      // Strings for HistoryListScreen
      'Calendar Filter': 'Calendar Filter',
      'Chart Report': 'Chart Report',
      'Face ID': 'Face ID',
      'Confidence': 'Confidence',
      'success': 'success',
      'failed': 'failed',
      'Loading more...': 'Loading more...',
      'No history items found': 'No history items found',
      // Strings for Login Screen
      'Health Monitor': 'Health Monitor',
      'Welcome Back': 'Welcome Back',
      'Log in to your account': 'Log in to your account',
      'Enter your email': 'Enter your email',
      'Enter your password': 'Enter your password',
      'Forgot Password?': 'Forgot Password?',
      'Log In': 'Log In',
      'Login': 'Login',
      'Don\'t have an account?': 'Don\'t have an account?',
      'Register': 'Register',
      'Email': 'Email',
      'Password': 'Password',
      'Login failed. Please try again.': 'Login failed. Please try again.',
      // Strings for Register Screen
      'Create Account': 'Create Account',
      'Sign up to get started': 'Sign up to get started',
      'Name': 'Name',
      'Enter your name': 'Enter your name',
      'Confirm Password': 'Confirm Password',
      'Confirm your password': 'Confirm your password',
      'Registration failed. Please try again.': 'Registration failed. Please try again.',
      'Already have an account?': 'Already have an account?',
      'Register Now': 'Register Now',
      'Back': 'Back',
      // Strings for Forgot Password Screen
      'Forgot Password': 'Forgot Password',
      'Enter your email address and we will send you instructions to reset your password': 'Enter your email address and we will send you instructions to reset your password',
      'Reset Password': 'Reset Password',
      'Email Sent': 'Email Sent',
      'Password reset instructions have been sent to your email address. Please check your inbox.': 'Password reset instructions have been sent to your email address. Please check your inbox.',
      'Back to Login': 'Back to Login',
      'Password reset request failed. Please try again.': 'Password reset request failed. Please try again.',
      // Strings for AccountMainScreen
      'Personal Information': 'Personal Information',
      'Change Language': 'Change Language',
      'Version': 'Version',
      'Chào mừng,': 'Welcome,',
      'Thông tin cá nhân': 'Personal Information',
      'Notifications': 'Notifications',
      'Change Password': 'Change Password',
      'Ngôn ngữ': 'Language',
      'Package': 'Package',
      'Liên hệ với chúng tôi': 'Contact Us',
      'Chính sách bảo mật': 'Privacy Policy',
      'Nguồn Thông Tin Sức Khỏe': 'Health Information Sources',
      'Logout': 'Logout',
      'Are you sure you want to logout?': 'Are you sure you want to logout?',
      'User': 'User',
      // Strings for ChangePasswordScreen
      'Current Password': 'Current Password',
      'New Password': 'New Password',
      'Confirm New Password': 'Confirm New Password',
      'Enter current password': 'Enter current password',
      'Enter new password': 'Enter new password',
      'Confirm new password': 'Confirm new password',
      'Password Requirements:': 'Password Requirements:',
      'At least 6 characters long': 'At least 6 characters long',
      'Must contain letters and numbers': 'Must contain letters and numbers',
      'Cannot be the same as current password': 'Cannot be the same as current password',
      'Error': 'Error',
      'Current password is required': 'Current password is required',
      'New password is required': 'New password is required',
      'Password must be at least 6 characters': 'Password must be at least 6 characters',
      'Passwords do not match': 'Passwords do not match',
      'Password changed successfully': 'Password changed successfully',
      // Strings for PersonalInfoScreen
      'Full Name': 'Full Name',
      'Email Address': 'Email Address',
      'Phone Number': 'Phone Number',
      'Enter your full name': 'Enter your full name',
      'Enter your email address': 'Enter your email address',
      'Enter your phone number': 'Enter your phone number',
      'Name is required': 'Name is required',
      'Email is required': 'Email is required',
      'Profile updated successfully': 'Profile updated successfully',
      // Strings for ScanScreen
      'Camera View': 'Camera View',
      'Position your face within the frame': 'Position your face within the frame',
      'Flash': 'Flash',
      'ON': 'ON',
      'OFF': 'OFF',
      'Scanning...': 'Scanning...',
      'Scan Face': 'Scan Face',
      'Scanning Tips': 'Scanning Tips',
      'For best results:\n• Ensure good lighting\n• Remove glasses\n• Look directly at the camera\n• Keep your face within the outline': 'For best results:\n• Ensure good lighting\n• Remove glasses\n• Look directly at the camera\n• Keep your face within the outline',
      'Start Scan': 'Start Scan',
      'Analyzing face...': 'Analyzing face...',
      'Face Scan Instructions:': 'Face Scan Instructions:',
      'Look directly at the camera': 'Look directly at the camera',
      'Ensure good lighting': 'Ensure good lighting',
      'Keep your face steady': 'Keep your face steady',
      'Face recognized with': 'Face recognized with',
      'confidence': 'confidence',
      'Face recognition failed. Please try again.': 'Face recognition failed. Please try again.',
      'Blood Pressure': 'Blood Pressure',
      'Heart Rate': 'Heart Rate',
      'Heart Rate Variability': 'Heart Rate Variability',
      'Oxygen Saturation': 'Oxygen Saturation',
      'Sympathetic Stress': 'Sympathetic Stress',
      'Parasympathetic Activity': 'Parasympathetic Activity',
      'High Total Cholesterol Risk': 'High Total Cholesterol Risk',
      'High Blood Pressure Risk': 'High Blood Pressure Risk',
      'Low Hemoglobin Risk': 'Low Hemoglobin Risk',
      'Scan Now': 'Scan Now',
      'Your health data is now available.': 'Your health data is now available.',
      'You have no health scan data yet. Please scan to get health data.': 'You have no health scan data yet. Please scan to get health data.',
      'Please enter a valid email address': 'Please enter a valid email address',
      'Email not found in our system': 'Email not found in our system',
      // Strings for ResultDetailScreen
      'Scan Results': 'Scan Results',
      'Scan Successful': 'Scan Successful',
      'Scan Failed': 'Scan Failed',
      'Wellness Score': 'Wellness Score',
      'Excellent': 'Excellent',
      'Good': 'Good',
      'Needs Attention': 'Needs Attention',
      'Health Metrics': 'Health Metrics',
      'Breathing Rate': 'Breathing Rate',
      'Scan Again': 'Scan Again',
      'View History': 'View History',
      // Strings for OTPVerificationScreen
      'OTP Verification': 'OTP Verification',
      'Enter the 6-digit code sent to': 'Enter the 6-digit code sent to',
      'Didn\'t receive the code?': 'Didn\'t receive the code?',
      'Resend code in {{time}}s': 'Resend code in {{time}}s',
      'Resend': 'Resend',
      'Verify': 'Verify',
      // Strings for ResultDetailScreen
      'Delete Result': 'Delete Result',
      'Are you sure you want to delete this scan result?': 'Are you sure you want to delete this scan result?',
      'Delete': 'Delete',
      'View abnormal results': 'View abnormal results',
      'Stress Level': 'Stress Level',
      'Moderate': 'Moderate',
      'Milliseconds': 'Milliseconds',
      '/minutes': '/minutes',
      'bpm': 'bpm',
      'Latest Scan Result': 'Latest Scan Result',
      'View Details': 'View Details',
      '/min': '/min',
      'O2': 'O2',
      'Scan History Calendar': 'Scan History Calendar',
      'Scans for': 'Scans for',
      'No scans found for this date': 'No scans found for this date',
      'Scan Statistics': 'Scan Statistics',
    },
  },
  vi: {
    translation: {
      'Monthly Scan Activity': 'Hoạt động quét hàng tháng',
      'Daily Usage': 'Sử dụng hàng ngày',
      '7 Days': '7 Ngày',
      '30 Days': '30 Ngày',
      '3 Months': '3 Tháng',
      'Success Rate': 'Tỉ lệ thành công',
      'Result Distribution': 'Phân bố kết quả',
      'Total Scans': 'Tổng số lần quét',
      'Today': 'Hôm nay',
      'Success': 'Thành công',
      'Failed': 'Thất bại',
      // Strings for ChangeLanguageScreen
      'Select Language': 'Chọn ngôn ngữ',
      'Save Changes': 'Lưu thay đổi',
      'Language changed successfully': 'Đã thay đổi ngôn ngữ thành công',
      'English': 'Tiếng Anh',
      'Tiếng Việt': 'Tiếng Việt',
      // Strings for HistoryCalendarScreen
      'Select Date Range': 'Chọn khoảng thời gian',
      'Cancel': 'Hủy',
      'Apply Filter': 'Áp dụng bộ lọc',
      // Strings for HistoryListScreen
      'Calendar Filter': 'Lọc theo lịch',
      'Chart Report': 'Báo cáo biểu đồ',
      'Face ID': 'Face ID',
      'Confidence': 'Độ tin cậy',
      'success': 'thành công',
      'failed': 'thất bại',
      'Loading more...': 'Đang tải thêm...',
      'No history items found': 'Không tìm thấy lịch sử nào',
      // Strings for Login Screen
      'Health Monitor': 'Giám sát Sức khỏe',
      'Welcome Back': 'Chào mừng trở lại',
      'Log in to your account': 'Đăng nhập vào tài khoản của bạn',
      'Enter your email': 'Nhập email của bạn',
      'Enter your password': 'Nhập mật khẩu của bạn',
      'Forgot Password?': 'Quên mật khẩu?',
      'Log In': 'Đăng nhập',
      'Login': 'Đăng nhập',
      'Don\'t have an account?': 'Chưa có tài khoản?',
      'Register': 'Đăng ký',
      'Email': 'Email',
      'Password': 'Mật khẩu',
      'Login failed. Please try again.': 'Đăng nhập thất bại. Vui lòng thử lại.',
      'Password is required': 'Yêu cầu nhập mật khẩu',
      // Strings for Register Screen
      'Create Account': 'Tạo tài khoản',
      'Sign up to get started': 'Đăng ký để bắt đầu',
      'Name': 'Họ tên',
      'Enter your name': 'Nhập họ tên của bạn',
      'Confirm Password': 'Xác nhận mật khẩu',
      'Confirm your password': 'Xác nhận mật khẩu của bạn',
      'Registration failed. Please try again.': 'Đăng ký thất bại. Vui lòng thử lại.',
      'Already have an account?': 'Đã có tài khoản?',
      'Register Now': 'Đăng ký ngay',
      'Back': 'Quay lại',
      // Strings for Forgot Password Screen
      'Forgot Password': 'Quên mật khẩu',
      'Enter your email address and we will send you instructions to reset your password': 'Nhập địa chỉ email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu',
      'Reset Password': 'Đặt lại mật khẩu',
      'Email Sent': 'Đã gửi email',
      'Password reset instructions have been sent to your email address. Please check your inbox.': 'Hướng dẫn đặt lại mật khẩu đã được gửi đến địa chỉ email của bạn. Vui lòng kiểm tra hộp thư đến.',
      'Back to Login': 'Quay lại đăng nhập',
      'Password reset request failed. Please try again.': 'Yêu cầu đặt lại mật khẩu thất bại. Vui lòng thử lại.',
      // Strings for AccountMainScreen
      'Personal Information': 'Thông tin cá nhân',
      'Change Language': 'Thay đổi ngôn ngữ',
      'Version': 'Phiên bản',
      'Chào mừng,': 'Chào mừng,',
      'Thông tin cá nhân': 'Thông tin cá nhân',
      'Notifications': 'Thông báo',
      'Change Password': 'Đổi mật khẩu',
      'Ngôn ngữ': 'Ngôn ngữ',
      'Package': 'Gói',
      'Contact Us': 'Liên hệ với chúng tôi',
      'Privacy Policy': 'Chính sách bảo mật',
      'Nguồn Thông Tin Sức Khỏe': 'Nguồn Thông Tin Sức Khỏe',
      'Logout': 'Đăng xuất',
      'Are you sure you want to logout?': 'Bạn có chắc chắn muốn đăng xuất?',
      'User': 'Người dùng',
      // Strings for ChangePasswordScreen
      'Current Password': 'Mật khẩu hiện tại',
      'New Password': 'Mật khẩu mới',
      'Confirm New Password': 'Xác nhận mật khẩu mới',
      'Enter current password': 'Nhập mật khẩu hiện tại',
      'Enter new password': 'Nhập mật khẩu mới',
      'Confirm new password': 'Xác nhận mật khẩu mới',
      'Password Requirements:': 'Yêu cầu mật khẩu:',
      'At least 6 characters long': 'Ít nhất 6 ký tự',
      'Must contain letters and numbers': 'Phải chứa chữ và số',
      'Cannot be the same as current password': 'Không được giống mật khẩu hiện tại',
      'Error': 'Lỗi',
      'Current password is required': 'Yêu cầu nhập mật khẩu hiện tại',
      'New password is required': 'Yêu cầu nhập mật khẩu mới',
      'Password must be at least 6 characters': 'Mật khẩu phải có ít nhất 6 ký tự',
      'Passwords do not match': 'Mật khẩu không khớp',
      'Password changed successfully': 'Đổi mật khẩu thành công',
      // Strings for PersonalInfoScreen
      'Full Name': 'Họ và tên',
      'Email Address': 'Địa chỉ email',
      'Phone Number': 'Số điện thoại',
      'Enter your full name': 'Nhập họ và tên của bạn',
      'Enter your email address': 'Nhập địa chỉ email của bạn',
      'Enter your phone number': 'Nhập số điện thoại của bạn',
      'Name is required': 'Yêu cầu nhập tên',
      'Email is required': 'Yêu cầu nhập email',
      'Profile updated successfully': 'Cập nhật thông tin thành công',
      // Strings for ScanScreen
      'Scanning...': 'Đang quét...',
      'Scan Face': 'Quét khuôn mặt',
      'Scanning Tips': 'Mẹo quét',
      'For best results:\n• Ensure good lighting\n• Remove glasses\n• Look directly at the camera\n• Keep your face within the outline': 'Để có kết quả tốt nhất:\n• Đảm bảo ánh sáng tốt\n• Gỡ kính mắt\n• Nhìn thẳng vào camera\n• Giữ khuôn mặt trong khung hình',
      'Start Scan': 'Bắt đầu quét',
      'Analyzing face...': 'Đang phân tích khuôn mặt...',
      'Face Scan Instructions:': 'Hướng dẫn quét khuôn mặt:',
      'Look directly at the camera': 'Nhìn thẳng vào camera',
      'Ensure good lighting': 'Đảm bảo ánh sáng tốt',
      'Keep your face steady': 'Giữ khuôn mặt ổn định',
      'Face recognized with': 'Nhận diện khuôn mặt với',
      'confidence': 'độ tin cậy',
      'Face recognition failed. Please try again.': 'Nhận diện khuôn mặt thất bại. Vui lòng thử lại.',
      'Blood Pressure': 'Huyết áp',
      'Heart Rate': 'Nhịp tim',
      'Heart Rate Variability': 'Biến thiên nhịp tim',
      'Oxygen Saturation': 'Bão hòa oxy',
      'Sympathetic Stress': 'Căng thẳng giao cảm',
      'Parasympathetic Activity': 'Hoạt động phó giao cảm',
      'High Total Cholesterol Risk': 'Nguy cơ cholesterol cao',
      'High Blood Pressure Risk': 'Nguy cơ huyết áp cao',
      'Low Hemoglobin Risk': 'Nguy cơ hemoglobin thấp',
      'Scan Now': 'Quét ngay',
      'Your health data is now available.': 'Dữ liệu sức khỏe của bạn đã có sẵn.',
      'You have no health scan data yet. Please scan to get health data.': 'Bạn chưa có dữ liệu sức khỏe quét nào. Vui lòng quét để có dữ liệu sức khỏe.',
      // Strings for ResultDetailScreen
      'Scan Results': 'Kết quả quét',
      'Scan Successful': 'Quét thành công',
      'Scan Failed': 'Quét thất bại',
      'Wellness Score': 'Điểm sức khỏe',
      'Excellent': 'Xuất sắc',
      'Good': 'Tốt',
      'Needs Attention': 'Cần chú ý',
      'Health Metrics': 'Chỉ số sức khỏe',
      'Breathing Rate': 'Nhịp thở',
      'Scan Again': 'Quét lại',
      'View History': 'Xem lịch sử',
      'Please enter a valid email address': 'Vui lòng nhập địa chỉ email hợp lệ',
      'Email not found in our system': 'Email không được tìm thấy trong hệ thống',
      // Strings for OTPVerificationScreen
      'OTP Verification': 'Xác thực OTP',
      'Enter the 6-digit code sent to': 'Nhập mã 6 chữ số đã gửi đến',
      'Didn\'t receive the code?': 'Chưa nhận được mã?',
      'Resend code in {{time}}s': 'Gửi lại mã sau {{time}} giây',
      'Resend': 'Gửi lại',
      'Verify': 'Xác thực',
      // Strings for ResultDetailScreen
      'Delete Result': 'Xóa kết quả',
      'Are you sure you want to delete this scan result?': 'Bạn có chắc chắn muốn xóa kết quả quét này?',
      'Delete': 'Xóa',
      'View abnormal results': 'Xem kết quả bất thường',
      'Stress Level': 'Mức độ căng thẳng',
      'Moderate': 'Trung bình',
      'Milliseconds': 'Mili giây',
      '/minutes': '/phút',
      'bpm': 'l/p',
      'Latest Scan Result': 'Kết quả quét gần nhất',
      'View Details': 'Xem chi tiết',
      '/min': '/phút',
      'O2': 'O2',
      'Scan History Calendar': 'Lịch sử quét',
      'Scans for': 'Các lần quét ngày',
      'No scans found for this date': 'Không có lần quét nào cho ngày này',
      'Scan Statistics': 'Thống kê quét',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'vi', 
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v3', // Thêm dòng này để tương thích với các nền tảng không hỗ trợ Intl API
  });

export default i18n;
