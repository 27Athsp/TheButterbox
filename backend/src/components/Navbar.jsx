import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { items } = useCart();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="logo">Bakery</Link>
      <div className="spacer" />
      <Link to="/products">Products</Link>
      <button onClick={toggle} aria-label="toggle theme">{theme === 'light' ? '🌙' : '☀️'}</button>
      <button onClick={() => navigate('/cart')} className="cart-btn">🛒 {items.reduce((n, i) => n + i.quantity, 0)}</button>
      {user ? (
        <>
          <Link to={`/${user.role}-dashboard`}>Dashboard</Link>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <Link to="/login">Account</Link>
      )}
    </nav>
  );
}


