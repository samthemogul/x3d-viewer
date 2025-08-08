import { useEffect, useRef, useState } from "react";
import Navigation from "./Navigation";
import ViewCube from "./ViewCube";

const X3DViewer = () => {
  const [isLoading, setIsLoading] = useState(true);
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

  return (
    <div className="">
      {/* Main Area */}
      <div className="x3d-viewer__main">
        {/* Navigation */}
        <Navigation />

        {/* View Cube */}
        <ViewCube />

        {/* X3D Canvas */}
        <div className="x3d-viewer__canvas card">
          {isLoading && <div className="loader-con">Loading 3D model...</div>}
          <x3d showProgress="false" width="100%" height="100%">
            <scene>
              <viewpoint
                position="0 0 700"
                orientation="0 0 0 0"
                centerOfRotation="0 0 0"
                fieldOfView="1.0"
                description="Initial View"
              ></viewpoint>
              <transform translation="0 50 0" rotation="1 0 0 -1.4">
                <transform translation="0 0 0" rotation="0 0 1 -1.9">
                  <inline
                    ref={inlineRef}
                    url="/toddlerbot.x3d"
                    nameSpaceName="model"
                  ></inline>
                </transform>
              </transform>
            </scene>
          </x3d>
        </div>
      </div>
    </div>
  );
};

export default X3DViewer;
