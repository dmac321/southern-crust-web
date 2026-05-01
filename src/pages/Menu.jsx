import { useState } from "react";
import { products, categories } from "../data/products";
import ProductCard from "../components/product/ProductCard";
import { useInventory, STORE_LIMIT } from "../context/InventoryContext";

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState("all");
  const { remaining, isSoldOut } = useInventory();

  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <main className="menu-page">
      <h1>Our Menu</h1>

      {isSoldOut ? (
        <div className="inventory-banner soldout-banner">
          We're sold out for this week — thank you for your support! Inventory
          resets every Thursday at 1 AM.
        </div>
      ) : (
        <div className="inventory-banner availability-banner">
          <span className="availability-dot" />
          {remaining} of {STORE_LIMIT} items available this week · Resets Thursday at 1 AM
        </div>
      )}

      <p className="menu-subtitle">All orders placed at least 48 hours in advance. Delivery only.</p>

      <div className="category-filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
