import "./Loader.css";

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export default function Loader({ message = "Loading…", fullScreen = true }: LoaderProps) {
  return (
    <div className={`loader-wrapper ${fullScreen ? "loader-fullscreen" : ""}`}>
      <div className="loader-orb">
        <div className="loader-ring loader-ring-1" />
        <div className="loader-ring loader-ring-2" />
        <div className="loader-ring loader-ring-3" />
        <div className="loader-core" />
      </div>
      {message && <p className="loader-msg">{message}</p>}
    </div>
  );
}
