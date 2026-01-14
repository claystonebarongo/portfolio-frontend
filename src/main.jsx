import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import './index.css' // <--- ADD OR ENSURE THIS LINE IS HERE
import './App.css'   // <--- ADD THIS TO LOAD YOUR NEW GRADIENT & GLASS UI



ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
