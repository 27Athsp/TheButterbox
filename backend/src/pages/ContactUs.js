import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/feedback', form);
      toast.success('Thanks for your message!');
      setForm({ name: '', email: '', message: '' });
    } catch {
      toast.error('Something went wrong.');
    }
    setLoading(false);
  };
  return (
    <main className="container">
      <h1>Contact Us</h1>
      <form onSubmit={onSubmit} className="form">
        <input name="name" placeholder="Your name" value={form.name} onChange={onChange} required />
        <input name="email" placeholder="Your email" value={form.email} onChange={onChange} required type="email" />
        <textarea name="message" placeholder="Your message" value={form.message} onChange={onChange} required />
        <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
      </form>
    </main>
  );
}


