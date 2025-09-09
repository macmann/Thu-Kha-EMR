import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import RouteGuard from './components/RouteGuard';
import './styles/App.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/patients"
        element={
          <RouteGuard>
            <Home />
          </RouteGuard>
        }
      />
      <Route path="/" element={<Navigate to="/patients" replace />} />
    </Routes>
  );
}

export default App;
