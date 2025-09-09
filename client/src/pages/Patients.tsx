import PatientSearch from '../components/PatientSearch';
import PageLayout from '../components/PageLayout';

export default function Patients() {
  return (
    <PageLayout>
      <h1>Patients</h1>
      <PatientSearch />
    </PageLayout>
  );
}
