import Navbar from "../components/Navbar";

export default function About() {
  return (
    <>
      <Navbar />

      <div style={{ padding: 40, maxWidth: 800 }}>
        <h1>Moris Clothings</h1>

        <p>
          Moris Clothings is a modern tailoring and fashion brand focused on
          premium ready-to-wear and custom outfits for men and women.
        </p>

        <p>
          We combine traditional tailoring craftsmanship with modern design
          aesthetics to deliver high-quality clothing at affordable luxury
          pricing.
        </p>

        <h3>Our Promise</h3>
        <ul>
          <li>Premium fabric sourcing</li>
          <li>Fast tailoring & delivery</li>
          <li>Perfect fit guarantee</li>
        </ul>
      </div>
    </>
  );
}
