// client/src/pages/Contact.jsx
import Navbar from "../components/Navbar";
import useScrollReveal from "../hooks/useScrollReveal";

export default function Contact() {
  useScrollReveal();

  return (
    <>
      <Navbar />

      <div className="contact-page">
        <div className="container contact-hero reveal">
          <h1>Contact Moris Clothings</h1>
          <p>We respond fast. Choose your preferred way to reach us.</p>
        </div>

        {/* CONTACT GRID */}
        <div className="container contact-grid reveal">
          <a
            className="contact-card whatsapp pulse"
            href="https://wa.me/447440092312"
            target="_blank"
            rel="noreferrer"
          >
            <h3>WhatsApp Chat</h3>
            <p>Instant response within minutes</p>
          </a>

          <a className="contact-card" href="mailto:moris.era@yahoo.com">
            <h3>Email Us</h3>
            <p>moris.era@yahoo.com</p>
          </a>

          <a className="contact-card" href="tel:+447440092312">
            <h3>Call Us</h3>
            <p>+44 7440 092312</p>
          </a>

          <a
            className="contact-card"
            href="https://instagram.com/moris.era"
            target="_blank"
            rel="noreferrer"
          >
            <h3>Instagram</h3>
            <p>@moris.era</p>
          </a>

          <div className="contact-card disabled">
            <h3>Secure Payment (Stripe)</h3>
            <p>Coming soon</p>
          </div>
        </div>

        <div className="container map-section reveal">
          <h2>Where We Operate</h2>
          <div className="map-box">
            <p>United Kingdom (Remote Tailoring Service)</p>
          </div>
        </div>
      </div>
    </>
  );
}
