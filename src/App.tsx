import React, {useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { GameProvider } from './contexts/GameContext';
import Login from './components/Auth/Login';
import RoomList from './components/Room/RoomList';
import RoomLobby from './components/Room/RoomLobby';
import GameView from './components/Game/GameView';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './styles/globals.css';
import { Provider } from "./components/ui/provider"
import { Center } from "@chakra-ui/react"

const App: React.FC = () => {
    useEffect(() => {
        // Clear existing local storage
        localStorage.clear();
    }, []);
    return (
      <Provider>
          <AuthProvider>
            <SocketProvider>
              <GameProvider>
                <Router>
                  <div className="min-h-screen">
                      <Center>
                          <Routes>
                              <Route path="/login" element={<Login />} />
                              <Route
                                  path="/rooms"
                                  element={
                                      <ProtectedRoute>
                                          <RoomList />
                                      </ProtectedRoute>
                                  }
                              />
                              <Route
                                  path="/room/:roomId"
                                  element={
                                      <ProtectedRoute>
                                          <RoomLobby />
                                      </ProtectedRoute>
                                  }
                              />
                              <Route
                                  path="/game/:gameId"
                                  element={
                                      <ProtectedRoute>
                                          <GameView />
                                      </ProtectedRoute>
                                  }
                              />
                              <Route path="/" element={<Navigate to="/rooms" replace />} />
                          </Routes>
                      </Center>
                  </div>
                </Router>
              </GameProvider>
            </SocketProvider>
          </AuthProvider>
      </Provider>
  );
};

export default App;