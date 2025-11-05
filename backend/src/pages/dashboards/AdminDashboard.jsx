import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bakers, setBakers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, ordersRes, customersRes, bakersRes, reviewsRes, feedbackRes] = await Promise.all([
        api.get('/users/me').catch(() => ({ data: user })),
        api.get('/orders/admin').catch(() => ({ data: [] })),
        api.get('/users/customers').catch(() => ({ data: [] })),
        api.get('/users/bakers').catch(() => ({ data: [] })),
        api.get('/reviews/admin').catch(() => ({ data: [] })),
        api.get('/feedback').catch(() => ({ data: [] }))
      ]);
      setProfile(profileRes.data || user);
      setOrders(ordersRes.data || []);
      setCustomers(customersRes.data || []);
      setBakers(bakersRes.data || []);
      setReviews(reviewsRes.data || []);
      setFeedback(feedbackRes.data || []);
    } catch {
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success('Order status updated');
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const approveReview = async (reviewId) => {
    try {
      await api.patch(`/reviews/${reviewId}/approve`);
      toast.success('Review approved');
      fetchData();
    } catch {
      toast.error('Failed to approve');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <main className="container"><div className="loading"><div className="spinner"></div></div></main>;

  return (
    <main className="container dashboard">
      <h1>Admin Dashboard</h1>
      <div className="tabs">
        <button className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Your Profile</button>
        <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Orders</button>
        <button className={`tab ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>Customers</button>
        <button className={`tab ${activeTab === 'bakers' ? 'active' : ''}`} onClick={() => setActiveTab('bakers')}>Bakers</button>
        <button className={`tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews & Feedback</button>
        <button className={`tab ${activeTab === 'logout' ? 'active' : ''}`} onClick={handleLogout}>Logout</button>
      </div>

      <div className="tab-content">
        {activeTab === 'profile' && (
          <div>
            <h2>Profile</h2>
            <div className="form">
              <input value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Name" />
              <input value={profile.email || ''} disabled placeholder="Email" />
              <button onClick={async () => {
                await api.put('/users/me', { name: profile.name });
                toast.success('Profile updated');
              }}>Update Profile</button>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2>Orders (Baked Status)</h2>
            {orders.filter(o => o.status === 'baked').length === 0 ? <p>No baked orders</p> : (
              <div className="grid">
                {orders.filter(o => o.status === 'baked').map(order => (
                  <div key={order._id} className="card">
                    <div className="card-body">
                      <h3>Order #{order._id.slice(-6)}</h3>
                      <p>Total: ₹{order.totalAmount}</p>
                      <p>Status: {order.status}</p>
                      <select value={order.status} onChange={(e) => updateOrderStatus(order._id, e.target.value)}>
                        <option value="baked">Baked</option>
                        <option value="out for delivery">Out for delivery</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'customers' && (
          <div>
            <h2>Customers</h2>
            {customers.length === 0 ? <p>No customers</p> : (
              <div className="grid">
                {customers.map(customer => (
                  <div key={customer._id} className="card">
                    <div className="card-body">
                      <h3>{customer.name}</h3>
                      <p>{customer.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bakers' && (
          <div>
            <h2>Bakers</h2>
            {bakers.length === 0 ? <p>No bakers</p> : (
              <div>
                {bakers.map(baker => (
                  <div key={baker._id} className="card" style={{ marginBottom: '2rem' }}>
                    <div className="card-body">
                      <h3>{baker.name}</h3>
                      <p>{baker.email}</p>
                      <h4>Products:</h4>
                      <div className="grid">
                        {baker.products?.map(product => (
                          <div key={product._id} className="card">
                            <img src={product.imageURL} alt={product.name} style={{ height: '100px' }} />
                            <div className="card-body">
                              <h4>{product.name}</h4>
                              <p>₹{product.price}</p>
                              <p>Status: {product.approved ? 'Approved' : 'Pending'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <h2>Reviews & Feedback</h2>
            <h3>Reviews</h3>
            {reviews.length === 0 ? <p>No reviews</p> : (
              <div className="grid">
                {reviews.map(review => (
                  <div key={review._id} className="card">
                    <div className="card-body">
                      <p>Rating: {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                      <p>{review.reviewText}</p>
                      <p>Status: {review.approved ? 'Approved' : 'Pending'}</p>
                      {!review.approved && <button onClick={() => approveReview(review._id)}>Approve</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <h3>Feedback Messages</h3>
            {feedback.length === 0 ? <p>No feedback</p> : (
              <div className="grid">
                {feedback.map(msg => (
                  <div key={msg._id} className="card">
                    <div className="card-body">
                      <h3>{msg.name}</h3>
                      <p>{msg.email}</p>
                      <p>{msg.message}</p>
                      <p>{new Date(msg.createdAt).toLocaleDateString()}</p>
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

