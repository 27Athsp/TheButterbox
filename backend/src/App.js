import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/Productdetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OurStory from './pages/OurStory';
import ContactUs from './pages/ContactUs';
import CustomerDashboard from './pages/dashboards/CustomerDashboard';
import BakerDashboard from './pages/dashboards/BakerDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/our-story" element={<OurStory />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/customer-dashboard" element={<ProtectedRoute roles={["customer"]}><CustomerDashboard /></ProtectedRoute>} />
              <Route path="/baker-dashboard" element={<ProtectedRoute roles={["baker"]}><BakerDashboard /></ProtectedRoute>} />
              <Route path="/admin-dashboard" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            </Routes>
            <Footer />
            <ToastContainer position="top-right" autoClose={3000} />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
