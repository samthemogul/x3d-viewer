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
  const viewpointRef = useRef<HTMLElement | null>(null);

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

      // const PAN_SPEED = 0.9;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Calculate the cursor position in normalized device coordinates (NDC)
      const startX = e.clientX - windowWidth / 2;
      const startY = e.clientY - windowHeight / 2;

      console.log(startX, startY);

      const start = { x: e.clientX, y: e.clientY };

      const handleMouseMove = (evt: MouseEvent) => {
        const dx = evt.clientX - start.x;
        const dy = evt.clientY - start.y;
        start.x = evt.clientX;
        start.y = evt.clientY;

        if (viewpointRef.current) {
          // Get position & orientation
          const pos = viewpointRef.current
            .getAttribute("position")
            ?.split(" ")
            .map(Number) || [0, 0, 0];
          const orientation = viewpointRef.current
            .getAttribute("orientation")
            ?.split(" ")
            .map(Number) || [0, 0, 1, 0];

          // Axis-angle to quaternion
          const axis = new THREE.Vector3(
            orientation[0],
            orientation[1],
            orientation[2]
          );
          const angle = orientation[3];
          const quat = new THREE.Quaternion().setFromAxisAngle(axis, angle);

          // Get right & up in world space
          const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quat);
          const up = new THREE.Vector3(0, 1, 0).applyQuaternion(quat);

          // Pan speed
          const PAN_SPEED = 0.5;
          const moveVec = new THREE.Vector3()
            .addScaledVector(right, -dx * PAN_SPEED)
            .addScaledVector(up, dy * PAN_SPEED);

          // Move both position & centerOfRotation
          const newPos = new THREE.Vector3(pos[0], pos[1], pos[2]).add(moveVec);
          viewpointRef.current.setAttribute(
            "position",
            `${newPos.x} ${newPos.y} ${newPos.z}`
          );

          const cor = viewpointRef.current
            .getAttribute("centerOfRotation")
            ?.split(" ")
            .map(Number) || [0, 0, 0];
          const newCOR = new THREE.Vector3(cor[0], cor[1], cor[2]).add(moveVec);
          viewpointRef.current.setAttribute(
            "centerOfRotation",
            `${newCOR.x} ${newCOR.y} ${newCOR.z}`
          );
        }
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

  
  const MIN_ZOOM_DISTANCE = 300; // closest allowed distance
  const MAX_ZOOM_DISTANCE = 1500; // farthest allowed distance
  const ZOOM_SCALE = 0.2; // fraction of current distance per 100 wheel delta
  const CENTER_SHIFT_FACTOR = 0.25; // fraction of camera move applied to centerOfRotation

  const handleWheel = (e: WheelEvent) => {
    if (
      activeMode !== "zoom" ||
      !viewpointRef.current ||
      !mainContainerRef.current
    )
      return;

    e.preventDefault();

    const container = mainContainerRef.current!;
    const rect = container.getBoundingClientRect();

    // mouse coords in NDC (-1..1)
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // viewpoint position/orientation/center
    const posAttr = viewpointRef.current
      .getAttribute("position")
      ?.split(" ")
      .map(Number) || [0, 0, 0];
    const corAttr = viewpointRef.current
      .getAttribute("centerOfRotation")
      ?.split(" ")
      .map(Number) || [0, 0, 0];
    const orientAttr = viewpointRef.current
      .getAttribute("orientation")
      ?.split(" ")
      .map(Number) || [0, 0, 1, 0];

    const positionVec = new THREE.Vector3(posAttr[0], posAttr[1], posAttr[2]);
    const corVec = new THREE.Vector3(corAttr[0], corAttr[1], corAttr[2]);

    // build quaternion safely (handle zero-angle)
    const axis = new THREE.Vector3(orientAttr[0], orientAttr[1], orientAttr[2]);
    const angle = orientAttr[3] ?? 0;
    const quat = new THREE.Quaternion();
    if (Math.abs(angle) < 1e-9 || axis.length() < 1e-9) {
      quat.identity();
    } else {
      axis.normalize();
      quat.setFromAxisAngle(axis, angle);
    }

    // compute ray direction in *view* space then rotate into world
    const fov = parseFloat(
      viewpointRef.current.getAttribute("fieldOfView") || "1.1"
    ); // radians
    const aspect = rect.width / rect.height;
    const tanFov = Math.tan(fov / 2);

    const rayDirView = new THREE.Vector3(
      ndcX * aspect * tanFov,
      ndcY * tanFov,
      -1
    ).normalize();

    const rayDirWorld = rayDirView.clone().applyQuaternion(quat).normalize();

    // current distance from camera to pivot
    const pc = positionVec.clone().sub(corVec);
    const currentDistance = pc.length() || 1;

    // desired move along the ray (signed). We use -e.deltaY so scrolling up (deltaY negative) moves camera forward.
    const sDesired = -e.deltaY * ((currentDistance * ZOOM_SCALE) / 100);

    // quick candidate new position and its distance to COR
    const candidatePos = positionVec
      .clone()
      .addScaledVector(rayDirWorld, sDesired);
    const candidateDistance = candidatePos.distanceTo(corVec);

    let sApplied = sDesired;

    // if candidateDistance is out of bounds, solve for s where distance == boundary (quadratic)
    const clampTo = (D: number) => {
      // solve s^2 + 2 b s + a = 0 where:
      // b = r · (p - c)
      // a = |p - c|^2 - D^2
      const b = rayDirWorld.dot(pc);
      const a = pc.dot(pc) - D * D;
      const disc = b * b - a;
      if (disc >= 0) {
        const sqrtDisc = Math.sqrt(disc);
        const s1 = -b + sqrtDisc;
        const s2 = -b - sqrtDisc;
        // pick the root closest to the desired move (so we stop exactly where intended if we're overshooting)
        const pick =
          Math.abs(s1 - sDesired) < Math.abs(s2 - sDesired) ? s1 : s2;
        return pick;
      } else {
        // no intersection along this ray (degenerate). fallback: place camera radially at D distance.
        const dirRadial = pc.clone().normalize(); // direction from COR to camera
        const fallbackPos = corVec.clone().add(dirRadial.multiplyScalar(D));
        // compute s that moves from current pos to fallbackPos along rayDirWorld:
        // fallbackPos = p + s * r  => s = r·(fallbackPos - p)  (approx because r is unit)
        return rayDirWorld.dot(fallbackPos.clone().sub(positionVec));
      }
    };

    if (candidateDistance < MIN_ZOOM_DISTANCE) {
      sApplied = clampTo(MIN_ZOOM_DISTANCE);
    } else if (candidateDistance > MAX_ZOOM_DISTANCE) {
      sApplied = clampTo(MAX_ZOOM_DISTANCE);
    }

    // apply movement
    const newPos = positionVec.clone().addScaledVector(rayDirWorld, sApplied);
    viewpointRef.current.setAttribute(
      "position",
      `${newPos.x} ${newPos.y} ${newPos.z}`
    );

    // move centerOfRotation slightly toward cursor for nicer feel
    if (CENTER_SHIFT_FACTOR > 0) {
      const corNew = corVec
        .clone()
        .addScaledVector(rayDirWorld, sApplied * CENTER_SHIFT_FACTOR);
      viewpointRef.current.setAttribute(
        "centerOfRotation",
        `${corNew.x} ${corNew.y} ${corNew.z}`
      );
    }
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
                ref={viewpointRef}
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
