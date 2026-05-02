import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

export default function Navbar() {
  const { itemCount } = useCart();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Southern Crust
      </Link>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/menu">Menu</Link>
        <Link to="/about">About</Link>
        <Link to="/cart" className="cart-link">
          Cart {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </Link>
      </div>
    </nav>
  );
}
