import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [vegOnly, setVegOnly] = useState(false);
  const [sort, setSort] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProducts(); }, [vegOnly, sort]);
  async function fetchProducts() {
    setLoading(true);
    const params = {};
    if (vegOnly) params.veg = true;
    if (sort) params.sort = sort;
    const { data } = await api.get('/products', { params }).catch(() => ({ data: [] }));
    setProducts(data);
    setLoading(false);
  }

  return (
    <main className="container">
      <h1>Products</h1>
      <div className="filters">
        <label><input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} /> Veg only</label>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>
      {loading ? <div className="loading"><div className="spinner"></div></div> : (
        <div className="grid">
          {products.slice(0, 8).map(p => (
            <Link key={p._id} to={`/products/${p._id}`} className="card">
              <img src={p.imageURL} alt={p.name} />
              <div className="card-body">
                <h3>{p.name}</h3>
                <p>₹{p.price}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
