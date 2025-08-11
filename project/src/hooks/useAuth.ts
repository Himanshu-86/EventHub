import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setUser, logout, setLoading } from '../store/slices/authSlice';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

    const login = async (email: string, password: string) => {
      try {
        dispatch(setLoading(true));
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) {
          dispatch(setLoading(false));
          toast.error('Login failed. Please try again.');
          return { success: false, error };
        }
              // User data is already available from Supabase auth
      dispatch(setUser({
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || '',
        role: data.user.user_metadata?.role || 'user',
        avatar: data.user.user_metadata?.avatar || '',
      }));
        toast.success('Login successful!');
        return { success: true };
      } catch (error) {
        dispatch(setLoading(false));
        toast.error('Login failed. Please try again.');
        return { success: false, error };
      }
    };

  const signup = async (email: string, password: string, name: string) => {
      try {
        dispatch(setLoading(true));
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              name: name,
              role: 'user'
            }
          }
        });
        if (error || !data.user) {
          dispatch(setLoading(false));
          toast.error('Signup failed. Please try again.');
          return { success: false, error };
        }
        
        dispatch(setUser({
          id: data.user.id,
          email,
          name,
          role: 'user',
          avatar: '',
        }));
        toast.success('Signup successful!');
        return { success: true };
      } catch (error) {
        dispatch(setLoading(false));
        toast.error('Signup failed. Please try again.');
        return { success: false, error };
      }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      dispatch(logout());
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error('Logout failed.');
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    signOut,
  };
};