import { ApolloProvider } from '@apollo/client/react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import client from './apollo/client';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';

function TokenHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, '', '/');  // URL에서 token 제거
      navigate('/', { replace: true });
    }
  }, []);

  return null;
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <TokenHandler />  {/* BrowserRouter 안으로 이동! */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<MainPage />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}