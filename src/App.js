// src/App.js
import React from 'react';
import AdminHomeScreen from './components/AdminHomeScreen';
import EarnerHomeScreen from './components/EarnerHomeScreen';
import './App.css';

function App() {
  const path = window.location.pathname;

  if (path === '/EarnerHomeScreen' || path === '/earner') {
    return (
      <div className="App">
        <EarnerHomeScreen />
      </div>
    );
  }

  return (
    <div className="App">
      <AdminHomeScreen />
    </div>
  );
}

export default App;