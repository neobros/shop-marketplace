import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api, { TOKEN_KEY } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) return setLoading(false);
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
    const onLogout = () => setUser(null);
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, [loadMe]);

  const handleAuth = ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
    return user;
  };

  const login = async (email, password) => handleAuth((await api.post('/auth/login', { email, password })).data);
  const register = async (payload) => handleAuth((await api.post('/auth/register', payload)).data);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const updateProfile = async (payload) => {
    const { data } = await api.put('/auth/me', payload);
    setUser(data.user);
    return data.user;
  };

  const toggleWishlist = async (productId) => {
    const { data } = await api.post(`/auth/me/wishlist/${productId}`);
    setUser((u) => ({ ...u, wishlist: data.wishlist }));
    return data.wishlist.includes(productId);
  };

  const value = {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    isSeller: user?.role === 'seller',
    setUser,
    login,
    register,
    logout,
    updateProfile,
    toggleWishlist,
    inWishlist: (id) => !!user?.wishlist?.includes(id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
