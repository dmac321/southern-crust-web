import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useInventory } from "../context/InventoryContext";

const today = new Date();
const minDate = new Date(today);
minDate.setDate(today.getDate() + 2);
const minDateStr = minDate.toISOString().split("T")[0];

export default function Checkout() {
  const { cart, subtotal, itemCount, clearCart } = useCart();
  const { remaining, isSoldOut, recordOrder } = useInventory();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    deliveryDate: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [inventoryError, setInventoryError] = useState(false);

  if (cart.length === 0 && !submitted) {
    return (
      <main className="checkout-page">
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
        <Link to="/menu" className="btn-primary">Back to Menu</Link>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="checkout-page">
        <div className="order-confirmed">
          <h1>Order Received!</h1>
          <p>
            Thanks, <strong>{form.name}</strong>! We've received your order for{" "}
            <strong>{form.deliveryDate}</strong>.
          </p>
          <p>
            We'll reach out to <strong>{form.phone}</strong> to confirm your delivery window.
          </p>
          <Link to="/menu" className="btn-primary">Back to Menu</Link>
        </div>
      </main>
    );
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.phone.trim()) {
      e.phone = "Phone number is required.";
    } else if (!/^\+?[\d\s\-().]{7,}$/.test(form.phone)) {
      e.phone = "Enter a valid phone number.";
    }
    if (!form.address.trim()) e.address = "Delivery address is required.";
    if (!form.deliveryDate) {
      e.deliveryDate = "Please choose a delivery date.";
    } else if (form.deliveryDate < minDateStr) {
      e.deliveryDate = "Delivery date must be at least 48 hours from now.";
    }
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((err) => ({ ...err, [name]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    if (isSoldOut || itemCount > remaining) {
      setInventoryError(true);
      return;
    }
    recordOrder(itemCount);
    clearCart();
    setSubmitted(true);
  }

  return (
    <main className="checkout-page">
      <h1>Checkout</h1>

      {inventoryError && (
        <div className="inventory-banner soldout-banner" style={{ marginBottom: "1.5rem" }}>
          Sorry — we sold out while you were shopping. Please check back Thursday after 1 AM.
        </div>
      )}

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <h2>Delivery Information</h2>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Smith"
              className={errors.name ? "input-error" : ""}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="(555) 867-5309"
              className={errors.phone ? "input-error" : ""}
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Delivery Address</label>
            <input
              id="address"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              placeholder="123 Main St, City, State 12345"
              className={errors.address ? "input-error" : ""}
            />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="deliveryDate">Preferred Delivery Date</label>
            <input
              id="deliveryDate"
              name="deliveryDate"
              type="date"
              value={form.deliveryDate}
              onChange={handleChange}
              min={minDateStr}
              className={errors.deliveryDate ? "input-error" : ""}
            />
            {errors.deliveryDate && (
              <span className="field-error">{errors.deliveryDate}</span>
            )}
            <span className="field-hint">Orders require 48 hours notice.</span>
          </div>

          <button type="submit" className="btn-primary btn-full">
            Place Order
          </button>
        </form>

        <div className="order-summary">
          <h2>Order Summary</h2>
          <ul className="summary-items">
            {cart.map((item) => (
              <li key={item.id} className="summary-item">
                <span>{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-subtotal">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <p className="summary-note">
            Delivery fee (if any) will be confirmed when your order is accepted.
          </p>
          <Link to="/cart" className="back-to-cart">← Edit cart</Link>
        </div>
      </div>
    </main>
  );
}
