import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { login as loginAction, logout as logoutAction, updateUser as updateUserAction } from '../redux/slices/authSlice';
import { saveAuthData, clearAuthData } from '../utils/storage';

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  const handleLogin = async (token: string, user: { id: string; email: string; name: string }) => {
    // Dispatch action to update Redux store
    dispatch(loginAction({ token, user }));
    
    // Save to persistent storage
    await saveAuthData(token, user);
  };

  const handleLogout = async () => {
    // Clear from Redux store
    dispatch(logoutAction());
    
    // Clear from persistent storage
    await clearAuthData();
  };

  const handleUpdateUser = async (userData: Partial<{ id: string; email: string; name: string }>) => {
    dispatch(updateUserAction(userData));
    
    // Also update user info in AsyncStorage
    if (authState.token && authState.user) {
      const updatedUser = { ...authState.user, ...userData };
      await saveAuthData(authState.token, updatedUser);
    }
  };

  return {
    ...authState,
    login: handleLogin,
    logout: handleLogout,
    updateUser: handleUpdateUser,
    isAuthenticated: authState.isLoggedIn && !!authState.token,
  };
};
