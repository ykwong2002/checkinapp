import React, { useState } from 'react';
import DisplayScreen from './DisplayScreen';
import AdminPanel from './AdminPanel';
import './App.css';

function App() {
  const [view, setView] = useState('display');

  return (
    <div className="App min-h-screen">
      <nav className="flex justify-center gap-8 py-4 bg-gray-200">
        <button
          className={`px-4 py-2 rounded ${view === 'display' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-600'}`}
          onClick={() => setView('display')}
        >
          Display Screen
        </button>
        <button
          className={`px-4 py-2 rounded ${view === 'admin' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-600'}`}
          onClick={() => setView('admin')}
        >
          Admin Panel
        </button>
      </nav>
      {view === 'display' ? <DisplayScreen /> : <AdminPanel />}
    </div>
  );
}

export default App;
