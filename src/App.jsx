import { BrowserRouter, Routes, Route } from "react-router-dom";
import { InventoryProvider } from "./context/InventoryContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Checkout from "./pages/Checkout";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <InventoryProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/about" element={<About />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
          <Footer />
        </CartProvider>
      </InventoryProvider>
    </BrowserRouter>
  );
}
