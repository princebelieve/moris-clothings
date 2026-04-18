//client/src/pages/About.jsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useScrollReveal from "../hooks/useScrollReveal";

export default function About() {
  useScrollReveal();

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="about-hero reveal">
        <div className="container about-hero-grid">
          <div className="about-copy">
            <span className="eyebrow">ABOUT MORIS CLOTHINGS</span>

            <h1>
              Crafted For Confidence.
              <br />
              Tailored For You.
            </h1>

            <p>
              Moris Clothings is a premium tailoring and fashion brand dedicated
              to helping men and women look elegant, modern and unforgettable.
              From luxury senator wears and suits to custom gowns and native
              outfits, every piece is created with precision, detail and style.
            </p>
          </div>

          <div className="about-image-wrap hover-lift">
            <img src="/about.jpg" alt="Moris Clothings tailoring" />
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="section reveal">
        <div className="container about-story">
          <div className="story-card hover-lift">
            <h2 className="title">Our Story</h2>
            <p className="muted">
              Moris Clothings was built from a passion for timeless fashion and
              quality craftsmanship. We believe clothing should do more than
              look beautiful — it should give confidence, fit perfectly and make
              every customer feel exceptional.
            </p>
          </div>

          <div className="story-card hover-lift">
            <h2 className="title">Our Promise</h2>

            <ul className="promise-list">
              <li>Premium fabric sourcing</li>
              <li>Luxury finishing and clean detailing</li>
              <li>Fast tailoring and reliable delivery</li>
              <li>Perfect fit guarantee</li>
              <li>Custom designs made for your style</li>
            </ul>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="section-alt reveal">
        <div className="container">
          <div className="values-header">
            <span className="eyebrow">WHY CLIENTS CHOOSE US</span>
            <h2 className="title">Luxury Fashion With Real Craftsmanship</h2>
          </div>

          <div className="service-grid">
            <div className="service-card hover-lift">
              <h3>Tailored Precision</h3>
              <p>
                Every outfit is measured and crafted to deliver a clean,
                confident and flattering fit.
              </p>
            </div>

            <div className="service-card hover-lift">
              <h3>Premium Materials</h3>
              <p>
                We use quality fabrics and finishing that feel luxurious and
                last longer.
              </p>
            </div>

            <div className="service-card hover-lift">
              <h3>Modern Elegance</h3>
              <p>
                Our designs blend tradition with contemporary fashion for a
                refined look.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
