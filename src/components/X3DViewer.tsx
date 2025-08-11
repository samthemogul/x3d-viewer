import { useEffect, useRef, useState } from "react";
import Navigation from "./Navigation";
import ViewCube from "./ViewCube";
import * as THREE from "three"; // Import THREE

const X3DViewer = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [viewCubeRotation, setViewCubeRotation] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const inlineRef = useRef<HTMLElement | null>(null);

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
    console.log(xdeg, ydeg, zdeg);
    // Adjust the x and z rotations to account for the default X3D orientation
    const adjustedXDeg = -zdeg; // Invert X-axis rotation
    const adjustedYDeg = -ydeg - 90; // Invert Y-axis rotation
    const adjustedZDeg = xdeg - 90; // Rotate Z by -90 to align with X3D

    // Convert degrees to radians
    const xRad = THREE.MathUtils.degToRad(adjustedXDeg);
    const yRad = THREE.MathUtils.degToRad(adjustedYDeg);
    const zRad = THREE.MathUtils.degToRad(adjustedZDeg);

    // Create quaternions for the rotations around the X, Y, and Z axes
    const xQuat = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      xRad
    );
    const yQuat = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yRad
    );
    const zQuat = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      zRad
    );

    // Combine the rotations by multiplying the quaternions in the correct order
    const combinedQuat = new THREE.Quaternion()
      .multiplyQuaternions(zQuat, xQuat) // Apply Z first, then X
      .multiply(yQuat); // Apply Y last

    return combinedQuat;
  };

  useEffect(() => {
    console.log(
      viewCubeRotation,
      toAxisAngleString(
        performQuaternionRotation(
          viewCubeRotation.x,
          viewCubeRotation.y,
          viewCubeRotation.z
        )
      )
    );
  }, [viewCubeRotation]);

  return (
    <div className="">
      {/* Main Area */}
      <div className="x3d-viewer__main">
        {/* Navigation */}
        <Navigation />

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
                translation="0 0 0"
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
