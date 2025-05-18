import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Admin from './pages/Admin';
import Display from './pages/Display';
import Header from './components/Header';

function App() {
  return (
    <div className="app">
      <Header />
      <div className="container">
        <Routes>
          <Route path="/" element={<Display />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </div>
  );
}

export default App; 