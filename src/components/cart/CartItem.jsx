import { useCart } from "../../context/CartContext";
import { CUSTOMER_LIMIT } from "../../context/InventoryContext";

export default function CartItem({ item }) {
  const { removeItem, updateQuantity, itemCount } = useCart();
  const atCustomerLimit = itemCount >= CUSTOMER_LIMIT;

  return (
    <div className="cart-item">
      <div className="cart-item-info">
        <span className="cart-item-name">{item.name}</span>
        <span className="cart-item-price">${item.price.toFixed(2)} each</span>
      </div>
      <div className="cart-item-controls">
        <button
          onClick={() =>
            item.quantity > 1
              ? updateQuantity(item.id, item.quantity - 1)
              : removeItem(item.id)
          }
        >
          −
        </button>
        <span>{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          disabled={atCustomerLimit}
        >
          +
        </button>
        <button className="btn-remove" onClick={() => removeItem(item.id)}>
          Remove
        </button>
      </div>
      <span className="cart-item-total">
        ${(item.price * item.quantity).toFixed(2)}
      </span>
    </div>
  );
}
