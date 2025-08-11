import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { NavigationProvider } from "./context/NavigationContext";
import { RotationProvider } from "./context/RotationCotext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NavigationProvider>
      <RotationProvider>
        <App />
      </RotationProvider>
    </NavigationProvider>
  </StrictMode>
);
