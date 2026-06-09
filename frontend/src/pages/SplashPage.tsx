import { useNavigate } from "react-router-dom";
import SplashScene from "../components/three/SplashScene";
import "./SplashPage.css";

export default function SplashPage() {
  const navigate = useNavigate();

  return (
    <div className="full-page splash-page">
      <div className="canvas-container">
        <SplashScene />
      </div>

      <div className="page-content splash-content">
        <div className="brand-container">
          <h1 className="brand-title gradient-text">EchOes</h1>
          <p className="brand-tagline">Every number unlocks a memory.</p>
        </div>

        <button className="btn-skip glass" onClick={() => navigate("/pin")}>
          Skip Intro
        </button>
      </div>
    </div>
  );
}
