import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import View from './components/View' // Maps to your dashboard screen

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Your main dashboard is the exclusive root screen */}
          <Route path='/' element={<View />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App