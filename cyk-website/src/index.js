import React from "react";
import ReactDOM from "react-dom/client";
import CYKWebsite from './CYKWebsite.js'; // The component you want to render
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

// Renders the imported component (CYKWebsite) instead of the missing <App />
root.render(
  <React.StrictMode>
    <CYKWebsite />
  </React.StrictMode>
);
