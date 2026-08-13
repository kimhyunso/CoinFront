import { ApolloProvider } from '@apollo/client/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import client from './apollo/client';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<MainPage />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}