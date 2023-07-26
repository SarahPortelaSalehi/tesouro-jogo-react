import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";

import { ToastContainer } from "react-toastify";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <>
      <App />
      <ToastContainer theme="colored" autoClose={2000} pauseOnHover={false} pauseOnFocusLoss={false}/>
    </>
  </React.StrictMode>
);
