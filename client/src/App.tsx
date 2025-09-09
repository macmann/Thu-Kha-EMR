import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RouteGuard from './components/RouteGuard';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import VisitDetail from './pages/VisitDetail';
import './styles/App.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/patients"
        element={
          <RouteGuard>
            <Patients />
          </RouteGuard>
        }
      />
      <Route
        path="/patients/:id"
        element={
          <RouteGuard>
            <PatientDetail />
          </RouteGuard>
        }
      />
      <Route path="/" element={<Navigate to="/patients" replace />} />
      <Route
        path="/visits/:id"
        element={
          <RouteGuard>
            <VisitDetail />
          </RouteGuard>
        }
      />
    </Routes>
  );
}

export default App;
