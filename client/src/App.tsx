import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import RouteGuard from './components/RouteGuard';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import VisitDetail from './pages/VisitDetail';
import AddVisit from './pages/AddVisit';
import Cohort from './pages/Cohort';
import Settings from './pages/Settings';
import Home from './pages/Home';
import RegisterPatient from './pages/RegisterPatient';
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
      <Route
        path="/patients/:id/visits/new"
        element={
          <RouteGuard>
            <AddVisit />
          </RouteGuard>
        }
      />
      <Route
        path="/"
        element={
          <RouteGuard>
            <Home />
          </RouteGuard>
        }
      />
      <Route
        path="/register"
        element={
          <RouteGuard>
            <RegisterPatient />
          </RouteGuard>
        }
      />
      <Route
        path="/visits/:id"
        element={
          <RouteGuard>
            <VisitDetail />
          </RouteGuard>
        }
      />
      <Route
        path="/cohort"
        element={
          <RouteGuard>
            <Cohort />
          </RouteGuard>
        }
      />
      <Route
        path="/settings"
        element={
          <RouteGuard>
            <Settings />
          </RouteGuard>
        }
      />
    </Routes>
  );
}

export default App;
