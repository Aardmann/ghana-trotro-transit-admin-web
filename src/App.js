// src/App.js
import React from 'react';
import AdminHomeScreen from './components/AdminHomeScreen';
import EarnerHomeScreen from './components/EarnerHomeScreen';
import './App.css';

function App() {
  //const path = window.location.pathname;

  const hash = window.location.hash;

  if (hash === '#/earner') {
    return <EarnerHomeScreen />;
  }

  return <AdminHomeScreen />;

}

export default App;