import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App"; 
import { Route, BrowserRouter, Routes } from "react-router-dom" 
import { AppProvider } from "./context";
 


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AppProvider> 
      <BrowserRouter>
                <Routes>
                    <Route path="/" element={<App />} /> 
                </Routes>
            </BrowserRouter>
    </AppProvider>
  </React.StrictMode>
);
 
