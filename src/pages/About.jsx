export default function About() {
  return (
    <main className="about-page">
      <h1>About Southern Crust</h1>
      <section className="about-content">
        <p>
          Southern Crust started in a small kitchen with a big love for baking.
          Rooted in Southern tradition, every recipe has been passed down or
          perfected over years of Sunday mornings and family gatherings.
        </p>
        <p>
          We believe good bread takes time — no shortcuts, no preservatives.
          Just real ingredients, real recipes, and real care baked into every order.
        </p>
        <h2>How It Works</h2>
        <ol>
          <li>Browse our menu and add items to your cart.</li>
          <li>Place your order at least 48 hours before your desired delivery date.</li>
          <li>We'll confirm your order and reach out with your delivery window.</li>
          <li>Enjoy fresh-baked goods delivered right to your door.</li>
        </ol>
        <h2>Delivery</h2>
        <p>
          We deliver within 10 miles. You can also find us at occasional local
          farmer's market events — follow us on social media for dates and locations.
        </p>
        <h2>Contact</h2>
        <p>
          Questions or special requests? Reach us at{" "}
          <a href="mailto:hello@southerncrust.com">hello@southerncrust.com</a>.
        </p>
      </section>
    </main>
  );
}
