import { useEffect, useRef, useState } from "react";
import Navigation from "./Navigation";
import ViewCube from "./ViewCube";
import * as THREE from "three"; // Import THREE
import { useNavigation } from "../hooks/useNavigation";

const X3DViewer = () => {
  const { activeMode, setActiveMode } = useNavigation(); // Use the navigation context

  const [isLoading, setIsLoading] = useState(true);
  const [viewCubeRotation, setViewCubeRotation] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const inlineRef = useRef<HTMLElement | null>(null);
  const panStartRef = useRef({ x: 0, y: 0 }); // Store initial mouse position for panning
  const mainContainerRef = useRef<HTMLDivElement | null>(null); // Ref for the main container

  useEffect(() => {
    const checkModelLoaded = () => {
      const inlineEl = inlineRef.current;
      if (!inlineEl) return false;

      return inlineEl.hasChildNodes();
    };

    const interval = setInterval(() => {
      if (checkModelLoaded()) {
        setIsLoading(false);
        clearInterval(interval);
      }
    });

    return () => clearInterval(interval);
  }, []);

  // A helper to convert a Quaternion to X3D's axis-angle string format
  const toAxisAngleString = (quat: THREE.Quaternion): string => {
    // if (quat.w === 1) {
    //   return "-0.5773502691896258 -0.5773502691896256 -0.5773502691896258 2.0943951023931953"; // No rotation, default to Y-axis with 0 angle
    // }
    const angle = 2 * Math.acos(quat.w);
    const s = Math.sqrt(1 - quat.w * quat.w);
    if (s < 0.001) {
      // If s is close to zero, axis is not well-defined
      return "0 0 1 0";
    }
    const x = quat.x / s;
    const y = quat.y / s;
    const z = quat.z / s;
    return `${x} ${y} ${z} ${angle}`;
  };

  const performQuaternionRotation = (
    xdeg: number,
    ydeg: number,
    zdeg: number
  ): THREE.Quaternion => {
    // Adjust the x and z rotations to account for the default X3D orientation
    const viewX_deg = -xdeg - 90;
    const viewY_deg = ydeg - 90;
    const viewZ_deg = zdeg;

    const modelX_rad = THREE.MathUtils.degToRad(viewX_deg);
    const modelY_rad = THREE.MathUtils.degToRad(viewZ_deg);
    const modelZ_rad = THREE.MathUtils.degToRad(viewY_deg);

    const euler = new THREE.Euler(modelX_rad, modelY_rad, modelZ_rad, "YXZ");

    const modelQuaternion = new THREE.Quaternion().setFromEuler(euler);

    return modelQuaternion;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeMode == "pan") {
      if (e.button !== 0) return;
      // Ensure the target is the model or its container
      const target = e.target as HTMLElement;
      if (!mainContainerRef.current?.contains(target)) return;
      mainContainerRef.current.style.cursor = "grab";

      panStartRef.current = { x: e.clientX, y: e.clientY };

      const PAN_SPEED = 0.9;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - panStartRef.current.x;
        const deltaY = e.clientY - panStartRef.current.y;

        // Directly update the transform's translation attribute for real-time movement
        const transformElement = inlineRef.current?.parentElement;
        if (transformElement) {
          const currentTranslation = transformElement
            .getAttribute("translation")
            ?.split(" ") || ["0", "0", "0"];
          const updatedX =
            parseFloat(currentTranslation[0]) + deltaX * PAN_SPEED;
          const updatedY =
            parseFloat(currentTranslation[1]) - deltaY * PAN_SPEED;
          transformElement.setAttribute(
            "translation",
            `${updatedX} ${updatedY} 0`
          );
        }

        panStartRef.current = { x: e.clientX, y: e.clientY };
      };

      const handleMouseUp = () => {
        mainContainerRef.current!.style.cursor = "default"; // Reset cursor style
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else if (activeMode == "orbit") {
      if (e.button !== 0) return;

      // Change cursor to indicate rotation
      if (mainContainerRef.current) {
        mainContainerRef.current.style.cursor = "grab";
      }

      const orbitStartRef = { x: e.clientX, y: e.clientY };

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - orbitStartRef.x;
        const deltaY = e.clientY - orbitStartRef.y;

        setViewCubeRotation((prev) => {
          const newRotation = {
            x: prev.x - deltaY * 0.5, // Adjust rotation speed as needed
            y: prev.y + deltaX * 0.5,
            z: prev.z,
          };

          const quaternion = performQuaternionRotation(
            newRotation.x,
            newRotation.y,
            newRotation.z
          );

          const transformElement = inlineRef.current?.parentElement;
          if (transformElement) {
            transformElement.setAttribute(
              "rotation",
              toAxisAngleString(quaternion)
            );
          }

        

          return newRotation;
        });

        orbitStartRef.x = e.clientX;
        orbitStartRef.y = e.clientY;
      };

      const handleMouseUp = () => {
        // Reset cursor style
        if (mainContainerRef.current) {
          mainContainerRef.current.style.cursor = "default";
        }

        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else if (activeMode == "zoomIn") {
      // Do Something
    } else if (activeMode == "zoomOut") {
      // Do Something
    } else return;
  };

  const handleOrbit = () => {
    setActiveMode("orbit");
  };

  const handleZoom = (mode: "zoomIn" | "zoomOut") => {
    setActiveMode(mode);
  };

  const handlePanMode = () => {
    setActiveMode("pan");
  };

  return (
    <div className="">
      {/* Main Area */}
      <div
        className="x3d-viewer__main"
        ref={mainContainerRef}
        onMouseDown={handleMouseDown}
      >
        {/* Navigation */}
        <Navigation
          onOrbitMode={handleOrbit}
          onPanMode={handlePanMode}
          onZoomMode={(m) => handleZoom(m)}
        />

        {/* View Cube */}
        <ViewCube onRotationChange={setViewCubeRotation} />

        {/* X3D Canvas */}
        <div className="x3d-viewer__canvas card">
          {isLoading && <div className="loader-con">Loading 3D model...</div>}
          <x3d showProgress="false" width="100%" height="100%">
            <scene>
              <viewpoint
                position="0 0 700"
                orientation={`0 0 0 0`}
                centerOfRotation="0 0 0"
                fieldOfView="1.1"
                description="Initial View"
              ></viewpoint>
              <transform
                style={{
                  transition: "rotation 0.5s ease-in-out",
                }}
                translation={`0 0 0`} // Apply panning offset
                rotation={toAxisAngleString(
                  performQuaternionRotation(
                    viewCubeRotation.x,
                    viewCubeRotation.y,
                    viewCubeRotation.z
                  )
                )}
              >
                <inline
                  ref={inlineRef}
                  url="/toddlerbot.x3d"
                  nameSpaceName="model"
                ></inline>
              </transform>
            </scene>
          </x3d>
        </div>
      </div>
    </div>
  );
};

export default X3DViewer;
