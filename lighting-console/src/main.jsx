import React from "react";
import ReactDOM from "react-dom/client";
import { PositionProvider } from './components/PositionContext';
import { WebGPUProvider } from './components/WebGPUContext';
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PositionProvider>
      <WebGPUProvider>
        <App />
      </WebGPUProvider>
    </PositionProvider>
  </React.StrictMode>
);