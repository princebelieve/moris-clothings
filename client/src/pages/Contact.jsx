import Navbar from "../components/Navbar";

export default function Contact() {
  return (
    <>
      <Navbar />

      <div className="page">
        <h1>Contact Moris Clothings</h1>

        <p>We respond within minutes on WhatsApp.</p>

        <a href="https://wa.me/447440092312" target="_blank" rel="noreferrer">
          <button
            style={{ padding: 12, background: "#25D366", color: "white" }}
          >
            Chat on WhatsApp
          </button>
        </a>

        <div style={{ marginTop: 20 }}>
          <p>Email: moris.era@yahoo.com</p>
          <p>Phone: +44 7440 092312</p>
          <p>Instagram: @moris.era</p>
        </div>
      </div>
    </>
  );
}
