import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AddQuestion from './pages/AddQuestion';
import RevisionSession from './pages/RevisionSession';
import QuestionsList from './pages/QuestionsList';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const token = localStorage.getItem('token');

  return (
    <>
      {!isLoginPage && token && <Navbar />}
      <div className="container py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={<PrivateRoute><Dashboard /></PrivateRoute>}
          />
          <Route
            path="/questions"
            element={<PrivateRoute><QuestionsList /></PrivateRoute>}
          />
          <Route
            path="/add"
            element={<PrivateRoute><AddQuestion /></PrivateRoute>}
          />
          <Route
            path="/revise"
            element={<PrivateRoute><RevisionSession /></PrivateRoute>}
          />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
