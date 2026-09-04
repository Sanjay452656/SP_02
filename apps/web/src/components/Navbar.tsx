import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BrainCircuit, LayoutDashboard, BookOpen, ListChecks, LogOut } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/questions', label: 'My Questions', icon: <ListChecks size={18} /> },
    { to: '/revise', label: 'Revise Today', icon: <BookOpen size={18} /> },
  ];

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      height: '60px',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <BrainCircuit size={28} color="var(--primary-color)" />
        <span style={{ fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)' }}>LC Tracker</span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--primary-color)' : 'var(--text-secondary)',
                backgroundColor: active ? 'rgba(79,70,229,0.08)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '7px 14px',
          cursor: 'pointer',
          fontSize: '14px',
          color: 'var(--text-secondary)',
        }}
      >
        <LogOut size={16} />
        Logout
      </button>
    </nav>
  );
}
