import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Home() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get('/reviews/approved').then(r => {
      if (r.data && r.data.length > 0) setReviews(r.data);
    }).catch(() => {});
  }, []);

  const reviewTexts = reviews.length > 0 
    ? reviews.map(r => `"${r.reviewText || 'Great product!'}" ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}`)
    : [
        '"Best croissants ever!" ★★★★★',
        '"Loved the eggless options." ★★★★☆',
        '"Packaging was perfect." ★★★★★',
        '"Quick delivery, tasty cakes." ★★★★★',
        '"My go-to bakery app." ★★★★☆',
        '"Great for parties!" ★★★★★',
        '"Affordable and fresh." ★★★★☆',
        '"Theme cakes are awesome." ★★★★★'
      ];

  return (
    <main>
      <section className="hero">
        <div className="carousel">
          <div className="slide">Freshly Baked</div>
          <div className="slide">Artisan Pastries</div>
          <div className="slide">Delivered Fast</div>
        </div>
        <Link className="btn" to="/products">Order Now</Link>
      </section>

      <section className="marquee">
        <div className="track">
          {reviewTexts.map((text, i) => (
            <span key={i}>{text}</span>
          ))}
        </div>
      </section>

      <section className="map">
        <iframe
          title="map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609709223!2d72.74109839700735!3d19.08219783819114!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b63e1b4fbabf%3A0x1a9b0f5b!2sMumbai!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin"
          width="100%" height="300" style={{ border: 0 }} allowFullScreen="" loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </main>
  );
}
