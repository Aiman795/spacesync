import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import Profile from "./pages/Profile";
import CreateListing from "./pages/CreateListing";
import MyListings from "./pages/MyListings";
import Navbar from "./components/Navbar";

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar />
      <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/create-listing" element={<CreateListing />} />
      <Route path="/my-listings" element={<MyListings />} />
      <Route
        path="/"
        element={
          <>
            <section id="center">
              <div className="hero">
                <img src={heroImg} className="base" width="170" height="179" alt="" />
                <img src={reactLogo} className="framework" alt="React logo" />
                <img src={viteLogo} className="vite" alt="Vite logo" />
              </div>
              <div>
                <h1>Get started</h1>
                <p>
                  Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
                </p>
              </div>
              <button
                type="button"
                className="counter"
                onClick={() => setCount((count) => count + 1)}
              >
                Count is {count}
              </button>
              <p
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "1rem",
                  marginTop: "1rem",
                }}
              >
                <Link to="/signup">Sign Up</Link>
                <span>|</span>
                <Link to="/login">Login</Link>
                <span>|</span>
                <Link to="/create-listing">Create Listing</Link>
              </p>
            </section>
            {/* rest of your existing docs/social sections stay here as-is */}
          </>
        }
      />
      </Routes>
    </>
  )
}

export default App