import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="hero">
      <div>
        <h1>Tailored Style. Premium Confidence.</h1>

        <p>
          Premium tailoring, senator wears, suits, gowns and custom fashion for
          men and women.
        </p>

        <div className="hero-buttons">
          <button className="primary" onClick={() => navigate("/collection")}>
            Shop Collection
          </button>

          <button
            className="secondary"
            onClick={() => window.open("https://wa.me/447440092312", "_blank")}
          >
            WhatsApp
          </button>
        </div>
      </div>

      <img src="/hero.jpg" alt="Moris Clothings" className="hero-image" />
    </div>
  );
}
