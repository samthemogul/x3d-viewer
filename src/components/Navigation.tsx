import React from "react";
import { RotateCcw, ZoomIn, ZoomOut, MousePointer, Hand } from "lucide-react";

interface NavigationControlsProps {
  onPanMode?: () => void;
  onOrbitMode?: () => void;
  onZoomMode?: (mode: "zoomIn" | "zoomOut") => void;
  onResetView?: () => void;
  activeMode?: "pan" | "orbit" | "zoomIn" | "zoomOut";
}

const Navigation: React.FC<NavigationControlsProps> = ({
  onPanMode,
  onOrbitMode,
  onZoomMode,
  onResetView,
  activeMode = "orbit",
}) => {
  return (
    <div className="navigation-controls card">
      <div className="navigation-controls__content">
        <div className="navigation-controls__title">Navigation</div>

        <button
          className={`btn navigation-controls__button ${
            activeMode === "orbit"
              ? "navigation-controls__button--active"
              : "navigation-controls__button--inactive"
          }`}
          onClick={onOrbitMode}
        >
          <MousePointer className="w-3 h-3" />
          Orbit
        </button>

        <button
          className={`btn navigation-controls__button ${
            activeMode === "pan"
              ? "navigation-controls__button--active"
              : "navigation-controls__button--inactive"
          }`}
          onClick={onPanMode}
        >
          <Hand className="w-3 h-3" />
          Pan
        </button>

        <button
          className={`btn navigation-controls__button ${
            activeMode === "zoomIn"
              ? "navigation-controls__button--active"
              : "navigation-controls__button--inactive"
          }`}
          onClick={onZoomMode?.bind(null, "zoomIn")}
        >
          <ZoomIn className="w-3 h-3" />
          Zoom In
        </button>
        <button
          className={`btn navigation-controls__button ${
            activeMode === "zoomOut"
              ? "navigation-controls__button--active"
              : "navigation-controls__button--inactive"
          }`}
          onClick={onZoomMode?.bind(null, "zoomOut")}
        >
          <ZoomOut className="w-3 h-3" />
          Zoom Out
        </button>

        <div className="navigation-controls__divider"></div>

        <button
          className="btn navigation-controls__button navigation-controls__button--inactive"
          onClick={onResetView}
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default Navigation;
