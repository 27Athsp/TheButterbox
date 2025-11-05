import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'customer', roleId: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Invalid email format');
      setLoading(false);
      return;
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }
    if ((form.role === 'baker' || form.role === 'admin') && !form.roleId) {
      toast.error('Valid ID required for role');
      setLoading(false);
      return;
    }
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role: form.role, roleId: form.roleId };
      const { data } = await api.post('/auth/signup', payload);
      login(data.token, data.user);
      toast.success('Account created successfully');
      navigate('/');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Signup failed');
    }
    setLoading(false);
  };

  return (
    <main className="container">
      <h1>Sign Up</h1>
      <form onSubmit={onSubmit} className="form">
        <input name="name" placeholder="Name" value={form.name} onChange={onChange} required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <div className="password-field">
          <input type={show ? 'text' : 'password'} name="password" placeholder="Password" value={form.password} onChange={onChange} required />
          <button type="button" onClick={() => setShow(s => !s)}>{show ? 'Hide' : 'Show'}</button>
        </div>
        <input type={show ? 'text' : 'password'} name="confirm" placeholder="Confirm Password" value={form.confirm} onChange={onChange} required />
        <select name="role" value={form.role} onChange={onChange}>
          <option value="customer">Customer</option>
          <option value="baker">Baker</option>
          <option value="admin">Admin</option>
        </select>
        {(form.role === 'baker' || form.role === 'admin') && (
          <input name="roleId" placeholder="Enter valid role ID" value={form.roleId} onChange={onChange} required />
        )}
        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </main>
  );
}
