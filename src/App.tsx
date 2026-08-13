import { ApolloProvider } from '@apollo/client/react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import client from './apollo/client';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import MyPage from './pages/MyPage';
import { useAuth } from './hooks/useAuth';
import FavoritePage from './pages/FavoritePage';


function TokenHandler() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      login(token);
      window.location.replace('/');
    }
  }, []);

  return null;
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <TokenHandler />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<MainPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/favorites" element={<FavoritePage />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}