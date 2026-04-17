//client/src/pages/About.jsx
import Navbar from "../components/Navbar";

export default function About() {
  return (
    <>
      <Navbar />

      <div className="page">
        <div className="container">
          <h1 className="title">Moris Clothings</h1>

          <p className="muted">
            Moris Clothings is a modern tailoring and fashion brand...
          </p>

          <h3 className="title">Our Promise</h3>

          <ul className="muted">
            <li>Premium fabric sourcing</li>
            <li>Fast tailoring & delivery</li>
            <li>Perfect fit guarantee</li>
          </ul>
        </div>
      </div>
    </>
  );
}
