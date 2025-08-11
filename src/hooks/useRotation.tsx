import { useContext } from "react";
import { RotationContext } from "../context/RotationCotext";

export const useRotation = () => {
  const context = useContext(RotationContext);
  if (!context) {
    throw new Error("useRotation must be used within a RotationProvider");
  }
  return context;
};
