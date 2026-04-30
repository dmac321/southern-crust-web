import { useCart } from "../../context/CartContext";

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <div className={`product-card ${!product.available ? "unavailable" : ""}`}>
      <img src={product.image} alt={product.name} className="product-image" />
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          {product.available ? (
            <button className="btn-add" onClick={() => addItem(product)}>
              Add to Cart
            </button>
          ) : (
            <span className="out-of-stock">Currently Unavailable</span>
          )}
        </div>
      </div>
    </div>
  );
}
