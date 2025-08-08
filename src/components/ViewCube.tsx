import React, { useRef, useState } from "react";

const ViewCube: React.FC = () => {
  const cubeRef = useRef<HTMLDivElement>(null);

  // State for the cube's rotation in degrees.
  const [rotation, setRotation] = useState({ x: -20, y: 45 });

  // Reference to store the last mouse position without triggering re-renders.
  const mousePositionRef = useRef({ x: 0, y: 0 });

  // Function to handle the start of a drag.
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only start dragging on left mouse button click
    if (e.button !== 0) return;

    // Store the initial mouse position
    mousePositionRef.current = { x: e.clientX, y: e.clientY };

    // Disable the CSS transition for smooth dragging.
    if (cubeRef.current) {
      cubeRef.current.style.transition = "none";
      cubeRef.current.style.cursor = "grabbing";
    }

    // Function to handle the dragging motion.
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - mousePositionRef.current.x;
      const deltaY = e.clientY - mousePositionRef.current.y;

      // Update rotation based on mouse movement.
      setRotation((prev) => ({
        x: prev.x - deltaY * 0.5,
        y: prev.y + deltaX * 0.5,
      }));

      // Store the new mouse position.
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    // Function to handle the end of a drag.
    const handleMouseUp = () => {
      // Re-enable the transition and change cursor when dragging stops.
      if (cubeRef.current) {
        cubeRef.current.style.transition = "transform 0.5s ease-in-out";
        cubeRef.current.style.cursor = "grab";
      }

      // Remove the event listeners.
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    // Add event listeners to the document for global mouse handling.
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="view-cube">
      <style>
        {`
                   #cube-container {
                    transform: rotateX(${rotation.x}deg) rotateY(${rotation.y}deg);
                    transition: transform 0.5s ease-in-out;
                   }
                `}
      </style>
      <div id="cube-container" ref={cubeRef} onMouseDown={handleMouseDown}>
        <div className="cube-face front">FRONT</div>
        <div className="cube-face back">BACK</div>
        <div className="cube-face right">RIGHT</div>
        <div className="cube-face left">LEFT</div>
        <div className="cube-face top">TOP</div>
        <div className="cube-face bottom">BOTTOM</div>

        <div className="cube-edge edge-front-top"></div>
        <div className="cube-edge edge-front-bottom"></div>
        <div className="cube-edge edge-front-left"></div>
        <div className="cube-edge edge-front-right"></div>
        <div className="cube-edge edge-side-top-left"></div>
        <div className="cube-edge edge-side-top-right"></div>
        <div className="cube-edge edge-side-bottom-left"></div>
        <div className="cube-edge edge-side-bottom-right"></div>
        <div className="cube-edge edge-back-top"></div>
        <div className="cube-edge edge-back-bottom"></div>
        <div className="cube-edge edge-back-left"></div>
        <div className="cube-edge edge-back-right"></div>

        {/* <div className="cube-corner corner-front-top-left"></div>
        <div className="cube-corner corner-front-top-right"></div>
        <div className="cube-corner corner-front-bottom-left"></div>
        <div className="cube-corner corner-front-bottom-right"></div>
        <div className="cube-corner corner-back-top-left"></div>
        <div className="cube-corner corner-back-top-right"></div>
        <div className="cube-corner corner-back-bottom-left"></div>
        <div className="cube-corner corner-back-bottom-right"></div> */}

        {/* The Axis */}
        <div className="axis axis-x">
          <div className="axis-line"></div>
          <div className="axis-label">X</div>
        </div>
        <div className="axis axis-y">
          <div className="axis-label">Y</div>
          <div className="axis-line"></div>
        </div>
        <div className="axis axis-z">
          <div className="axis-line"></div>
          <div className="axis-label">Z</div>
        </div>
      </div>
    </div>
  );
};

export default ViewCube;
