import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css'
import About from './About';
import Home from './home';

function LoginButton() {
  const handleLogin = () => {
    window.location.href = "http://localhost:5004/auth/google";
  };

  return <button onClick={handleLogin}>Login with Google</button>;
}

function App() {
  return (
    <div className="main-container">
      <Router>
        <nav id="nav">
          <Link to="/" style={{ margin: '0 1rem' }}>Home</Link>
          <Link to="/about" style={{ margin: '0 1rem' }}>About</Link>
          <LoginButton />
        </nav>
        <div className="content-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
