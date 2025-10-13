import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { WorkspaceProvider } from "./context/WorkspaceContext.jsx"; // import context

createRoot(document.getElementById("root")).render(
  <WorkspaceProvider>
    <App />
  </WorkspaceProvider>
);
