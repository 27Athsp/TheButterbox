import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      toast.success('Logged in successfully');
      navigate('/');
    } catch {
      toast.error('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <main className="container">
      <h1>Login</h1>
      <form onSubmit={onSubmit} className="form">
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <div className="password-field">
          <input type={show ? 'text' : 'password'} name="password" placeholder="Password" value={form.password} onChange={onChange} required />
          <button type="button" onClick={() => setShow(s => !s)}>{show ? 'Hide' : 'Show'}</button>
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
      <p>New here? <Link to="/signup">Create account</Link></p>
    </main>
  );
}
