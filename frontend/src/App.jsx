import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import Lobby from './components/Lobby';
import RoomPage from './pages/RoomPage';

const GlobalControls = () => {
  const { epilepsySafe, toggleEpilepsySafe } = useSettings();
  return (
    <div className="fixed top-4 right-4 z-[100] font-mono">
      <button 
        onClick={toggleEpilepsySafe} 
        className={`text-xs px-2 py-1 border ${epilepsySafe ? 'border-green-500 text-green-400 bg-black' : 'border-gray-600 text-gray-500 bg-black hover:text-white'}`}
      >
        {epilepsySafe ? '[X] SEIZURE SAFE MODE ON' : '[ ] SEIZURE SAFE MODE OFF'}
      </button>
    </div>
  );
};

function App() {
  return (
    <SettingsProvider>
      <SocketProvider>
        <BrowserRouter>
          <GlobalControls />
          <Routes>
            <Route path="/" element={<Lobby />} />
            <Route path="/room/:roomId" element={<RoomPage />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </SettingsProvider>
  );
}

export default App;
