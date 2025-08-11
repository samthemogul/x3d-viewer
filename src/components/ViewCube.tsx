import React, { useRef, useState } from "react";


export interface ViewCubeProps {
  onRotationChange?: (rotation: { x: number; y: number; z: number }) => void;
}

const ViewCube: React.FC<ViewCubeProps> = ({ onRotationChange }) => {
  const cubeRef = useRef<HTMLDivElement>(null);

  // const animationFrameId = useRef<number | null>(null);

  // State for the cube's rotation in degrees.
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [justFinishedRotating, setJustFinishedRotating] = useState(false);

  // Reference to store the last mouse position without triggering re-renders.
  const mousePositionRef = useRef({ x: 0, y: 0, z: 0 });

  // Function to handle the start of a drag.
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Stop propagation to prevent child elements from triggering their events
    e.stopPropagation();

    // Only start dragging on left mouse button click
    if (e.button !== 0) return;

    // Store the initial mouse position
    mousePositionRef.current = { x: e.clientX, y: e.clientY, z: 0 };

    // Disable the CSS transition for smooth dragging.
    if (cubeRef.current) {
      cubeRef.current.style.transition = "none";
      cubeRef.current.style.cursor = "grabbing";
    }

    let isDragging = false; // Track if dragging is happening

    // Function to handle the dragging motion.
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - mousePositionRef.current.x;
      const deltaY = e.clientY - mousePositionRef.current.y;

      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        isDragging = true; // Mark as dragging if the mouse moves significantly
      }

      // Update rotation based on mouse movement.
      setRotation((prev) => {
        const newRotation = {
          x: prev.x - deltaY * 0.5,
          y: prev.y + deltaX * 0.5,
          z: 0,
        };
        if (onRotationChange) {
          onRotationChange({
            y: newRotation.x,
            z: newRotation.y,
            x: newRotation.z, // Assuming Z is not used in this context
          });
        }
        return newRotation;
      });

      // Store the new mouse position.
      mousePositionRef.current = { x: e.clientX, y: e.clientY, z: 0 };
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

      if (!isDragging) {
        // If no dragging occurred, allow clicks to propagate
        setJustFinishedRotating(false);
      } else {
        setJustFinishedRotating(true);
      }
    };

    // Add event listeners to the document for global mouse handling.
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const highlightEdge = (edge: string) => {
    const edgeElements = document.querySelectorAll(`.cube-edge.${edge}`);
    if (edgeElements) {
      edgeElements.forEach((el) => el.classList.add("is-hover"));
    }
  };

  const unhighlightEdge = (edge: string) => {
    const edgeElements = document.querySelectorAll(`.cube-edge.${edge}`);
    if (edgeElements) {
      edgeElements.forEach((el) => el.classList.remove("is-hover"));
    }
  };

  const highLightCorner = (corner: string) => {
    const cornerElements = document.querySelectorAll(`.cube-corner.${corner}`);
    if (cornerElements) {
      cornerElements.forEach((el) => el.classList.add("is-hover"));
    }
  };

  const unhighlightCorner = (corner: string) => {
    const cornerElements = document.querySelectorAll(`.cube-corner.${corner}`);
    if (cornerElements) {
      cornerElements.forEach((el) => el.classList.remove("is-hover"));
    }
  };

  const edges: { cls: string; duplicates: number }[] = [
    { cls: "edge-front-top", duplicates: 2 },
    { cls: "edge-front-bottom", duplicates: 2 },
    { cls: "edge-front-left", duplicates: 2 },
    { cls: "edge-front-right", duplicates: 2 },
    { cls: "edge-side-top-left", duplicates: 2 },
    { cls: "edge-side-top-right", duplicates: 2 },
    { cls: "edge-side-bottom-left", duplicates: 2 },
    { cls: "edge-side-bottom-right", duplicates: 2 },
    { cls: "edge-back-top", duplicates: 2 },
    { cls: "edge-back-bottom", duplicates: 2 },
    { cls: "edge-back-left", duplicates: 2 },
    { cls: "edge-back-right", duplicates: 2 },
  ];

  const corners: string[] = [
    "corner-front-top-left",
    "corner-front-top-right",
    "corner-front-bottom-left",
    "corner-front-bottom-right",
    "corner-back-top-left",
    "corner-back-top-right",
    "corner-back-bottom-left",
    "corner-back-bottom-right",
  ];

  const orientCube = (target: string) => {
    const orientations: Record<string, { x: number; y: number; z: number }> = {
    "face-front": { x: 0, y: 0, z: 0 },
    "face-back": { x: 0, y: 180, z: 0 },
    "face-right": { x: 0, y: -90, z: 0 },
    "face-left": { x: 0, y: 90, z: 0 },
    "face-top": { x: -90, y: 0, z: 0 },
    "face-bottom": { x: 90, y: 0, z: 0 },
    "edge-front-top": { x: -45, y: 0, z: 0 },
    "edge-front-bottom": { x: 45, y: 0, z: 0 },
    "edge-front-left": { x: 0, y: 45, z: 0 },
    "edge-front-right": { x: 0, y: -45, z: 0 },
    "edge-side-top-left": { x: 0, y: 90, z: 45 }, // Requires Z-axis rotation
    "edge-side-top-right": { x: 0, y: 90, z: -45 }, // Requires Z-axis rotation
    "edge-side-bottom-left": { x: 45, y: 90, z: -45 }, // Requires Z-axis rotation
    "edge-side-bottom-right": { x: 45, y: -90, z: 45 }, // Requires Z-axis rotation
    "edge-back-top": { x: -45, y: 180, z: 0 },
    "edge-back-bottom": { x: 45, y: 180, z: 0 },
    "edge-back-left": { x: 0, y: 135, z: 0 },
    "edge-back-right": { x: 0, y: -135, z: 0 },
    "corner-front-top-left": { x: -45, y: 45, z: 45 },
    "corner-front-top-right": { x: -45, y: -45, z: -45 },
    "corner-front-bottom-left": { x: 45, y: 45, z: -45 },
    "corner-front-bottom-right": { x: 45, y: -45, z: 45 },
    "corner-back-top-left": { x: -45, y: 135, z: 45 },
    "corner-back-top-right": { x: -45, y: -135, z: -45 },
    "corner-back-bottom-left": { x: 45, y: 135, z: -45 },
    "corner-back-bottom-right": { x: 45, y: -135, z: 45 },
  };

    const orientation = orientations[target];

    // Calculate the shortest path roataton from the current orientation and update the target orientation to that quivalent shortest path rotation.
    if (!orientation) {
      console.warn(`No orientation found for target: ${target}`);
      return;
    }
    const absDiffX = Math.abs(rotation.x - orientation.x);
    const absDiffY = Math.abs(rotation.y - orientation.y);
    const xMin = Math.min(absDiffX, 360 - absDiffX);
    const YMin = Math.min(absDiffY, 360 - absDiffY);
    const xdeg =
      xMin == absDiffX
        ? rotation.x > orientation.x
          ? rotation.x - absDiffX
          : rotation.x + absDiffX
        : rotation.x < orientation.x
        ? rotation.x - (360 - absDiffX)
        : rotation.x + (360 - absDiffX);
    const ydeg =
      YMin == absDiffY
        ? rotation.y > orientation.y
          ? rotation.y - absDiffY
          : rotation.y + absDiffY
        : rotation.y < orientation.y
        ? rotation.y - (360 - absDiffY)
        : rotation.y + (360 - absDiffY);

    console.log({
      xdeg,
      ydeg,
      curr: rotation,
      orientation,
      absDiffX,
      absDiffY,
      xMin,
      YMin,
    });

    if (orientation && !justFinishedRotating) {
      setRotation({
        x: xdeg,
        y: ydeg,
        z: orientation.z,
      });
      if (onRotationChange) {
        onRotationChange({ z: ydeg, y: xdeg, x: orientation.z });
      }
      setJustFinishedRotating(false); // Reset after setting rotation
    }
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
        {/* Faces */}
        <div
          className="cube-face front"
          onClick={() => orientCube("face-front")}
        >
          FRONT
        </div>
        <div className="cube-face back" onClick={() => orientCube("face-back")}>
          BACK
        </div>
        <div
          className="cube-face right"
          onClick={() => orientCube("face-right")}
        >
          RIGHT
        </div>
        <div className="cube-face left" onClick={() => orientCube("face-left")}>
          LEFT
        </div>
        <div className="cube-face top" onClick={() => orientCube("face-top")}>
          TOP
        </div>
        <div
          className="cube-face bottom"
          onClick={() => orientCube("face-bottom")}
        >
          BOTTOM
        </div>

        {/* Edges */}
        {edges.map((edge) =>
          Array.from({ length: edge.duplicates }).map((_, i) => (
            <div
              key={`${edge.cls}-${i}`}
              className={`cube-edge ${edge.cls} e-${i + 1}`}
              onMouseEnter={() => highlightEdge(edge.cls)}
              onMouseLeave={() => unhighlightEdge(edge.cls)}
              onClick={() => orientCube(edge.cls)}
            ></div>
          ))
        )}

        {/* Corners */}
        {corners.map((corner) =>
          ["c1", "c2", "c3"].map((layer) => (
            <div
              key={`${corner}-${layer}`}
              className={`cube-corner ${corner} ${layer}`}
              onMouseEnter={() => highLightCorner(corner)}
              onMouseLeave={() => unhighlightCorner(corner)}
              onClick={() => orientCube(corner)}
            ></div>
          ))
        )}

        {/* The Axis */}
        <div className="axis axis-x">
          <div className="axis-line"></div>
          <div className="axis-label">Y</div>
        </div>
        <div className="axis axis-y">
          <div className="axis-label">X</div>
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
