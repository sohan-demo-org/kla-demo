import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import Admin from './pages/Admin';
import Article from './pages/Article';
import Careers from './pages/Careers';
import Company from './pages/Company';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Investors from './pages/Investors';
import JobDetail from './pages/JobDetail';
import Newsroom from './pages/Newsroom';
import NotFound from './pages/NotFound';
import ProductDetail from './pages/ProductDetail';
import Products from './pages/Products';
import Search from './pages/Search';
import Services from './pages/Services';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/company" element={<Company />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/careers/:id" element={<JobDetail />} />
          <Route path="/newsroom" element={<Newsroom />} />
          <Route path="/newsroom/:slug" element={<Article />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/search" element={<Search />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
