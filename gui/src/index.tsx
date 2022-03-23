import React from "react";
import ReactDOM from "react-dom";
import { Contract, Home } from "./components"
import { HashRouter, Routes, Route } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:contract" element={<Contract />} />
          <Route path="/:contract/:method" element={<Contract />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
