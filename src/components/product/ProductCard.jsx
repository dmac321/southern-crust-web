import { useCart } from "../../context/CartContext";
import { useInventory, CUSTOMER_LIMIT } from "../../context/InventoryContext";

export default function ProductCard({ product }) {
  const { addItem, itemCount } = useCart();
  const { isSoldOut } = useInventory();

  const cartFull = itemCount >= CUSTOMER_LIMIT;

  function getButtonState() {
    if (!product.available) return "unavailable";
    if (isSoldOut) return "soldout";
    if (cartFull) return "cartfull";
    return "available";
  }

  const state = getButtonState();

  return (
    <div className={`product-card ${state === "unavailable" ? "unavailable" : ""}`}>
      <img src={product.image} alt={product.name} className="product-image" />
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          {state === "available" && (
            <button className="btn-add" onClick={() => addItem(product)}>
              Add to Cart
            </button>
          )}
          {state === "soldout" && (
            <span className="out-of-stock">Sold Out</span>
          )}
          {state === "cartfull" && (
            <span className="out-of-stock">Cart full ({CUSTOMER_LIMIT} max)</span>
          )}
          {state === "unavailable" && (
            <span className="out-of-stock">Currently Unavailable</span>
          )}
        </div>
      </div>
    </div>
  );
}
