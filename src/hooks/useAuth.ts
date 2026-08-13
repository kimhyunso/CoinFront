import { useState, useEffect } from 'react';

export function useAuth() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );

  // localStorage 변경 감지 (다른 탭이나 window.location 이동 후)
  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem('token'));
    };

    // storage 이벤트 감지
    window.addEventListener('storage', handleStorage);

    // 커스텀 이벤트로 같은 탭에서도 감지
    window.addEventListener('tokenChanged', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('tokenChanged', handleStorage);
    };
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // 같은 탭에서도 이벤트 발생
    window.dispatchEvent(new Event('tokenChanged'));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    window.dispatchEvent(new Event('tokenChanged'));
    window.location.href = '/login';
  };

  const isLoggedIn = !!token;

  return { token, login, logout, isLoggedIn };
}