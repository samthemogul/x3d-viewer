import { useEffect, useRef, useState } from "react";
import Navigation from "./Navigation";
import ViewCube from "./ViewCube";
import * as THREE from "three";
import { useNavigation } from "../hooks/useNavigation";
import { useRotation } from "../hooks/useRotation";

const X3DViewer = () => {
  const { activeMode, handleSetActiveMode } = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const { rotation, setRotation } = useRotation();
  const inlineRef = useRef<HTMLElement | null>(null);
  const panStartRef = useRef({ x: 0, y: 0 });
  const [panCoordinates, setPanCoordinates] = useState({ x: 0, y: 0 });

  const mainContainerRef = useRef<HTMLDivElement | null>(null);

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
    e.stopPropagation();
    if (activeMode == "pan") {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (!mainContainerRef.current?.contains(target)) return;

      mainContainerRef.current.style.cursor = "grab";

      const PAN_SPEED = 0.9;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Calculate the cursor position in normalized device coordinates (NDC)
      const startX = e.clientX - windowWidth / 2;
      const startY = e.clientY - windowHeight / 2;

      console.log(startX, startY);

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - windowWidth / 2;
        const deltaY = e.clientY - windowHeight / 2;

        const moveX = deltaX - startX;
        const moveY = deltaY - startY;

        // Get the former translation
        const xdViewer = document.getElementById("x3d-viewer");
        if (!xdViewer) return;

        // if (!currentTranslate) return;
        const currentX = panCoordinates.x;
        const currentY = panCoordinates.y;

        const newX = currentX + moveX * PAN_SPEED;
        const newY = currentY + moveY * PAN_SPEED;

        xdViewer.style.transform = `translateX(${newX}px) translateY(${newY}px)`;
        setPanCoordinates({ x: newX, y: newY });
      };

      const handleMouseUp = () => {
        mainContainerRef.current!.style.cursor = "default";
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

        setRotation((prev) => {
          const newRotation = {
            x: prev.x - deltaY * 0.5,
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
    } else return;
  };

  const handleOrbit = () => {
    handleSetActiveMode("orbit");
  };

  const handleZoom = () => {
    handleSetActiveMode("zoom");
  };

  const handlePanMode = () => {
    handleSetActiveMode("pan");
  };

  const handleReset = () => {
    const viewpointElement = document.querySelector("viewpoint");
    if (viewpointElement) {
      viewpointElement.setAttribute("position", "0 0 700");
      viewpointElement.setAttribute("orientation", "0 0 0 0");
      viewpointElement.setAttribute("centerOfRotation", "0 0 0");
    }

    // Reset the model's translation and rotation
    const transformElement = inlineRef.current?.parentElement;
    if (transformElement) {
      transformElement.setAttribute("translation", "0 0 0");
      transformElement.setAttribute(
        "rotation",
        "-0.5773502691896258 -0.5773502691896256 -0.5773502691896258 2.0943951023931953"
      );
    }

    // Reset xd-viewer translation style
    const xdViewer = document.getElementById("x3d-viewer");
    if (xdViewer) {
      xdViewer.style.transform = "translateX(0px) translateY(0px)";
    }

    setRotation({ x: 0, y: 0, z: 0 });
  };

  useEffect(() => {
    console.log(activeMode);
  }, [activeMode]);

  const handleWheel = (e: WheelEvent) => {
    // Prevent default scrolling behavior
    e.preventDefault();
    e.stopPropagation();

    const ZOOM_SPEEDX = 0.05;
    const ZOOM_SPEEDY = 0.1; // Determines how fast the zoom happens
    const MIN_ZOOM_IN = 1500; // Minimum zoom level
    const MAX_ZOOM_IN = 200; // Maximum zoom level

    if (activeMode !== "zoom") return;

    // Get the current viewpoint element
    const viewpointElement = document.querySelector("viewpoint");
    if (!viewpointElement) return;

    // Parse the current position of the viewpoint
    const currentPosition = viewpointElement
      .getAttribute("position")
      ?.split(" ")
      .map(parseFloat) || [0, 0, 700];

    // Calculate the zoom delta
    const zoomDelta = e.deltaY * ZOOM_SPEEDY;

    // Clamp the zoom level
    const newZoomLevel = currentPosition[2] + zoomDelta;

    if (newZoomLevel > MIN_ZOOM_IN || newZoomLevel < MAX_ZOOM_IN) return;

    // Get the window size
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calculate the cursor position in normalized device coordinates (NDC)
    const cursorX = -(e.clientX - (windowWidth / 2 + 50));
    const cursorY = e.clientY - (windowHeight / 2 + 50);

    // Calculate the difference to be added to both x and y from start(panCoordinates)
    const direction = {
      x: cursorX - panCoordinates.x,
      y: cursorY - panCoordinates.y,
      z: 0, // No change in z for zoom
    };

    console.log(
      `translateX(${
        panCoordinates.x + direction.x * ZOOM_SPEEDX
      }px) translateY(${panCoordinates.y + direction.y * ZOOM_SPEEDY}px)`
    );

    const xdViewer = document.getElementById("x3d-viewer");
    if (!xdViewer) return;
    // Update the xd-viewer transform
    // xdViewer.style.transform = `translateX(${
    //   panCoordinates.x + direction.x * ZOOM_SPEEDX
    // }px) translateY(${panCoordinates.y + direction.y * ZOOM_SPEEDY}px)`;
    // Update the pan coordinates
    // setPanCoordinates({
    //   x: panCoordinates.x + direction.x * ZOOM_SPEEDX,
    //   y: panCoordinates.y + direction.y * ZOOM_SPEEDY,
    // });
    // const updatedX =
    //   cursorX > currentPosition[0]
    //     ? currentPosition[0] +
    //       ZOOM_SPEEDX * Math.abs(cursorX - currentPosition[0])
    //     : cursorX == currentPosition[0]
    //     ? cursorX
    //     : currentPosition[0] -
    //       ZOOM_SPEEDX * Math.abs(cursorX - currentPosition[0]);
    // const updatedY =
    //   cursorY > currentPosition[1]
    //     ? currentPosition[1] +
    //       ZOOM_SPEEDY * Math.abs(cursorY - currentPosition[1])
    //     : cursorY == currentPosition[1]
    //     ? cursorY
    //     : currentPosition[1] -
    //       ZOOM_SPEEDY * Math.abs(cursorY - currentPosition[1]);

    // Update the viewpoint position
    viewpointElement.setAttribute(
      "position",
      `${currentPosition[0]} ${currentPosition[1]} ${newZoomLevel}`
    );
  };

  useEffect(() => {
    const container = mainContainerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel);

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [activeMode]);

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
          onZoomMode={handleZoom}
          onResetView={handleReset}
        />

        {/* View Cube */}
        <ViewCube onRotationChange={setRotation} />

        {/* X3D Canvas */}
        <div className="x3d-viewer__canvas card">
          {isLoading && <div className="loader-con">Loading 3D model...</div>}
          <x3d
            showProgress="false"
            width="100%"
            height="100%"
            id="x3d-viewer"
            style={{
              position: "absolute",
              width: "1000%",
              height: "1000%",
              transform: `translateX(0px) translateY(0px)`,
            }}
          >
            <scene>
              <viewpoint
                position="0 0 700"
                orientation={`0 0 0 0`}
                centerOfRotation={`0 0 0`}
                fieldOfView="1.1"
                description="Initial View"
              ></viewpoint>
              <transform
                style={{
                  transition: "rotation 0.5s ease-in-out",
                }}
                translation={`0 0 0`}
                rotation={toAxisAngleString(
                  performQuaternionRotation(rotation.x, rotation.y, rotation.z)
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
