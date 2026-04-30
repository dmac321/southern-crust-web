import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItem from "../components/cart/CartItem";

export default function Cart() {
  const { cart, subtotal, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <h1>Your Cart</h1>
        <p>Your cart is empty.</p>
        <Link to="/menu" className="btn-primary">
          Back to Menu
        </Link>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <h1>Your Cart</h1>

      <div className="cart-items">
        {cart.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>

      <div className="cart-summary">
        <div className="cart-subtotal">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <p className="cart-note">
          Final total (including any delivery fee) will be confirmed when your order is accepted.
        </p>
        <div className="cart-actions">
          <button className="btn-secondary" onClick={clearCart}>
            Clear Cart
          </button>
          <Link to="/checkout" className="btn-primary">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </main>
  );
}
