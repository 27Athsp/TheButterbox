import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, updateQty, removeItem, subtotal, discount, total, setCoupon, address, setAddress } = useCart();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India' });

  useEffect(() => {
    if (user) {
      api.get('/users/me').then(r => {
        if (r.data?.addresses) setSavedAddresses(r.data.addresses);
      }).catch(() => {});
    }
  }, [user]);

  const applyCoupon = async () => {
    setMsg('');
    try {
      const { data } = await api.post('/coupons/validate', { code, amount: subtotal }).catch(() => ({ data: null }));
      if (!data || !data.valid) {
        setMsg('Invalid or expired coupon');
        toast.error('Invalid or expired coupon');
        return;
      }
      setCoupon(data.coupon);
      setMsg(`Applied ${data.coupon.discountPercent}% off`);
      toast.success(`Coupon applied! ${data.coupon.discountPercent}% off`);
    } catch {
      setMsg('Invalid or expired coupon');
      toast.error('Invalid or expired coupon');
    }
  };

  const saveNewAddress = async () => {
    if (!user) return;
    try {
      await api.post('/users/address', newAddress);
      toast.success('Address saved');
      setShowNewAddress(false);
      setNewAddress({ line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India' });
      const { data } = await api.get('/users/me');
      if (data?.addresses) setSavedAddresses(data.addresses);
    } catch {
      toast.error('Failed to save address');
    }
  };

  const proceedToPay = async () => {
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }
    if (!address && savedAddresses.length === 0 && !showNewAddress) {
      toast.error('Please select or add an address');
      return;
    }
    const finalAddress = address || (showNewAddress ? newAddress : savedAddresses[0]);
    if (!finalAddress.line1 || !finalAddress.city) {
      toast.error('Please complete address details');
      return;
    }
    setAddress(finalAddress);
    try {
      const { data } = await api.post('/payments/create-order', { amount: total }).catch(() => ({ data: null }));
      if (!data?.order) {
        toast.error('Payment initialization failed');
        return;
      }
      const options = {
        key: data.keyId,
        amount: data.order.amount,
        currency: 'INR',
        order_id: data.order.id,
        name: 'Bakery Marketplace',
        handler: async function (response) {
          const verify = await api.post('/payments/verify', response).then(r => r.data).catch(() => null);
          if (verify?.success) {
            toast.success('Payment successful!');
            // Create order in backend
            await api.post('/orders', {
              items: items.map(i => ({ productId: i._id, quantity: i.quantity, priceAtPurchase: i.price })),
              totalAmount: total,
              addressSnapshot: finalAddress
            }).catch(() => {});
            navigate('/customer-dashboard');
          } else {
            toast.error('Payment verification failed');
          }
        },
        prefill: { email: user.email, name: user.name }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => toast.error('Payment failed'));
      rzp.open();
    } catch (err) {
      toast.error('Payment initialization failed');
    }
  };

  if (items.length === 0) return (
    <main className="container">
      <h1>Your Cart</h1>
      <p>Cart is Empty</p>
      <Link className="btn" to="/products">Shop Now</Link>
    </main>
  );

  return (
    <main className="container">
      <h1>Your Cart</h1>
      <div className="cart-list">
        {items.map(item => (
          <div key={item._id} className="cart-item">
            <img src={item.imageURL} alt={item.name} />
            <div className="info">
              <h3>{item.name}</h3>
              <p>₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}</p>
              <div className="qty">
                <button onClick={() => updateQty(item._id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQty(item._id, item.quantity + 1)}>+</button>
                <button onClick={() => { removeItem(item._id); toast.info('Item removed'); }}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <aside className="summary">
          <h2>Address</h2>
          {savedAddresses.length > 0 && (
            <div>
              {savedAddresses.map((addr, idx) => (
                <label key={idx} style={{ display: 'block', margin: '0.5rem 0' }}>
                  <input type="radio" name="address" checked={address === addr} onChange={() => setAddress(addr)} />
                  {addr.line1}, {addr.city}, {addr.state} - {addr.postalCode}
                </label>
              ))}
            </div>
          )}
          <button onClick={() => setShowNewAddress(!showNewAddress)} style={{ marginTop: '1rem' }}>
            {showNewAddress ? 'Cancel' : 'Add New Address'}
          </button>
          {showNewAddress && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input placeholder="Address Line 1" value={newAddress.line1} onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} />
              <input placeholder="Address Line 2" value={newAddress.line2} onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })} />
              <input placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
              <input placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} />
              <input placeholder="Postal Code" value={newAddress.postalCode} onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} />
              <input placeholder="Country" value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} />
              <button onClick={saveNewAddress}>Save Address</button>
            </div>
          )}
        </aside>

        <aside className="summary">
          <h2>Discounts</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} style={{ flex: 1 }} />
            <button onClick={applyCoupon}>Apply</button>
          </div>
          {msg && <p style={{ color: msg.includes('Applied') ? 'green' : 'red' }}>{msg}</p>}
          <h2>Order Summary</h2>
          <p>Subtotal: ₹{subtotal}</p>
          <p>Discount: -₹{discount}</p>
          <p><b>Total: ₹{total}</b></p>
          <button className="btn" onClick={proceedToPay} style={{ width: '100%', marginTop: '1rem' }}>Proceed to Pay</button>
        </aside>
      </div>
    </main>
  );
}
