import React from 'react'
import './App.css'
import io from 'socket.io-client';
import { useRef } from 'react';
import Signup from './components/Signup';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import { Toaster } from 'sonner';
// const socket = io('http://localhost:3001'); 



function App() {

  return (
    <BrowserRouter >
    
    <div>
      <Toaster richColors position="top-center" />
      <Routes>
      <Route element={<Signup />} path="/" />
      <Route element={<Home />} path="/home" />
      </Routes>
    </div>
    </BrowserRouter>
  )
}

export default App
