import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AppRouter from "./routes/Router";
import { ThirdwebProvider } from "thirdweb/react";



ReactDOM.createRoot(document.getElementById("root")).render(
  <ThirdwebProvider>
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
  </ThirdwebProvider>
);