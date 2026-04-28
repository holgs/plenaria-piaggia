import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import PlenariaPiaggia from "./PlenariaPiaggia.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PlenariaPiaggia />
  </StrictMode>
);
