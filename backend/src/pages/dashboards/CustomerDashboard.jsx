import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ name: '', email: '', addresses: [] });
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, ordersRes, reviewsRes] = await Promise.all([
        api.get('/users/me').catch(() => ({ data: user })),
        api.get('/orders/my').catch(() => ({ data: [] })),
        api.get('/reviews/my').catch(() => ({ data: [] }))
      ]);
      setProfile(profileRes.data || user);
      setOrders(ordersRes.data || []);
      setReviews(reviewsRes.data || []);
    } catch {
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  const updateProfile = async () => {
    try {
      await api.put('/users/me', { name: profile.name });
      toast.success('Profile updated');
      fetchData();
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <main className="container"><div className="loading"><div className="spinner"></div></div></main>;

  return (
    <main className="container dashboard">
      <h1>Customer Dashboard</h1>
      <div className="tabs">
        <button className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Your Profile</button>
        <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Your Orders</button>
        <button className={`tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Your Reviews</button>
        <button className={`tab ${activeTab === 'logout' ? 'active' : ''}`} onClick={handleLogout}>Logout</button>
      </div>

      <div className="tab-content">
        {activeTab === 'profile' && (
          <div>
            <h2>Profile</h2>
            <div className="form">
              <input value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Name" />
              <input value={profile.email || ''} disabled placeholder="Email" />
              <button onClick={updateProfile}>Update Profile</button>
            </div>
            <h3>Saved Addresses</h3>
            {profile.addresses?.map((addr, idx) => (
              <div key={idx} style={{ padding: '1rem', background: 'var(--bg-secondary)', margin: '0.5rem 0', borderRadius: '8px' }}>
                {addr.line1}, {addr.city}, {addr.state} - {addr.postalCode}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2>Your Orders</h2>
            {orders.length === 0 ? <p>No orders yet</p> : (
              <div className="grid">
                {orders.map(order => (
                  <div key={order._id} className="card">
                    <div className="card-body">
                      <h3>Order #{order._id.slice(-6)}</h3>
                      <p>Status: {order.status}</p>
                      <p>Total: ₹{order.totalAmount}</p>
                      <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                      <p>Items: {order.items?.length || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <h2>Your Reviews</h2>
            {reviews.length === 0 ? <p>No reviews yet</p> : (
              <div className="grid">
                {reviews.map(review => (
                  <div key={review._id} className="card">
                    <div className="card-body">
                      <p>Rating: {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                      <p>{review.reviewText}</p>
                      <p>Status: {review.approved ? 'Approved' : 'Pending'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

