import React, { createContext, useState } from "react";

// Define the types for the navigation modes
export type NavigationMode = "orbit" | "pan" | "zoomIn" | "zoomOut";

// Define the context value type
interface NavigationContextValue {
  activeMode: NavigationMode;
  setActiveMode: (mode: NavigationMode) => void;
}

// Create the context
const NavigationContext = createContext<NavigationContextValue | undefined>(
  undefined
);

// Create a provider component
export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeMode, setActiveMode] = useState<NavigationMode>("orbit");

  return (
    <NavigationContext.Provider value={{ activeMode, setActiveMode }}>
      {children}
    </NavigationContext.Provider>
  );
};

// Moved the `useNavigation` hook to a separate file to resolve the Fast Refresh issue.

export { NavigationContext };