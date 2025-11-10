import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
// import Dashboard from "./components/Dashboard";
import QRCodeGenerator from "./components/QRCodeGenerator";
// import AdminPanel from "./components/AdminPanel";

const App = () => {
  return (
    // <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        {/* <div className="container mx-auto mt-6"> */}
          <Routes>
            {/* <Route path="/" element={<Dashboard />} /> */}
            <Route path="/" element={<QRCodeGenerator />} />
            {/* <Route path="/admin" element={<AdminPanel />} /> */}
          </Routes>
        {/* </div> */}
      </div>
    //  </Router>
  );
};

export default App;
