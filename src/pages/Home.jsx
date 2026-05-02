import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function Home() {
  const parallaxRef = useRef(null);

  useEffect(() => {
    const el = parallaxRef.current;
    if (!el) return;
    const onScroll = () => {
      el.style.transform = `translateY(${window.scrollY * 0.28}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="home">
      <section className="hero-dark" aria-label="Welcome to Southern Crust">
        <div className="steam-container" aria-hidden="true">
          <span className="steam steam-1" />
          <span className="steam steam-2" />
          <span className="steam steam-3" />
          <span className="steam steam-4" />
          <span className="steam steam-5" />
        </div>

        <div className="hero-parallax-layer" ref={parallaxRef} data-parallax="0.28">
          <div className="hero-inner">
            <img
              src="/logo.png"
              srcSet="/logo.png 1x, /logo@2x.png 2x"
              alt="Southern Crust Bakery"
              className="hero-logo-dark"
            />
            <span className="hero-eyebrow">Artisan Home Bakery</span>
            <h1 className="hero-title">Southern Crust</h1>
            <p className="hero-tagline">Love in Every Loaf</p>
            <p className="hero-desc">
              Southern Crust is a home bakery rooted in Southern tradition. Every
              loaf, roll, and cookie is made from scratch with quality ingredients.
            </p>
            <Link to="/menu" className="btn-hero">
              Browse the Menu
            </Link>
          </div>
        </div>

        <div className="hero-scroll-hint" aria-hidden="true">
          <span className="scroll-line" />
        </div>
      </section>

      <section className="features-section">
        <div className="features-inner">
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
            <p>
              We deliver within 10 miles. Find us at local farmer's markets too.
              Order 48 hours ahead.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
