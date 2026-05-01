import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="home">
      <section className="hero">
        <img
          src="/logo.png"
          srcSet="/logo.png 1x, /logo@2x.png 2x"
          alt="Southern Crust Bakery"
          className="hero-logo"
        />
        <h1>Baked Fresh, Delivered with Love</h1>
        <p>
          Southern Crust is a home bakery rooted in Southern tradition. Every loaf,
          roll, and cookie is made from scratch with quality ingredients.
        </p>
        <Link to="/menu" className="btn-primary">
          Browse the Menu
        </Link>
      </section>

      <section className="features">
        <div className="feature">
          <h3>Made to Order</h3>
          <p>Every item is baked fresh for your order — nothing sits on a shelf.</p>
        </div>
        <div className="feature">
          <h3>Local Ingredients</h3>
          <p>We source honey, eggs, and produce from local farms when possible.</p>
        </div>
        <div className="feature">
          <h3>Delivery & Farmer's Markets</h3>
          <p>We deliver within 10 miles. Find us at local farmer's markets too. Order 48 hours ahead.</p>
        </div>
      </section>
    </main>
  );
}
