import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

function WheatStalk() {
  return (
    <svg viewBox="0 0 24 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12 120 C11.5 95 12.5 65 12 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <ellipse cx="12" cy="7" rx="3.2" ry="6" fill="currentColor" opacity="0.75" />
      <ellipse cx="7" cy="17" rx="2.8" ry="5" fill="currentColor" opacity="0.6"
        transform="rotate(-28 7 17)" />
      <ellipse cx="17" cy="17" rx="2.8" ry="5" fill="currentColor" opacity="0.6"
        transform="rotate(28 17 17)" />
      <ellipse cx="5" cy="28" rx="2.2" ry="4" fill="currentColor" opacity="0.42"
        transform="rotate(-38 5 28)" />
      <ellipse cx="19" cy="28" rx="2.2" ry="4" fill="currentColor" opacity="0.42"
        transform="rotate(38 19 28)" />
      <line x1="12" y1="1" x2="12" y2="-8"
        stroke="currentColor" strokeWidth="0.8" opacity="0.5" strokeLinecap="round" />
      <line x1="7" y1="13" x2="3" y2="5"
        stroke="currentColor" strokeWidth="0.7" opacity="0.35" strokeLinecap="round" />
      <line x1="17" y1="13" x2="21" y2="5"
        stroke="currentColor" strokeWidth="0.7" opacity="0.35" strokeLinecap="round" />
    </svg>
  );
}

const STALKS = [
  { cls: "ws-1", speed: 0.12, sway: "sway-l", delay: "0s"   },
  { cls: "ws-2", speed: 0.21, sway: "sway-r", delay: "1.3s" },
  { cls: "ws-3", speed: 0.17, sway: "sway-l", delay: "0.5s" },
  { cls: "ws-4", speed: 0.28, sway: "sway-r", delay: "2.1s" },
  { cls: "ws-5", speed: 0.14, sway: "sway-l", delay: "0.9s" },
  { cls: "ws-6", speed: 0.25, sway: "sway-r", delay: "3.0s" },
];

export default function Home() {
  const homeRef = useRef(null);

  // Wheat stalk parallax — uses CSS custom property to avoid fighting sway animation
  useEffect(() => {
    const container = homeRef.current;
    if (!container) return;
    const stalks = container.querySelectorAll("[data-parallax-speed]");
    const onScroll = () => {
      const y = window.scrollY;
      stalks.forEach((el) => {
        el.style.setProperty(
          "--parallax-y",
          `${y * parseFloat(el.dataset.parallaxSpeed)}px`
        );
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fade-in on scroll into view
  useEffect(() => {
    const els = document.querySelectorAll(".fade-in");
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <main className="home" ref={homeRef}>
      <section className="hero-dark" aria-label="Welcome to Southern Crust">

        {/* Warm ambient glow */}
        <div className="ambient-glow" aria-hidden="true" />

        {/* Floating wheat stalks */}
        <div className="stalks-layer" aria-hidden="true">
          {STALKS.map(({ cls, speed, sway, delay }) => (
            <div
              key={cls}
              className={`stalk ${cls}`}
              data-parallax-speed={speed}
            >
              <div className={`stalk-body ${sway}`} style={{ animationDelay: delay }}>
                <WheatStalk />
              </div>
            </div>
          ))}
        </div>

        {/* Steam wisps */}
        <div className="steam-container" aria-hidden="true">
          <span className="steam steam-1" />
          <span className="steam steam-2" />
          <span className="steam steam-3" />
          <span className="steam steam-4" />
          <span className="steam steam-5" />
        </div>

        {/* Hero content */}
        <div className="hero-inner fade-in">
          <span className="hero-eyebrow">Southern Crust · Artisan Bakery</span>
          <h1 className="hero-title">Love in Every Loaf</h1>
          <p className="hero-tagline">
            Rooted in Southern tradition.<br />
            Baked from scratch with real ingredients and a whole lot of heart.
          </p>
          <Link to="/menu" className="btn-hero">Browse the Menu</Link>
        </div>

        <div className="hero-scroll-hint" aria-hidden="true">
          <span className="scroll-line" />
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="features-inner">
          <div className="feature fade-in">
            <span className="feature-mark">✦</span>
            <h3>Made to Order</h3>
            <p>Every item baked fresh for your order — nothing sits on a shelf.</p>
          </div>
          <div className="feature fade-in">
            <span className="feature-mark">✦</span>
            <h3>Local Ingredients</h3>
            <p>Honey, eggs, and produce sourced from local farms when possible.</p>
          </div>
          <div className="feature fade-in">
            <span className="feature-mark">✦</span>
            <h3>Delivered to You</h3>
            <p>Delivery within 10 miles, or find us at local farmer's markets.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
