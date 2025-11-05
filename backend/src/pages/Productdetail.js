import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => { (async () => {
    setLoading(true);
    const { data } = await api.get(`/products/${id}`).catch(() => ({ data: null }));
    setProduct(data);
    setLoading(false);
  })(); }, [id]);

  if (loading) return <main className="container"><div className="loading"><div className="spinner"></div></div></main>;
  if (!product) return <main className="container"><p>Not found</p></main>;

  return (
    <main className="container">
      <div className="detail">
        <img src={product.imageURL} alt={product.name} />
        <div>
          <h1>{product.name}</h1>
          <p className="price">₹{product.price}</p>
          <p>{product.description}</p>
          {product.ingredients && product.ingredients.length > 0 && (
            <div>
              <h3>Ingredients:</h3>
              <ul>
                {product.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
              </ul>
            </div>
          )}
          <p>Weight: {product.weight || 'N/A'}</p>
          <p>Stock: {product.stock}</p>
          <button className="btn" onClick={() => { addItem(product, 1); toast.success('Item added to cart successfully!'); }}>Add to Cart</button>
        </div>
      </div>
    </main>
  );
}
