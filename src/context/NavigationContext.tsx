import React, { createContext, useState } from "react";


export type NavigationMode = "orbit" | "pan" | "zoom";


interface NavigationContextValue {
  activeMode: NavigationMode;
  handleSetActiveMode: (mode: NavigationMode) => void;
}


const NavigationContext = createContext<NavigationContextValue | undefined>(
  undefined
);


export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeMode, setActiveMode] = useState<NavigationMode>("orbit");

  const handleSetActiveMode = (mode: NavigationMode) => {
    setActiveMode(mode);
  }

  return (
    <NavigationContext.Provider value={{ activeMode, handleSetActiveMode }}>
      {children}
    </NavigationContext.Provider>
  );
};


export { NavigationContext };