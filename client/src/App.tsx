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
import AppointmentsPage from './pages/AppointmentsPage';
import AppointmentForm from './pages/AppointmentForm';
import AppointmentDetail from './pages/AppointmentDetail';
import Reports from './pages/Reports';
import PharmacyQueue from './pages/PharmacyQueue';
import DispenseDetail from './pages/DispenseDetail';
import PharmacyInventory from './pages/PharmacyInventory';
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
        path="/appointments"
        element={
          <RouteGuard allowedRoles={['Doctor', 'AdminAssistant']}>
            <AppointmentsPage />
          </RouteGuard>
        }
      />
      <Route
        path="/appointments/new"
        element={
          <RouteGuard allowedRoles={['AdminAssistant']}>
            <AppointmentForm />
          </RouteGuard>
        }
      />
      <Route
        path="/appointments/:id"
        element={
          <RouteGuard allowedRoles={['Doctor', 'AdminAssistant']}>
            <AppointmentDetail />
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
          <RouteGuard allowedRoles={['AdminAssistant', 'ITAdmin']}>
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
        path="/reports"
        element={
          <RouteGuard>
            <Reports />
          </RouteGuard>
        }
      />
      <Route
        path="/pharmacy/queue"
        element={
          <RouteGuard allowedRoles={['Pharmacist', 'PharmacyTech', 'InventoryManager', 'ITAdmin']}>
            <PharmacyQueue />
          </RouteGuard>
        }
      />
      <Route
        path="/pharmacy/inventory"
        element={
          <RouteGuard allowedRoles={['InventoryManager', 'ITAdmin']}>
            <PharmacyInventory />
          </RouteGuard>
        }
      />
      <Route
        path="/pharmacy/dispense/:prescriptionId"
        element={
          <RouteGuard allowedRoles={['Pharmacist', 'PharmacyTech']}>
            <DispenseDetail />
          </RouteGuard>
        }
      />
      <Route
        path="/settings"
        element={
          <RouteGuard allowedRoles={['ITAdmin']}>
            <Settings />
          </RouteGuard>
        }
      />
    </Routes>
  );
}

export default App;
