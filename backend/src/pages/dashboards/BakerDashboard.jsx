import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function BakerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', price: '', imageURL: '', description: '', ingredients: '', weight: '', stock: '', veg: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, productsRes, ordersRes, reviewsRes] = await Promise.all([
        api.get('/users/me').catch(() => ({ data: user })),
        api.get('/products/my').catch(() => ({ data: [] })),
        api.get('/orders/baker').catch(() => ({ data: [] })),
        api.get('/reviews/baker').catch(() => ({ data: [] }))
      ]);
      setProfile(profileRes.data || user);
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
      setReviews(reviewsRes.data || []);
    } catch {
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        ingredients: productForm.ingredients.split(',').map(s => s.trim()).filter(Boolean)
      };
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product added');
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({ name: '', price: '', imageURL: '', description: '', ingredients: '', weight: '', stock: '', veg: true });
      fetchData();
    } catch {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggleVisibility = async (id, current) => {
    try {
      await api.patch(`/products/${id}/visibility`, { visible: !current });
      toast.success('Visibility updated');
      fetchData();
    } catch {
      toast.error('Failed to update');
    }
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <main className="container"><div className="loading"><div className="spinner"></div></div></main>;

  return (
    <main className="container dashboard">
      <h1>Baker Dashboard</h1>
      <div className="tabs">
        <button className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Your Profile</button>
        <button className={`tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Your Products</button>
        <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Orders</button>
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
              <button onClick={async () => {
                await api.put('/users/me', { name: profile.name });
                toast.success('Profile updated');
              }}>Update Profile</button>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <h2>Your Products</h2>
            <button onClick={() => { setShowProductForm(true); setEditingProduct(null); }}>Add Product</button>
            {showProductForm && (
              <form onSubmit={handleProductSubmit} className="form" style={{ margin: '2rem 0' }}>
                <input placeholder="Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                <input placeholder="Price" type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
                <input placeholder="Image URL" value={productForm.imageURL} onChange={(e) => setProductForm({ ...productForm, imageURL: e.target.value })} required />
                <textarea placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                <input placeholder="Ingredients (comma separated)" value={productForm.ingredients} onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value })} />
                <input placeholder="Weight" value={productForm.weight} onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })} />
                <input placeholder="Stock" type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} />
                <label><input type="checkbox" checked={productForm.veg} onChange={(e) => setProductForm({ ...productForm, veg: e.target.checked })} /> Veg</label>
                <button type="submit">{editingProduct ? 'Update' : 'Add'} Product</button>
                <button type="button" onClick={() => { setShowProductForm(false); setEditingProduct(null); }}>Cancel</button>
              </form>
            )}
            <div className="grid">
              {products.map(product => (
                <div key={product._id} className="card">
                  <img src={product.imageURL} alt={product.name} />
                  <div className="card-body">
                    <h3>{product.name}</h3>
                    <p>₹{product.price}</p>
                    <p>Status: {product.approved ? 'Approved' : 'Pending'} | {product.visible ? 'Visible' : 'Hidden'}</p>
                    <button onClick={() => { setEditingProduct(product); setProductForm({ name: product.name, price: product.price, imageURL: product.imageURL, description: product.description, ingredients: product.ingredients?.join(', ') || '', weight: product.weight || '', stock: product.stock || '', veg: product.veg }); setShowProductForm(true); }}>Edit</button>
                    <button onClick={() => handleDelete(product._id)}>Delete</button>
                    <button onClick={() => toggleVisibility(product._id, product.visible)}>{product.visible ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2>Orders</h2>
            {orders.length === 0 ? <p>No orders yet</p> : (
              <div className="grid">
                {orders.map(order => (
                  <div key={order._id} className="card">
                    <div className="card-body">
                      <h3>Order #{order._id.slice(-6)}</h3>
                      <p>Total: ₹{order.totalAmount}</p>
                      <p>Status: {order.status}</p>
                      <select value={order.status} onChange={(e) => updateOrderStatus(order._id, e.target.value)}>
                        <option value="baking">Baking</option>
                        <option value="baked">Baked</option>
                      </select>
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

