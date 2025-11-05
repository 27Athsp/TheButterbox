import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <nav>
        <Link to="/our-story">Our Story</Link>
        <Link to="/contact-us">Contact Us</Link>
      </nav>
      <p>© {new Date().getFullYear()} Bakery Marketplace</p>
    </footer>
  );
}


