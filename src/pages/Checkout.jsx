import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useInventory } from "../context/InventoryContext";

const today = new Date();
const minDate = new Date(today);
minDate.setDate(today.getDate() + 2);
const minDateStr = minDate.toISOString().split("T")[0];

const CARD_STYLE = {
  ".input-container": {
    borderColor: "#e5d7c5",
    borderRadius: "8px",
  },
  ".input-container.is-focus": {
    borderColor: "#c8a97e",
  },
  ".input-container.is-error": {
    borderColor: "#c0392b",
  },
  input: {
    color: "#2d1f0f",
    fontFamily: "Georgia, serif",
    fontSize: "15px",
  },
  "input::placeholder": {
    color: "#7a6550",
  },
  ".message-text": { color: "#7a6550" },
  ".message-icon": { color: "#c8a97e" },
};

const SQUARE_ENV = import.meta.env.VITE_SQUARE_ENV ?? "production";
const SQUARE_SDK_URL =
  SQUARE_ENV === "sandbox"
    ? "https://sandbox.web.squarecdn.com/v1/square.js"
    : "https://web.squarecdn.com/v1/square.js";

function loadSquareSdk() {
  // Already loaded — nothing to do
  if (window.Square) return Promise.resolve();

  // Script tag exists in DOM but hasn't fired onload yet — wait for it
  const existing = document.querySelector(`script[src="${SQUARE_SDK_URL}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
    });
  }

  // Not in DOM at all — inject it and await
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SQUARE_SDK_URL;
    script.onload = resolve;
    script.onerror = () =>
      reject(new Error(`Square SDK failed to load (${SQUARE_ENV})`));
    document.head.appendChild(script);
  });
}

function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return new Date(+y, +m - 1, +d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function Checkout() {
  const { cart, subtotal, itemCount, clearCart } = useCart();
  const { remaining, isSoldOut, recordOrder } = useInventory();

  const cardRef = useRef(null);
  const [cardReady, setCardReady] = useState(false);
  const [cardInitError, setCardInitError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    deliveryDate: "",
    instructions: "",
  });
  const [errors, setErrors] = useState({});
  const [paymentError, setPaymentError] = useState(null);
  const [inventoryError, setInventoryError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [orderSnapshot, setOrderSnapshot] = useState(null);

  useEffect(() => {
    if (cart.length === 0) return;

    let squareCard;
    let cancelled = false;

    async function initSquare() {
      // 1. Validate env vars — caught at build time, surface clearly
      const appId = import.meta.env.VITE_SQUARE_APP_ID;
      const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;
      if (!appId || !locationId) {
        setCardInitError(
          "Payment configuration is missing. Please contact us at hello@southerncrust.com to place your order."
        );
        return;
      }

      // 2. Ensure the SDK script is loaded and window.Square is set
      try {
        await loadSquareSdk();
      } catch {
        if (!cancelled) {
          setCardInitError(
            "Payment system could not be reached. Please check your connection and refresh."
          );
        }
        return;
      }

      if (cancelled) return;

      // 3. Initialize Square payments and mount the card element
      try {
        const payments = window.Square.payments(appId, locationId);
        squareCard = await payments.card({ style: CARD_STYLE });
        await squareCard.attach("#card-container");
        if (!cancelled) {
          cardRef.current = squareCard;
          setCardReady(true);
        } else {
          squareCard.destroy();
        }
      } catch (err) {
        if (!cancelled) {
          const detail = err?.message ?? "";
          const msg = detail.toLowerCase().includes("application id")
            ? "Invalid payment credentials. Please contact us to complete your order."
            : "Payment form failed to initialize. Please refresh the page.";
          setCardInitError(msg);
        }
      }
    }

    initSquare();
    return () => {
      cancelled = true;
      squareCard?.destroy();
    };
  }, [cart.length]);

  // Confirmed order screen
  if (orderSnapshot) {
    return (
      <main className="checkout-page">
        <div className="order-confirmed">
          <div className="confirmed-icon">✓</div>
          <h1>Order Confirmed!</h1>
          <p>
            Thanks, <strong>{orderSnapshot.name}</strong>! Your payment was processed
            and your order is confirmed.
          </p>

          <div className="confirmed-summary">
            <h3>What you ordered</h3>
            <ul>
              {orderSnapshot.items.map((item) => (
                <li key={item.id}>
                  {item.name} × {item.quantity} —{" "}
                  <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                </li>
              ))}
            </ul>
            <div className="confirmed-total">
              Total charged: <strong>${orderSnapshot.subtotal.toFixed(2)}</strong>
            </div>
          </div>

          <div className="confirmed-details">
            <p>
              <strong>Delivery date:</strong> {formatDate(orderSnapshot.deliveryDate)}
            </p>
            <p>
              <strong>Delivery address:</strong> {orderSnapshot.address}
            </p>
            {orderSnapshot.instructions && (
              <p>
                <strong>Instructions:</strong> {orderSnapshot.instructions}
              </p>
            )}
            <p>
              We'll text <strong>{orderSnapshot.phone}</strong> to confirm your
              delivery window.
            </p>
          </div>

          <Link to="/menu" className="btn-primary">Back to Menu</Link>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
        <Link to="/menu" className="btn-primary">Back to Menu</Link>
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

  async function handleSubmit(e) {
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

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const tokenResult = await cardRef.current.tokenize();

      if (tokenResult.status !== "OK") {
        const msg =
          tokenResult.errors?.[0]?.message ??
          "Card information is invalid. Please check and try again.";
        setPaymentError(msg);
        setIsProcessing(false);
        return;
      }

      const note = [
        `Southern Crust — ${form.name}`,
        `Delivery: ${form.deliveryDate}`,
        `Address: ${form.address}`,
        form.instructions ? `Instructions: ${form.instructions}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: tokenResult.token,
          amountCents: Math.round(subtotal * 100),
          note,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPaymentError(data.error ?? "Payment failed. Please try again.");
        setIsProcessing(false);
        return;
      }

      // Snapshot order before clearing cart
      setOrderSnapshot({
        items: cart.map((i) => ({ ...i })),
        subtotal,
        name: form.name,
        phone: form.phone,
        address: form.address,
        deliveryDate: form.deliveryDate,
        instructions: form.instructions,
        paymentId: data.paymentId,
      });

      recordOrder(itemCount);
      clearCart();
    } catch {
      setPaymentError("Network error. Please check your connection and try again.");
      setIsProcessing(false);
    }
  }

  return (
    <main className="checkout-page">
      <h1>Checkout</h1>

      {inventoryError && (
        <div className="inventory-banner soldout-banner" style={{ marginBottom: "1.5rem" }}>
          Sorry — we sold out while you were shopping. Check back Thursday after 1 AM.
        </div>
      )}

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>

          <h2>Delivery Information</h2>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name" name="name" type="text"
              value={form.name} onChange={handleChange}
              placeholder="Jane Smith"
              className={errors.name ? "input-error" : ""}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone" name="phone" type="tel"
              value={form.phone} onChange={handleChange}
              placeholder="(555) 867-5309"
              className={errors.phone ? "input-error" : ""}
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Delivery Address</label>
            <input
              id="address" name="address" type="text"
              value={form.address} onChange={handleChange}
              placeholder="123 Main St, City, State 12345"
              className={errors.address ? "input-error" : ""}
            />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="deliveryDate">Preferred Delivery Date</label>
            <input
              id="deliveryDate" name="deliveryDate" type="date"
              value={form.deliveryDate} onChange={handleChange}
              min={minDateStr}
              className={errors.deliveryDate ? "input-error" : ""}
            />
            {errors.deliveryDate && (
              <span className="field-error">{errors.deliveryDate}</span>
            )}
            <span className="field-hint">Orders require at least 48 hours notice.</span>
          </div>

          <div className="form-group">
            <label htmlFor="instructions">
              Delivery Instructions <span className="field-optional">(optional)</span>
            </label>
            <textarea
              id="instructions" name="instructions"
              value={form.instructions} onChange={handleChange}
              placeholder="Gate code, leave at door, allergy notes, etc."
              rows={3}
              className="checkout-textarea"
            />
          </div>

          <h2 className="payment-heading">Payment</h2>

          {cardInitError ? (
            <p className="field-error">{cardInitError}</p>
          ) : (
            <div className="card-container-wrapper">
              <div id="card-container" />
              {!cardReady && <p className="card-loading-text">Loading payment form…</p>}
            </div>
          )}

          {paymentError && (
            <div className="payment-error-box">{paymentError}</div>
          )}

          <button
            type="submit"
            className="btn-primary btn-full pay-btn"
            disabled={isProcessing || !cardReady}
          >
            {isProcessing ? (
              <span className="btn-processing">
                <span className="spinner" /> Processing…
              </span>
            ) : (
              `Pay $${subtotal.toFixed(2)}`
            )}
          </button>

          <div className="square-trust">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Payments secured by Square
          </div>

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
            <span>Total</span>
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
