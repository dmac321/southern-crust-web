export default function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Southern Crust Bakery · Made with love</p>
      <p className="footer-sub">Orders must be placed 48 hours in advance.</p>
    </footer>
  );
}
