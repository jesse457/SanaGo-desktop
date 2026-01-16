import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { NetworkProvider } from "./providers/NetworkProvider";
import { ThemeProvider } from "./providers/ThemeProvider";

// Add these imports
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");
const root = createRoot(container);
root.render(
  <StrictMode>
    <ThemeProvider>
      <NetworkProvider>
        <App />
      </NetworkProvider>
    </ThemeProvider>
  </StrictMode>,
);
