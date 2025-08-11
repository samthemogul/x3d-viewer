import React, { createContext, useState } from "react";

export interface Rotation {
  x: number;
  y: number;
  z: number;
}

// Define the context value type
interface RotationContextValue {
  rotation: Rotation;
  setRotation: (rotation: Rotation) => void;
}

// Create the context
const RotationContext = createContext<RotationContextValue | undefined>(
  undefined
);

// Create a provider component
export const RotationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [rotation, setRotation] = useState<Rotation>({
    x: 0,
    y: 0,
    z: 0,
  });

  return (
    <RotationContext.Provider value={{ rotation, setRotation }}>
      {children}
    </RotationContext.Provider>
  );
};


export { RotationContext };
