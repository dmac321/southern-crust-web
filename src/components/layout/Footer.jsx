import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Southern Crust Bakery · Made with love</p>
      <p className="footer-sub">Delivery only · Orders must be placed 48 hours in advance.</p>
      <nav className="footer-links">
        <Link to="/refund-policy">Refund &amp; Cancellation Policy</Link>
        <span className="footer-divider">·</span>
        <Link to="/cottage-food-disclaimer">Cottage Food Disclaimer</Link>
      </nav>
    </footer>
  );
}
