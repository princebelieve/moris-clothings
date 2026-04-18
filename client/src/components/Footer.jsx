//client/src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h3>Moris Clothings</h3>
          <p>Premium tailoring & modern fashion brand.</p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <p>Home</p>
          <p>Collection</p>
          <p>Contact</p>
        </div>

        <div>
          <h4>Services</h4>
          <p>Custom Tailoring</p>
          <p>Ready-to-Wear</p>
          <p>Design Consultation</p>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Moris Clothings. All rights reserved.
      </div>
    </footer>
  );
}
