import React from "react";
import ReactDOM from "react-dom/client";
import { PositionProvider } from './components/PositionContext';
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PositionProvider>
    <App />
    </PositionProvider>
  </React.StrictMode>
);